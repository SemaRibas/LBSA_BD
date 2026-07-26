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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          updatePresence(data.user, true);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

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
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    document.cookie = "lbsa_user=; path=/; max-age=0";
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
