"use client";

import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

const Header = ({ title, className }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 w-full",
        className
      )}
    >
      {/* Title */}
      <div className="flex items-center gap-3 pl-14 lg:pl-0 pt-0.5 sm:pt-0">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 uppercase tracking-wider">
          {title}
        </h1>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-3 self-end sm:self-center max-w-full">
        {user && (
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-surface-800/90 px-3.5 py-2 rounded-2xl border border-surface-200/80 dark:border-surface-700/80 shadow-sm max-w-full backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center text-xs font-black shadow-md shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-surface-500 dark:text-surface-400 font-medium leading-none">
                  Olá,
                </span>
                <span className="text-xs sm:text-sm font-bold text-surface-900 dark:text-surface-100 truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[220px]">
                  {user.name || user.email}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-surface-200 dark:bg-surface-700 shrink-0" />

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 rounded-xl transition-all duration-200 shadow-xs shrink-0 active:scale-95"
              title="Sair da conta"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export { Header };
