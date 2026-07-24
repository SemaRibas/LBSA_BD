"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

const tabs = ["Insights", "Channels"];

const Header = ({ title, activeTab, onTabChange, className }: HeaderProps) => {
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

      <div className="flex items-center gap-6">
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
      </div>
    </header>
  );
};

export { Header };
