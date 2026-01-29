import React, { useState, useRef } from "react";
import { httpJson } from "../utils/httpClient";

const COOLDOWN_SECONDS = 60;

const SentEmail: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Read email from query params (Vite-safe)
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email") || "user@example.com";

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage("");
    try {
      await httpJson<{ status: string }>("/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCooldown(COOLDOWN_SECONDS);
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setMessage("Verification email resent. Please check your inbox.");
    } catch (err: any) {
      setMessage(err?.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg lg:max-w-xl">
        {/* Card */}
        <div className="border border-neutral-800 bg-neutral-900 rounded-xl shadow-xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-5">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-2xl font-bold text-slate-100">
                Cyber <span className="text-cyan-500">Lens</span>
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight mb-3">
              Check your email
            </h1>
            <p className="text-base text-neutral-400">
              We've sent a verification link to your email
            </p>
          </div>

          {/* Email Display */}
          <div className="mb-8 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-base font-mono text-neutral-300">
                {email}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center mt-0.5">
                <span className="text-xs text-cyan-400">1</span>
              </div>
              <p className="text-base text-neutral-300">
                Open your email inbox and find the verification message from
                CyberLens
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center mt-0.5">
                <span className="text-xs text-cyan-400">2</span>
              </div>
              <p className="text-base text-neutral-300">
                Click the verification link to activate your account
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center mt-0.5">
                <span className="text-xs text-cyan-400">3</span>
              </div>
              <p className="text-base text-neutral-300">
                Return to CyberLens to access your threat intelligence dashboard
              </p>
            </div>
          </div>

          {/* Resend */}
          <button
            onClick={handleResendEmail}
            disabled={isResending || cooldown > 0}
            className="w-full px-4 py-3 text-base font-medium bg-cyan-500 text-neutral-950 hover:bg-cyan-400 disabled:bg-neutral-700 disabled:text-neutral-500 transition-colors"
          >
            {isResending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend verification email"}
          </button>
          {message && (
            <div className="mt-3 text-center text-cyan-400 text-sm">
              {message}
            </div>
          )}

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-400">
              Didn't receive the email? Check your spam folder or try resending
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-base font-medium text-neutral-300">
              <a
                href="/login"
                className="text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                Back to sign in
              </a>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-400">
              For security reasons, this link will expire in 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentEmail;
