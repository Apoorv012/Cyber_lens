import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Analytics: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth state from local storage.
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 text-cyan-500">
            <i className="fa-solid fa-lock text-2xl" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="text-neutral-400 mb-8">
            You need to log in to view analytics. Access detailed insights and
            threat intelligence data.
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

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analytics Overview Placeholder */}
          <div className="col-span-1 lg:col-span-3 border border-neutral-800 bg-neutral-900 p-6 rounded-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-cyan-400">Overview</h3>
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Last 30 Days
              </span>
            </div>
            <div className="h-48 flex items-center justify-center border border-dashed border-neutral-800 bg-neutral-950/50 rounded">
              <p className="text-neutral-500 text-sm">
                Analytics overview chart will appear here.
              </p>
            </div>
          </div>

          {/* Insights Placeholder */}
          <div className="col-span-1 border border-neutral-800 bg-neutral-900 p-6 rounded-sm">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">
              Recent Insights
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse bg-neutral-950/50 rounded border border-neutral-800/50"
                ></div>
              ))}
            </div>
            <p className="text-center text-neutral-500 text-xs mt-4">
              Insights coming soon
            </p>
          </div>

          {/* Activity Placeholder */}
          <div className="col-span-1 border border-neutral-800 bg-neutral-900 p-6 rounded-sm">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">
              Global Activity
            </h3>
            <div className="h-64 flex flex-col justify-center items-center gap-3 border border-dashed border-neutral-800 bg-neutral-950/50 rounded text-center p-4">
              <i className="fa-solid fa-globe text-neutral-700 text-3xl"></i>
              <p className="text-neutral-500 text-sm">
                Your analytics will appear here once available.
              </p>
            </div>
          </div>

          {/* System Health Placeholder */}
          <div className="col-span-1 border border-neutral-800 bg-neutral-900 p-6 rounded-sm">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">
              System Health
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1 text-neutral-400">
                  <span>API Latency</span>
                  <span>-- ms</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-800 w-1/2"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-neutral-400">
                  <span>Database Load</span>
                  <span>-- %</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-800 w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
