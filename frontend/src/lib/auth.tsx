import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiError } from "./api";
import type { Me } from "./types";

interface AuthCtx {
  user: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Me>;
  logout: () => Promise<void>;
}
type MeResponse = { user: Me; profile?: { _id: string } | null };
/** Accepts `profile` either nested on the user or as a sibling of it. */
const merge = (r: MeResponse): Me => ({ ...r.user, profile: r.user.profile ?? r.profile ?? undefined });

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<MeResponse>("/auth/me")
      .then((r) => setUser(merge(r)))
      .catch((e) => {
        // 401 = signed out. Anything else we also treat as signed out.
        if (!(e instanceof ApiError)) console.warn(e);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await api("/auth/login", { method: "POST", body: { email, password } });
    // Re-read via /me so we pick up `profile` if the backend provides it.
    const r = await api<MeResponse>("/auth/me");
    const me = merge(r);
    setUser(me);
    return me;
  };

  const logout = async () => {
    await api("/auth/logout").catch(() => {});
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
};
