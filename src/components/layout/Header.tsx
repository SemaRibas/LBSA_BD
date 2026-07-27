"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon, Users, ChevronDown, Shield, Eye, Microscope, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserWithoutPassword, UserRole } from "@/types";
import { getFirstAndSurnameInitials } from "@/lib/userUtils";

interface HeaderProps {
  title: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export function Header({ title, className }: HeaderProps) {
  const { user, logout } = useAuth();
  const [allUsers, setAllUsers] = useState<UserWithoutPassword[]>([]);
  const [presenceOpen, setPresenceOpen] = useState(false);
  const [presenceTick, setPresenceTick] = useState(0);

  // Fetch team users to compute presence status
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data);
        }
      } catch {
        // Fallback gracefully
      }
    };
    fetchUsers();
    const interval = setInterval(fetchUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  // Listen to real-time presence updates & storage events
  useEffect(() => {
    const handlePresenceEvent = () => setPresenceTick((t) => t + 1);
    window.addEventListener("lbsa_presence_update", handlePresenceEvent);
    window.addEventListener("storage", handlePresenceEvent);
    return () => {
      window.removeEventListener("lbsa_presence_update", handlePresenceEvent);
      window.removeEventListener("storage", handlePresenceEvent);
    };
  }, []);

  // Compute online vs offline users in real-time
  const presenceData = useMemo(() => {
    const defaultTeam: UserWithoutPassword[] = [
      { id: "1", name: "Dra. Sophia Benett", email: "sophia.benett@uesb.edu.br", role: "admin", createdAt: "" },
      { id: "2", name: "Dra. Isabella Foster", email: "isabella.foster@uesb.edu.br", role: "monitor", createdAt: "" },
      { id: "3", name: "Me. Grace Turner", email: "grace.turner@uesb.edu.br", role: "pesquisador", createdAt: "" },
      { id: "4", name: "Dr. Olivia Parker", email: "olivia.parker@uesb.edu.br", role: "admin", createdAt: "" },
      { id: "5", name: "Lucas Turner", email: "lucas.turner@uesb.edu.br", role: "pesquisador", createdAt: "" },
      { id: "6", name: "Emma Collins", email: "emma.collins@uesb.edu.br", role: "monitor", createdAt: "" },
    ];

    const list = allUsers.length > 0 ? allUsers : defaultTeam;

    const online: UserWithoutPassword[] = [];
    const offline: UserWithoutPassword[] = [];

    list.forEach((u) => {
      const isMe = user?.id === u.id || (user?.email && user.email === u.email);

      // Real-time local presence check
      let isStoredOnline = false;
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(`lbsa_online_${u.id}`);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.lastSeen && Date.now() - parsed.lastSeen < 45000) {
              isStoredOnline = true;
            }
          } catch {}
        }
      }

      // If user is currently logged in, or has active heartbeat -> Online. Otherwise Offline.
      if ((isMe && user) || isStoredOnline) {
        online.push(u);
      } else {
        offline.push(u);
      }
    });

    return { online, offline, total: list.length };
  }, [allUsers, user, presenceTick]);

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />;
      case "monitor":
        return <Eye className="h-3 w-3 text-teal-600 dark:text-teal-400" />;
      case "pesquisador":
      default:
        return <Microscope className="h-3 w-3 text-amber-600 dark:text-amber-400" />;
    }
  };

  const userInitials = user?.name ? getFirstAndSurnameInitials(user.name) : "U";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-[calc(100%+2rem)] sm:w-full -mt-4 -mx-4 sm:mt-0 sm:mx-0 bg-surface-50/90 dark:bg-surface-950/90 backdrop-blur-md py-1.5 sm:py-2.5 px-3 sm:px-4 mb-3 sm:mb-6 border-b border-surface-200/60 dark:border-surface-800/60 transition-all duration-200 flex flex-row items-center justify-between gap-2 sm:gap-3 shadow-2xs",
        className
      )}
    >
      {/* Page Title & Mobile Brand Logo (Left Side) */}
      <div className="flex items-center gap-2 xs:gap-3 min-w-0">
        <h1 className="hidden lg:block text-lg sm:text-2xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-wider truncate">
          {title}
        </h1>

        {/* Mobile Header Brand Logo (80% of header height) */}
        <div className="lg:hidden flex items-center py-0.5 shrink-0 h-full">
          <img src="/logo_black.png" alt="LBSA Logo" className="h-10 xs:h-11 w-auto object-contain my-auto dark:hidden" />
          <img src="/logo_white.png" alt="LBSA Logo" className="h-10 xs:h-11 w-auto object-contain my-auto hidden dark:block" />
        </div>
      </div>

      {/* Right Area: Stacked User Info (Top) & Presence (Bottom) on Mobile */}
      <div className="flex flex-col lg:flex-row items-end lg:items-center gap-1 lg:gap-2.5 shrink-0 ml-auto">
        {/* User Account Capsule (Upper Right on Mobile) */}
        {user && (
          <div className="flex items-center gap-1.5 bg-white dark:bg-surface-800/90 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full border border-surface-200/80 dark:border-surface-700/80 shadow-2xs backdrop-blur-md text-[11px] xs:text-xs font-bold text-surface-800 dark:text-surface-200">
            <div className="flex items-center gap-1.5 min-w-0">
              {user.imagemUrl ? (
                <img
                  src={user.imagemUrl}
                  alt={user.name || ""}
                  className="w-5 h-5 xs:w-6 xs:h-6 rounded-full object-cover border border-teal-500/40 shrink-0"
                />
              ) : (
                <div className="w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {userInitials}
                </div>
              )}
              <span className="font-extrabold text-surface-900 dark:text-surface-100 truncate max-w-[80px] xs:max-w-[110px] sm:max-w-[160px]">
                {user.name?.split(" ")[0] || user.email?.split("@")[0]}
              </span>
            </div>

            <div className="h-3 w-px bg-surface-200 dark:bg-surface-700 shrink-0" />

            <button
              onClick={logout}
              className="flex items-center gap-0.5 text-[10px] xs:text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors shrink-0"
              title="Sair da conta"
            >
              <LogOut className="h-3 w-3" />
              <span>Sair</span>
            </button>
          </div>
        )}

        {/* Presence Status Widget Button (Below User Capsule on Mobile) */}
        <div className="relative order-last lg:order-first">
          <button
            type="button"
            onClick={() => setPresenceOpen(!presenceOpen)}
            className="flex items-center gap-1.5 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full bg-white dark:bg-surface-800/90 border border-surface-200/80 dark:border-surface-700/80 text-[10px] xs:text-[11px] font-bold text-surface-800 dark:text-surface-200 hover:border-teal-500/50 shadow-2xs backdrop-blur-md transition-all active:scale-95"
            title="Ver integrantes online e offline em tempo real"
          >
            {/* Pulsing Green Online Indicator */}
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>

            <div className="flex items-center gap-1 text-[10px] xs:text-[11px]">
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                {presenceData.online.length} <span className="hidden xs:inline">Online</span>
              </span>
              <span className="text-surface-400 dark:text-surface-500">•</span>
              <span className="text-surface-500 dark:text-surface-400 font-medium">
                {presenceData.offline.length} <span className="hidden xs:inline">Offline</span>
              </span>
            </div>

            <ChevronDown className={cn("h-3 w-3 text-surface-400 transition-transform duration-200", presenceOpen && "rotate-180")} />
          </button>

          {/* Online/Offline Status Dropdown Popover */}
          {presenceOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setPresenceOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 xs:w-80 p-3 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-teal-500/30 shadow-2xl z-50 animate-slide-up space-y-3">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-surface-100 dark:border-surface-800">
                  <div className="flex items-center gap-2 text-surface-900 dark:text-white font-extrabold text-xs">
                    <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>Status da Equipe LBSA</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300">
                    {presenceData.total} Membros
                  </span>
                </div>

                {/* Section 1: Online Members */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <span>🟢 Online Agora ({presenceData.online.length})</span>
                  </div>
                  {presenceData.online.length === 0 ? (
                    <div className="p-2 text-xs text-surface-400 italic text-center">Nenhum integrante online no momento.</div>
                  ) : (
                    presenceData.online.map((member) => {
                      const isMe = user?.id === member.id || user?.email === member.email;
                      const initials = getFirstAndSurnameInitials(member.name);
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              {member.imagemUrl ? (
                                <img
                                  src={member.imagemUrl}
                                  alt={member.name}
                                  className="w-8 h-8 rounded-xl object-cover border border-emerald-400/40"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                                  {initials}
                                </div>
                              )}
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-surface-900 animate-pulse" />
                            </div>

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-surface-900 dark:text-surface-100 truncate">
                                  {member.name}
                                </span>
                                {isMe && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-200 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200">
                                    Você
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-surface-400 dark:text-surface-500 truncate">
                                {member.email}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 p-1 rounded-lg bg-surface-100 dark:bg-surface-800">
                            {getRoleIcon(member.role)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Section 2: Offline Members */}
                <div className="space-y-1.5 pt-1 border-t border-surface-100 dark:border-surface-800">
                  <div className="flex items-center justify-between px-2 text-[10px] font-extrabold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                    <span>⚪ Offline ({presenceData.offline.length})</span>
                  </div>
                  {presenceData.offline.length === 0 ? (
                    <div className="p-2 text-xs text-surface-400 italic text-center">Todos estão online!</div>
                  ) : (
                    presenceData.offline.map((member) => {
                      const initials = getFirstAndSurnameInitials(member.name);
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-surface-50/50 dark:bg-surface-800/30 border border-surface-200/40 dark:border-surface-800/40 text-xs opacity-75"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              {member.imagemUrl ? (
                                <img
                                  src={member.imagemUrl}
                                  alt={member.name}
                                  className="w-8 h-8 rounded-xl object-cover grayscale"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-surface-300 dark:bg-surface-700 text-surface-700 dark:text-surface-200 font-black flex items-center justify-center text-xs">
                                  {initials}
                                </div>
                              )}
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-surface-400 dark:bg-surface-600 ring-2 ring-white dark:ring-surface-900" />
                            </div>

                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-surface-800 dark:text-surface-200 truncate">
                                {member.name}
                              </span>
                              <span className="text-[10px] text-surface-400 dark:text-surface-500 truncate">
                                {member.email}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 p-1 rounded-lg bg-surface-200/50 dark:bg-surface-800">
                            {getRoleIcon(member.role)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
