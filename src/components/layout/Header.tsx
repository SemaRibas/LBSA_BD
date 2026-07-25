"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

const tabs = ["Insights", "Channels"];

const Header = ({ title, activeTab, onTabChange, className }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowLeft className="h-5 w-5 text-surface-600 dark:text-surface-400" />
        </button>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 uppercase tracking-wide">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <nav className="hidden md:flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange?.(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                activeTab === tab
                  ? "bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm"
                  : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>

        {user && (
          <div className="flex items-center gap-3 bg-surface-100 dark:bg-surface-800 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
              </div>
              <span className="text-sm text-surface-700 dark:text-surface-300">
                Olá, <strong className="font-semibold text-surface-900 dark:text-surface-100">{user.name || user.email}</strong>
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
