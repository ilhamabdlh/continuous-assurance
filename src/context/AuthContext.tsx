import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ca-auth-session";

export interface AuthUser {
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadSession());

  const login = useCallback(async (email?: string, password?: string) => {
    await new Promise((r) => setTimeout(r, 280));
    const trimmed = (email ?? "").trim().toLowerCase();
    // Demo: empty credentials → instant guest session
    const finalEmail = trimmed.includes("@") ? trimmed : "demo@northwindlog.com";
    if (trimmed && !trimmed.includes("@")) {
      return { ok: false, error: "Enter a valid work email." };
    }
    if (password && password.length > 0 && password.length < 4) {
      return { ok: false, error: "Password must be at least 4 characters (demo)." };
    }
    const next: AuthUser = {
      email: finalEmail,
      name: finalEmail.split("@")[0].replace(/[._]/g, " "),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
