"use client";

import dynamic from "next/dynamic";

const UserCursor = dynamic(() => import("@/components/ui/UserCursor"), { ssr: false });
const GlobalAIAgent = dynamic(() => import("@/components/ui/GlobalAIAgent"), { ssr: false });

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserCursor />
      {children}
      <GlobalAIAgent />
    </>
  );
}
