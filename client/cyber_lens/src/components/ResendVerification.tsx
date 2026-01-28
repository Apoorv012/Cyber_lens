import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ResendVerification({ email }: { email: string }) {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cooldown) return;

    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function resend() {
    try {
      setLoading(true);
      await axios.post(`${API}/auth/resend-verification`, { email });
      setCooldown(60);
    } catch (err) {
      console.error("Failed to resend verification", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={cooldown > 0 || loading}
      onClick={resend}
      className="text-blue-600 underline disabled:text-gray-400"
    >
      {cooldown > 0
        ? `Resend in ${cooldown}s`
        : loading
        ? "Sending..."
        : "Resend verification email"}
    </button>
  );
}
