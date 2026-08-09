import * as React from "react";
import { AuthSidebar } from "@/src/features/shared/authentication/components/AuthSidebar";
import { Logo } from "@/src/components/ui/logo";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      suppressHydrationWarning
      className="h-screen w-full flex flex-col lg:flex-row bg-primary-solid lg:bg-white font-sans antialiased overflow-hidden"
    >
      {/* Mobile Top Header */}
      <div
        suppressHydrationWarning
        className="w-full bg-primary-solid pt-8 pb-10 flex items-center justify-center lg:hidden shrink-0"
      >
        <Logo theme="light" href="/" />
      </div>

      <AuthSidebar />

      <div
        suppressHydrationWarning
        className="flex-1 w-full max-w-full h-screen overflow-y-auto bg-white rounded-t-4xl lg:rounded-none -mt-4 lg:mt-0 p-4 sm:p-8 md:p-10 xl:p-12 flex flex-col items-center justify-start relative shadow-md lg:shadow-none"
      >
        <div
          suppressHydrationWarning
          className="w-full flex flex-col items-center my-auto py-4 sm:py-8 shrink-0"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
