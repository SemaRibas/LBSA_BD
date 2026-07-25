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
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8",
        className
      )}
    >
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-100 uppercase tracking-wide">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 self-end sm:self-center">
        {user && (
          <div className="flex items-center justify-between gap-2.5 bg-surface-100 dark:bg-surface-800 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm max-w-full">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
              </div>
              <span className="text-xs sm:text-sm text-surface-700 dark:text-surface-300 truncate">
                Olá, <strong className="font-semibold text-surface-900 dark:text-surface-100 truncate">{user.name || user.email}</strong>
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 rounded-lg transition-all duration-200 shadow-xs"
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
