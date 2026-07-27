"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Archive,
  Home,
  LayoutGrid,
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/insights", label: "Inventários", icon: LayoutGrid },
  { href: "/channels", label: "Coleções", icon: BarChart3 },
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



  return (
    <>
      {/* Mobile Bottom Floating Capsule Navigation Bar */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xs sm:max-w-sm bg-surface-950/95 dark:bg-surface-950/95 backdrop-blur-xl border border-white/15 dark:border-surface-800/80 p-1.5 rounded-full flex items-center justify-between shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center justify-center p-2.5 rounded-full transition-colors flex-1"
              title={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMobileTabPill"
                  className="absolute inset-0 bg-white dark:bg-teal-500 rounded-full shadow-md"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive
                      ? "text-surface-950 dark:text-white"
                      : "text-surface-400 hover:text-white"
                  )}
                />
              </div>
            </Link>
          );
        })}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center justify-center p-2.5 rounded-full text-surface-400 hover:text-white transition-colors flex-1"
          aria-label="Alternar Tema"
          title="Alternar Tema Claro/Escuro"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-surface-400 hover:text-white" />
          )}
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
                prefetch={true}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200",
                  "group relative",
                  isActive
                    ? "text-teal-700 font-bold"
                    : "text-teal-200 hover:bg-teal-600/50 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDesktopTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <item.icon className="h-5 w-5 relative z-10" />
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2 py-1 bg-surface-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
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
