"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/components/ui/toast";
import { AuthSidebar } from "@/features/auth/components/AuthSidebar";
import { Logo } from "@/components/ui/logo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is authenticated (via Redux state or persisted user/token)
    const isAuth = isAuthenticated || !!user || !!token;

    if (!isAuth) {
      toast({
        type: "error",
        title: "Authentication Required",
        description: "You must be signed in to access the onboarding flow.",
      });
      router.replace("/signin");
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, user, token, router, toast]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-solid border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-neutral-secondary">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen w-full flex flex-col lg:flex-row bg-primary-solid lg:bg-white font-sans antialiased overflow-y-auto overflow-x-hidden lg:overflow-hidden"
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
        className="flex-1 w-full max-w-full bg-white rounded-t-4xl lg:rounded-none -mt-4 lg:mt-0 p-4 sm:p-8 md:p-10 xl:p-12 flex flex-col items-center justify-start relative min-h-[calc(100vh-100px)] lg:min-h-screen lg:h-screen lg:overflow-y-auto overflow-x-hidden shadow-md lg:shadow-none"
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
