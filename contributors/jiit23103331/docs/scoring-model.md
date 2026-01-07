# Cyber Lens

### 1. Abstract
Cyber Lens is a multi-source threat analysis system designed to evaluate Indicators of Compromise (IOCs).

- Aggregates detection results from multiple threat-intelligence providers
- Computes a unified numeric threat score
- Produces a final verdict: Benign, Suspicious, or Malicious

This approach reduces reliance on any single security provider.

### 2. Objective
The project aims to provide reliable and explainable IOC classification.

- Correlate signals from independent threat sources
- Minimize false positives and false negatives
- Deliver a clear, actionable verdict

The system prioritizes consensus over isolated detections.

### 3. System Workflow
1) Accept IOC input (hash, URL, IP, domain)
2) Query configured threat-intelligence providers
3) Normalize responses and handle failures
4) Generate verdict and store results

### 4. Inputs Description
|Field | Description |
|------|-------------|
|IOC | Artifact under analysis (hash, URL, IP, domain) |
|Provider Name |	Source of the threat intelligence |
|Detection Result |	benign / suspicious / malicious |
|Provider Confidence |	Self-reported reliability score |
|Provider Reliability |	Based on past records, or news |
|Response Status |	success / timeout / error / unsupported |

### 5. Scoring [ Thought process ]
Threat evaluation is based on collective intelligence rather than individual judgments.
- No single provider determines the final outcome
- Majority agreement increases confidence in the result
- Provider confidence and reliability influence contribution weight
- Inconclusive or missing responses reduce certainty, not validity

The system favors consistent patterns across sources

### 6. Threat Scoring Model
Each provider response is converted into a weighted numeric contribution.

|Detection Result | Base Score|
|-----------------|-----------|
|Benign	| 0 |
|Suspicious |	Mid-range |
|Malicious |	High |

- Base score × provider confidence × provider reliability
- Failed or timed-out providers contribute zero weight
- Aggregated score is normalized to a fixed range (e.g., 0–100)

### 7. Verdict Thresholds
Final verdicts are derived from the normalized threat score.

| Score Range |	Verdict |
| ----------- | ------ |
| Low |	Benign |
| Medium |	Suspicious |
| High	| Malicious |

Threshold values are configurable.

### 8. Example Scenarios
#### Scenario 1: Predominantly Benign Signals
- Most providers classify the IOC as benign with moderate to high confidence
- Few or no providers report suspicious or malicious activity
- Aggregated score remains below the lower threshold
- Final Verdict: Benign
#### Scenario 2: Predominantly Suspicious Signals
- Majority of providers flag the IOC as suspicious
- No strong malicious detections, but consistent uncertainty exists
- Aggregated score falls within the mid-range
- Final Verdict: Suspicious
#### Scenario 3: Contradicting Signals
- Some providers report malicious activity with high confidence
- Others classify the same IOC as benign or suspicious
- Weighted scoring balances confidence and reliability
- Final Verdict: Suspicious

### 9. Edge Cases
| Edge Case                          | Resolution Strategy                                  |
| ---------------------------------- | ---------------------------------------------------- |
| Single provider available          | Verdict derived with less confidence    |
| All providers timeout              | Return inconclusive result with retry recommendation |
| Mixed benign and malicious signals | Apply weighted consensus to avoid dominance          |
| High-confidence minority           | Elevate score without forcing malicious verdict      |


### 10. Future Scope
- IOC relationship graphs and correlation
- Verdict explainability and reason codes
- Real-time streaming and alerting

