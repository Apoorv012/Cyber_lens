import React, { useState } from "react";
import { httpJson } from "../utils/httpClient";

const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await httpJson("/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
        <div className="max-w-md w-full border border-neutral-800 bg-neutral-900 rounded-xl shadow-xl p-8 text-center">
          <img
            src="https://cdn.pixabay.com/photo/2022/07/04/01/58/hook-7300191_1280.png"
            alt="Success"
            className="mx-auto mb-4 w-16 h-16"
          />
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          <p>
            If an account exists for this email, a reset link has been sent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="max-w-md w-full border border-neutral-800 bg-neutral-900 rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Reset your password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-neutral-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-base bg-neutral-950 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm flex items-center gap-2">
              <img
                src="https://img.freepik.com/premium-vector/red-cross-icon-white-x-symbol-red-circle-error-cancel-sign_797523-4248.jpg?semt=ais_hybrid&w=740&q=80"
                alt="Error"
                className="w-5 h-5"
              />
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-base font-medium bg-cyan-500 text-neutral-950 hover:bg-cyan-400 disabled:bg-neutral-700 disabled:text-neutral-500 transition-colors"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
