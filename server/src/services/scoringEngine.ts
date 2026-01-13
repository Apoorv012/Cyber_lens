import type { ProviderExecutionResult, ProviderExecutionStatus } from "./providerExecutor";

export type ProviderVerdict = "benign" | "suspicious" | "malicious" | "unknown";
export type ProviderConfidence = "low" | "medium" | "high";
export type TrustLevel = "low" | "medium" | "high";
export type FinalVerdict = "benign" | "suspicious" | "malicious" | "unknown";

export interface ProviderSignal {
  provider: string;
  verdict: ProviderVerdict;
  confidence: ProviderConfidence;
  trustLevel: TrustLevel;
  status: ProviderExecutionStatus;
}

export interface ProviderTrustConfig {
  [providerName: string]: TrustLevel;
}

export interface ScoringConfig {
  providerTrust: ProviderTrustConfig;
  defaultTrustLevel: TrustLevel;
}

export interface ScoringInput {
  providers: ProviderExecutionResult<NormalizedProviderResponse>[];
  config?: ScoringConfig;
}

export interface NormalizedProviderResponse {
  provider_name: string;
  verdict: ProviderVerdict;
  confidence: ProviderConfidence;
  score?: number;
  summary?: string;
  tags?: string[];
}

export interface ScoringResult {
  finalScore: number | null;
  verdict: FinalVerdict;
  processedProviders: ProcessedProvider[];
  meta: {
    totalProviders: number;
    successfulProviders: number;
    failedProviders: number;
    timedOutProviders: number;
    singleProviderMode: boolean;
    hasConflictingSignals: boolean;
  };
}

export interface ProcessedProvider {
  provider: string;
  status: ProviderExecutionStatus;
  normalizedScore: number | null;
  effectiveWeight: number | null;
  verdict: ProviderVerdict | null;
  confidence: ProviderConfidence | null;
  trustLevel: TrustLevel | null;
}

const VERDICT_SCORES: Record<ProviderVerdict, number> = {
  malicious: 100,
  suspicious: 60,
  unknown: 30,
  benign: 0,
};

const TRUST_WEIGHTS: Record<TrustLevel, number> = {
  high: 1.0,
  medium: 0.7,
  low: 0.5,
};

const CONFIDENCE_MULTIPLIERS: Record<ProviderConfidence, number> = {
  high: 1.0,
  medium: 0.75,
  low: 0.5,
};

const VERDICT_THRESHOLDS = {
  benign: { min: 0, max: 29 },
  suspicious: { min: 30, max: 69 },
  malicious: { min: 70, max: 100 },
} as const;

const DEFAULT_CONFIG: ScoringConfig = {
  providerTrust: {},
  defaultTrustLevel: "medium",
};

function getProviderTrustLevel(providerName: string, config: ScoringConfig): TrustLevel {
  return config.providerTrust[providerName] ?? config.defaultTrustLevel;
}

function normalizeVerdictToScore(verdict: ProviderVerdict): number {
  return VERDICT_SCORES[verdict] ?? VERDICT_SCORES.unknown;
}

function calculateEffectiveWeight(
  trustLevel: TrustLevel,
  confidence: ProviderConfidence
): number {
  const trustWeight = TRUST_WEIGHTS[trustLevel];
  const confidenceMultiplier = CONFIDENCE_MULTIPLIERS[confidence];
  return trustWeight * confidenceMultiplier;
}

function mapScoreToVerdict(score: number, hasConflictingSignals: boolean): FinalVerdict {
  if (hasConflictingSignals && score >= VERDICT_THRESHOLDS.suspicious.min && score <= VERDICT_THRESHOLDS.suspicious.max) {
    return "suspicious";
  }
  if (score >= VERDICT_THRESHOLDS.malicious.min) return "malicious";
  if (score >= VERDICT_THRESHOLDS.suspicious.min) return "suspicious";
  return "benign";
}

function extractProviderSignal(
  result: ProviderExecutionResult<NormalizedProviderResponse>,
  config: ScoringConfig
): ProviderSignal | null {
  if (result.status !== "success" || !result.data) {
    return null;
  }

  const data = result.data;
  const verdict: ProviderVerdict = data.verdict ?? "unknown";
  const confidence: ProviderConfidence = data.confidence ?? "medium";
  const trustLevel = getProviderTrustLevel(result.provider, config);

  return {
    provider: result.provider,
    verdict,
    confidence,
    trustLevel,
    status: result.status,
  };
}

export function computeScore(input: ScoringInput): ScoringResult {
  const { providers, config = DEFAULT_CONFIG } = input;

  const totalProviders = providers.length;
  let successfulProviders = 0;
  let failedProviders = 0;
  let timedOutProviders = 0;

  const processedProviders: ProcessedProvider[] = [];
  const validSignals: Array<{ normalizedScore: number; effectiveWeight: number }> = [];

  for (const result of providers) {
    if (result.status === "success") {
      successfulProviders++;
    } else if (result.status === "timeout") {
      timedOutProviders++;
    } else {
      failedProviders++;
    }

    const signal = extractProviderSignal(result, config);

    if (signal) {
      const normalizedScore = normalizeVerdictToScore(signal.verdict);
      const effectiveWeight = calculateEffectiveWeight(signal.trustLevel, signal.confidence);

      validSignals.push({ normalizedScore, effectiveWeight });

      processedProviders.push({
        provider: result.provider,
        status: result.status,
        normalizedScore,
        effectiveWeight,
        verdict: signal.verdict,
        confidence: signal.confidence,
        trustLevel: signal.trustLevel,
      });
    } else {
      processedProviders.push({
        provider: result.provider,
        status: result.status,
        normalizedScore: null,
        effectiveWeight: null,
        verdict: null,
        confidence: null,
        trustLevel: null,
      });
    }
  }

  if (validSignals.length === 0) {
    return {
      finalScore: null,
      verdict: "unknown",
      processedProviders,
      meta: {
        totalProviders,
        successfulProviders,
        failedProviders,
        timedOutProviders,
        singleProviderMode: false,
        hasConflictingSignals: false,
      },
    };
  }

  const singleProviderMode = validSignals.length === 1;

  const sumWeights = validSignals.reduce((sum, s) => sum + s.effectiveWeight, 0);

  if (sumWeights === 0) {
    return {
      finalScore: null,
      verdict: "unknown",
      processedProviders,
      meta: {
        totalProviders,
        successfulProviders,
        failedProviders,
        timedOutProviders,
        singleProviderMode,
        hasConflictingSignals: false,
      },
    };
  }

  const sumWeightedScores = validSignals.reduce(
    (sum, s) => sum + s.normalizedScore * s.effectiveWeight,
    0
  );

  const finalScore = Math.round(sumWeightedScores / sumWeights);
  const clampedScore = Math.max(0, Math.min(100, finalScore));

  const scores = validSignals.map(s => s.normalizedScore);
  const hasHighThreat = scores.some(s => s >= 70);
  const hasLowThreat = scores.some(s => s <= 29);
  const hasConflictingSignals = hasHighThreat && hasLowThreat;

  const verdict = mapScoreToVerdict(clampedScore, hasConflictingSignals);

  return {
    finalScore: clampedScore,
    verdict,
    processedProviders,
    meta: {
      totalProviders,
      successfulProviders,
      failedProviders,
      timedOutProviders,
      singleProviderMode,
      hasConflictingSignals,
    },
  };
}
