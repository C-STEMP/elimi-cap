"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isAuthenticated,
  getOnboardedStatus,
  saveOnboardedStatus,
  getLastOnboardingRoute,
  saveLastOnboardingRoute,
} from "@/src/lib/auth-storage";
import { getOnboardingMineApi } from "@/src/features/shared/onboarding/api";

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndOnboarding() {
      const isAuth = isAuthenticated();
      const isOnboarded = getOnboardedStatus();

      const isDashboardRoute = pathname?.startsWith("/dashboard");
      const isOnboardingRoute =
        pathname?.startsWith("/onboarding") || pathname?.startsWith("/rpl");
      const isAuthRoute =
        pathname === "/signin" ||
        pathname === "/signup" ||
        pathname === "/register";

      if (isDashboardRoute) {
        if (!isAuth) {
          if (isMounted) {
            router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        if (!isOnboarded) {
          try {
            const record = await getOnboardingMineApi();
            if (record?.status === "completed") {
              saveOnboardedStatus(true);
              if (isMounted) setChecking(false);
              return;
            } else {
              saveOnboardedStatus(false);
              let targetRoute = getLastOnboardingRoute();
              if (!targetRoute || targetRoute.startsWith("/dashboard")) {
                if (record?.persona === "candidate") {
                  targetRoute = "/onboarding/personal-info";
                } else if (record?.persona === "centre") {
                  targetRoute = "/onboarding/assessment-centre/center-info";
                } else {
                  targetRoute = "/onboarding/role-selection";
                }
              }
              if (isMounted) router.push(targetRoute);
              return;
            }
          } catch {
            saveOnboardedStatus(false);
            const fallbackRoute =
              getLastOnboardingRoute() || "/onboarding/role-selection";
            if (isMounted) router.push(fallbackRoute);
            return;
          }
        }
      }

      if (isOnboardingRoute) {
        const isApplicationCreationRoute =
          pathname === "/onboarding/assessment-type" ||
          pathname === "/onboarding/start-application" ||
          pathname === "/onboarding/success" ||
          pathname?.startsWith("/rpl");

        if (isAuth && isOnboarded && !isApplicationCreationRoute) {
          if (isMounted) router.push("/dashboard");
          return;
        }
        if (pathname) {
          saveLastOnboardingRoute(pathname);
        }
      }

      if (isAuthRoute) {
        if (isAuth) {
          if (isOnboarded) {
            if (isMounted) router.push("/dashboard");
            return;
          } else {
            const lastRoute =
              getLastOnboardingRoute() || "/onboarding/role-selection";
            if (isMounted) router.push(lastRoute);
            return;
          }
        }
      }

      if (isMounted) setChecking(false);
    }

    checkAuthAndOnboarding();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FDF2F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-solid" />
          <span className="text-primary-solid font-medium text-sm">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
