import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    setError("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-neutral-800 bg-neutral-900 p-8">
        <h1 className="text-2xl font-semibold mb-2">
          Log in to <span className="text-cyan-400">CyberLens</span>
        </h1>

        <p className="text-sm text-neutral-400 mb-6">
          Optional account access for saved history and future features.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-400 border border-red-900 bg-red-950 p-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            type="submit"
            className="w-full px-4 py-3 bg-cyan-500 text-neutral-950 font-semibold hover:bg-cyan-400 transition-colors"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
