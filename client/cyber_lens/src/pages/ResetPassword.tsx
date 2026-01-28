import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { httpJson } from "../utils/httpClient";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!password || password.length < 8)
      return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validation = validate();
    if (validation) return setError(validation);
    setLoading(true);
    try {
      await httpJson("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setError(err?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
        <div className="max-w-md w-full border border-neutral-800 bg-neutral-900 rounded-xl shadow-xl p-8 text-center">
          <img
            src="https://cdn.pixabay.com/photo/2022/07/04/01/58/hook-7300191_1280.png"
            alt="Success"
            className="mx-auto mb-4 w-16 h-16"
          />
          <h2 className="text-2xl font-bold mb-4">Password reset successful</h2>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="max-w-md w-full border border-neutral-800 bg-neutral-900 rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Set a new password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-neutral-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base bg-neutral-950 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              placeholder="********"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-neutral-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 text-base bg-neutral-950 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              placeholder="********"
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
