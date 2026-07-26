"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Archive,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/insights", label: "Inventários", icon: Package },
  { href: "/channels", label: "Coleções", icon: Archive },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);

    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("lbsa_toggle_sidebar", handleToggle);
    return () => window.removeEventListener("lbsa_toggle_sidebar", handleToggle);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  if (!mounted) {
    return (
      <aside className={cn(
        "fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-teal-700 to-teal-800",
        "flex flex-col items-center py-6 z-40",
        "lg:translate-x-0 -translate-x-full",
        className
      )} />
    );
  }

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-t border-surface-200/80 dark:border-surface-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 min-w-[64px]",
                isActive
                  ? "text-teal-600 dark:text-teal-400 font-black scale-105 bg-teal-50 dark:bg-teal-950/40"
                  : "text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white font-medium"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-all min-w-[64px]"
          aria-label="Alternar Tema"
          title="Alternar Tema Claro/Escuro"
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          <span className="text-[10px] tracking-tight">{isDark ? "Claro" : "Escuro"}</span>
        </button>
      </nav>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-teal-700 to-teal-800",
          "flex-col items-center py-6 z-40",
          className
        )}
      >
        {/* Logo Branca Grande */}
        <Link href="/" className="mb-4 flex flex-col items-center justify-center px-2 hover:scale-105 transition-transform" title="LBSA Dashboard">
          <img
            src="/logo_white.png"
            alt="LBSA Logo"
            className="w-16 h-16 object-contain filter drop-shadow-md"
          />
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-2 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                  "group relative",
                  isActive
                    ? "bg-white text-teal-700 shadow-lg"
                    : "text-teal-200 hover:bg-teal-600 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2 py-1 bg-surface-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-teal-200 hover:bg-teal-600 hover:text-white transition-all duration-200"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
