import * as React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#F5FAF8] text-text-dark selection:bg-primary selection:text-white">
      <main suppressHydrationWarning className="max-w-7xl xl:max-w-[1440px] mx-auto p-4 lg:p-6 w-full">{children}</main>
    </div>
  );
}
