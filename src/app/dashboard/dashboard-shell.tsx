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
      className="min-h-screen bg-[#F5FAF8] text-text-dark selection:bg-primary selection:text-white"
    >
      {isSelfAssessment ? (
        children
      ) : (
        <main
          suppressHydrationWarning
          className="xl:max-w-360 mx-auto p-4 w-full"
        >
          {children}
        </main>
      )}
    </div>
  );
}
