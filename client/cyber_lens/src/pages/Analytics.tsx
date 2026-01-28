import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { httpJson } from "../utils/httpClient";
import { useAuth } from "../hooks/useAuth";

type AnalyticsResponse = {
  total_lookups: number;
  unique_iocs: number;
  ioc_type_breakdown: {
    ip: number;
    domain: number;
    url: number;
    hash: number;
  };
  recent_lookups: {
    ioc_value: string;
    ioc_type: string;
    timestamp: string;
  }[];
};

type ErrorState = "unauthorized" | "not-verified" | "error" | null;

const Analytics: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [errorState, setErrorState] = useState<ErrorState>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user?.token || !isAuthenticated) {
      setLoading(false);
      setErrorState("unauthorized");
      return;
    }

    setLoading(true);
    setErrorState(null);

    httpJson<AnalyticsResponse>("/analytics/summary", { auth: true })
      .then((payload) => {
        setData(payload);
        setErrorState(null);
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Failed to load analytics";
        const lower = message.toLowerCase();

        if (lower.includes("not verified")) {
          setErrorState("not-verified");
          setErrorMessage(
            "Please verify your email to access analytics. Check your inbox for the verification link.",
          );
        } else if (
          lower.includes("unauthorized") ||
          lower.includes("jwt") ||
          lower.includes("401")
        ) {
          setErrorState("unauthorized");
          setErrorMessage("Your session expired. Please sign in again.");
          logout();
        } else {
          setErrorState("error");
          setErrorMessage(message);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAuthLoading, user?.token, logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  if (errorState === "unauthorized") {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 text-cyan-500">
            <i className="fa-solid fa-lock text-2xl" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Access Restricted</h1>
          <p className="text-neutral-400 mb-6">
            {errorMessage || "You need to log in to view analytics."}
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-cyan-500 text-neutral-950 font-semibold hover:bg-cyan-400 transition-colors rounded"
          >
            Log In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (errorState === "not-verified") {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <div className="max-w-lg text-center border border-neutral-800 bg-neutral-900 p-8 rounded">
          <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400">
            <i className="fa-solid fa-envelope-circle-check text-2xl" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-neutral-300 mb-4">{errorMessage}</p>
          <p className="text-sm text-neutral-400 mb-6">
            Verification was sent to {user?.email || "your email"}. Check your inbox or spam
            folder, then return to continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/check-email?email=${encodeURIComponent(user?.email || "")}`}
              className="px-6 py-2 bg-cyan-500 text-neutral-950 font-medium hover:bg-cyan-400 transition-colors rounded"
            >
              Go to email instructions
            </Link>
            <Link
              to="/"
              className="px-6 py-2 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition-colors rounded"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (errorState === "error") {
    return (
      <div className="min-h-screen bg-neutral-950 text-red-400 flex items-center justify-center px-4 text-center">
        {errorMessage || "Failed to load analytics"}
      </div>
    );
  }

  if (!data || data.total_lookups === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center px-4">
        No analytics data available yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Analytics <span className="text-cyan-400">Hub</span>
          </h1>
          <p className="text-neutral-400">
            Overview of threat detection activity and system performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overview */}
          <div className="col-span-1 lg:col-span-3 border border-neutral-800 bg-neutral-900 p-6 rounded-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Total Lookups" value={data.total_lookups} />
              <StatCard title="Unique IOCs Queried" value={data.unique_iocs} />
            </div>
          </div>

          {/* Breakdown */}
          <div className="border border-neutral-800 bg-neutral-900 p-6 rounded-sm">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">
              IOC Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <BreakdownRow label="IP" value={data.ioc_type_breakdown.ip} />
              <BreakdownRow label="Domain" value={data.ioc_type_breakdown.domain} />
              <BreakdownRow label="URL" value={data.ioc_type_breakdown.url} />
              <BreakdownRow label="Hash" value={data.ioc_type_breakdown.hash} />
            </div>
          </div>

          {/* Recent Lookups */}
          <div className="col-span-1 lg:col-span-2 border border-neutral-800 bg-neutral-900 p-6 rounded-sm">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">
              Recent Lookups
            </h3>

            {data.recent_lookups.length === 0 ? (
              <p className="text-neutral-500 text-sm">
                No recent lookups found.
              </p>
            ) : (
              <div className="space-y-3">
                {data.recent_lookups.map((item, i) => (
                  <div
                    key={i}
                    className="border border-neutral-800 bg-neutral-950 p-3 rounded text-sm"
                  >
                    <div className="font-mono break-all text-cyan-400">
                      {item.ioc_value}
                    </div>
                    <div className="flex justify-between text-neutral-500 mt-1">
                      <span className="capitalize">{item.ioc_type}</span>
                      <span>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border border-neutral-800 bg-neutral-950 p-5 rounded-sm">
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="text-3xl font-bold text-cyan-400 mt-1">{value}</p>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between border-b border-neutral-800 pb-1">
      <span className="text-neutral-400">{label}</span>
      <span className="text-cyan-400 font-semibold">{value}</span>
    </div>
  );
}

export default Analytics;