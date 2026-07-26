"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserWithoutPassword } from "@/types";

interface AuthContextType {
  user: UserWithoutPassword | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "lbsa_session_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to save session in sessionStorage (persists across F5 page reloads, cleared when tab closes)
  const saveSessionUser = (usr: UserWithoutPassword | null) => {
    if (typeof window === "undefined") return;
    try {
      if (usr) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(usr));
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {}
  };

  const getSessionUser = (): UserWithoutPassword | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // Mark presence active in localStorage and dispatch presence event
  const updatePresence = (usr: UserWithoutPassword | null, isOnline: boolean) => {
    if (typeof window === "undefined") return;
    try {
      if (isOnline && usr?.id) {
        localStorage.setItem(`lbsa_online_${usr.id}`, JSON.stringify({ ...usr, lastSeen: Date.now() }));
        localStorage.setItem("lbsa_presence_event", JSON.stringify({ type: "login", userId: usr.id, time: Date.now() }));
      } else if (usr?.id) {
        localStorage.removeItem(`lbsa_online_${usr.id}`);
        localStorage.setItem("lbsa_presence_event", JSON.stringify({ type: "logout", userId: usr.id, time: Date.now() }));
      }
      window.dispatchEvent(new CustomEvent("lbsa_presence_update", { detail: { user: usr, isOnline } }));
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // 1. First check sessionStorage (instant recovery on F5 / page reload)
      const cachedUser = getSessionUser();
      if (cachedUser) {
        setUser(cachedUser);
        updatePresence(cachedUser, true);
        setIsLoading(false);
      }

      // 2. Verify with API cookie check in background
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser(data.user);
            saveSessionUser(data.user);
            updatePresence(data.user, true);
          }
        } else if (!cachedUser) {
          setUser(null);
          removeSessionUser();
        }
      } catch {
        if (!cachedUser) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const removeSessionUser = () => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  // Heartbeat to keep presence active while browser tab is open
  useEffect(() => {
    if (!user) return;
    updatePresence(user, true);
    const interval = setInterval(() => {
      updatePresence(user, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        saveSessionUser(userData);
        updatePresence(userData, true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        saveSessionUser(userData);
        updatePresence(userData, true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    if (user) {
      updatePresence(user, false);
    }
    removeSessionUser();
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    document.cookie = "lbsa_user=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
