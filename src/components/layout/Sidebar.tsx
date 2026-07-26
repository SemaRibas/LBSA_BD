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
      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-teal-700 to-teal-800",
          "flex flex-col items-center pt-6 pb-6 z-40",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Mobile Close Button inside Sidebar */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden mb-2 p-2 text-teal-200 hover:text-white hover:bg-teal-600 rounded-xl transition-all"
          aria-label="Fechar menu"
        >
          <X className="h-6 w-6" />
        </button>

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
                onClick={() => setIsOpen(false)}
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
