import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpJson } from "../utils/httpClient";

type VerificationCacheEntry =
  | { status: "success" | "already"; message: string }
  | { status: "error" | "missing"; message: string };

const processedEmailTokens = new Map<string, VerificationCacheEntry>();

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<
    "loading" | "success" | "already" | "error" | "missing"
  >("loading");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("missing");
      setMessage("Verification token is missing from the URL.");
      return;
    }
    const cached = processedEmailTokens.get(token);
    if (cached) {
      setStatus(
        cached.status === "success"
          ? "success"
          : cached.status === "already"
            ? "already"
            : cached.status,
      );
      setMessage(cached.message);
      if (cached.status === "success" || cached.status === "already") {
        setTimeout(() => navigate("/login"), 2000);
      }
      return;
    }

    setStatus("loading");
    let cancelled = false;
    httpJson<{ status: string; message?: string }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
    )
      .then((res) => {
        if (cancelled) return;

        if (res.status === "verified") {
          setStatus("success");
          const msg = "Your email has been verified successfully.";
          processedEmailTokens.set(token, { status: "success", message: msg });
          setMessage(msg);
          setTimeout(() => navigate("/login"), 2000);
        } else if (res.status === "already_verified") {
          setStatus("already");
          const msg = "Your email is already verified.";
          processedEmailTokens.set(token, { status: "already", message: msg });
          setMessage(msg);
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setStatus("error");
          const msg = res.message || "Invalid or expired verification token.";
          processedEmailTokens.set(token, { status: "error", message: msg });
          setMessage(msg);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        const msg = err.message || "Invalid or expired verification token.";
        processedEmailTokens.set(token, { status: "error", message: msg });
        setMessage(msg);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="border border-neutral-800 bg-neutral-900 rounded-xl shadow-xl p-8 sm:p-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Email Verification</h1>
          {status === "loading" && (
            <div className="my-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
              <p>Verifying your email...</p>
            </div>
          )}
          {status === "success" && (
            <div className="my-8">
              <img
                src="https://cdn.pixabay.com/photo/2022/07/04/01/58/hook-7300191_1280.png"
                alt="Success"
                className="mx-auto mb-4 w-16 h-16"
              />
              <p className="text-green-400 text-lg font-semibold mb-2">
                {message}
              </p>
              <p className="text-neutral-400">Redirecting to login...</p>
            </div>
          )}
          {status === "already" && (
            <div className="my-8">
              <p className="text-cyan-400 text-lg font-semibold mb-2">
                {message}
              </p>
              <p className="text-neutral-400">Redirecting to login...</p>
            </div>
          )}
          {status === "error" && (
            <div className="my-8">
              <img
                src="https://img.freepik.com/premium-vector/red-cross-icon-white-x-symbol-red-circle-error-cancel-sign_797523-4248.jpg?semt=ais_hybrid&w=740&q=80"
                alt="Error"
                className="mx-auto mb-4 w-16 h-16"
              />
              <p className="text-red-400 text-lg font-semibold mb-2">
                {message}
              </p>
              <a
                href="/login"
                className="text-cyan-300 hover:text-cyan-200 underline"
              >
                Go to Login
              </a>
            </div>
          )}
          {status === "missing" && (
            <div className="my-8">
              <p className="text-red-400 text-lg font-semibold mb-2">
                {message}
              </p>
              <a
                href="/login"
                className="text-cyan-300 hover:text-cyan-200 underline"
              >
                Go to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
