"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSelfAssessment = pathname?.includes("/self-assessment");

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#F5FAF8] text-text-dark selection:bg-primary selection:text-white flex flex-col"
    >
      {isSelfAssessment ? (
        children
      ) : (
        <main suppressHydrationWarning className="w-full flex-1 flex flex-col">
          {children}
        </main>
      )}
    </div>
  );
}
