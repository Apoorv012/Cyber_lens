import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  email: string;
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthState = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("userEmail");

    if (token && email) {
      setUser({ email, token });
    } else {
      setUser(null);
    }
  }, []);

  // Check auth state on mount
  useEffect(() => {
    checkAuthState();
    setIsLoading(false);
  }, [checkAuthState]);

  // Listen for auth changes (multi-tab + same-tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "userEmail") {
        checkAuthState();
      }
    };

    const handleAuthStateChange = () => {
      checkAuthState();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-state-changed", handleAuthStateChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-state-changed", handleAuthStateChange);
    };
  }, [checkAuthState]);

  const login = useCallback((email: string, token: string) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userEmail", email);
    setUser({ email, token });
    window.dispatchEvent(new Event("auth-state-changed"));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    setUser(null);
    window.dispatchEvent(new Event("auth-state-changed"));
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
}
