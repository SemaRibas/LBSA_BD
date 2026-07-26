"use client";

import { AIAgentWidget } from "@/components/ui/AIAgentWidget";

export default function GlobalAIAgent() {
  return (
    <AIAgentWidget
      onDataRegistered={() => {
        window.dispatchEvent(new Event("lbsa_data_registered"));
      }}
    />
  );
}
