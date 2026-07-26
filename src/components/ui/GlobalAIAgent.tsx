"use client";

import { AIAgentWidget } from "@/components/ui/AIAgentWidget";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function GlobalAIAgent() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");

  if (!user || isAuthPage) {
    return null;
  }

  return (
    <AIAgentWidget
      onDataRegistered={() => {
        window.dispatchEvent(new Event("lbsa_data_registered"));
      }}
    />
  );
}

