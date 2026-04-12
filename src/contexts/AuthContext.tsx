import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface User {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  /** legacy: kept for components still calling login(email, password) — no-op password */
  login: (email: string, _password?: string) => boolean;
  signup: (name: string, email: string, _password?: string) => boolean;
  /** Real OTP flow */
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data && (data as { error?: string }).error) || `Request failed (${res.status})`);
  return data as T;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Hydrate session from /api/auth/me
  useEffect(() => {
    let mounted = true;
    api<{ user: User | null }>("/api/auth/me")
      .then(({ user }) => mounted && setUser(user))
      .catch(() => mounted && setUser(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const requestOtp = useCallback(async (email: string) => {
    await api<{ ok: true; remaining?: number }>("/api/auth/otp-send", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    const { user: u } = await api<{ user: User }>("/api/auth/otp-verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    setUser(u);
    return u;
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const { user: u } = await api<{ user: User }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    // Fire the server logout in parallel with the animation so the UX feels
    // identical to the original Lovable design (1.5s animated farewell).
    const serverCall = api("/api/auth/logout", { method: "POST" }).catch(() => {});
    const animation = new Promise((r) => setTimeout(r, 1500));
    await Promise.all([serverCall, animation]);
    setUser(null);
    setIsLoggingOut(false);
  }, []);

  // Legacy stubs so existing pages compile until migrated
  const login = (_email: string, _password?: string) => false;
  const signup = (_name: string, _email: string, _password?: string) => false;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, requestOtp, verifyOtp, loginWithGoogle, logout, isLoggingOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
