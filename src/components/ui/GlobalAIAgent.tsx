"use client";

import { useEffect, useState } from "react";
import { AIAgentWidget } from "@/components/ui/AIAgentWidget";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function GlobalAIAgent() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);

    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");

  if (!user || isAuthPage || isDesktop !== true) {
    return null;
  }

  return (
    <div className="hidden md:block">
      <AIAgentWidget
        onDataRegistered={() => {
          window.dispatchEvent(new Event("lbsa_data_registered"));
        }}
      />
    </div>
  );
}


