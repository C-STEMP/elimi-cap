"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isAuthenticated,
  getOnboardedStatus,
  saveOnboardedStatus,
  getLastOnboardingRoute,
  saveLastOnboardingRoute,
  getPersona,
  savePersona,
} from "@/src/lib/auth-storage";
import { getOnboardingMineApi } from "@/src/features/shared/onboarding/api";

interface RouteGuardProps {
  children: React.ReactNode;
}

let onboardingCheckPromise: Promise<{ persona: string | null; isOnboarded: boolean }> | null = null;

async function checkOnboardingOnce() {
  if (onboardingCheckPromise) return onboardingCheckPromise;
  
  onboardingCheckPromise = (async () => {
    try {
      const record = await getOnboardingMineApi();
      const persona = record?.persona || null;
      const isOnboarded = record?.status === "completed";
      
      if (persona) savePersona(persona);
      saveOnboardedStatus(isOnboarded);
      
      return { persona, isOnboarded };
    } catch {
      saveOnboardedStatus(false);
      return { persona: null, isOnboarded: false };
    }
  })();
  
  return onboardingCheckPromise;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const checkedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndOnboarding() {
      const isAuth = isAuthenticated();
      const isOnboarded = getOnboardedStatus();
      const persona = getPersona();

      const isDashboardRoute =
        pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/assessment-centre");
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

        if (!isOnboarded || !persona) {
          if (checkedRef.current) {
            const fallbackRoute =
              getLastOnboardingRoute() || "/onboarding/role-selection";
            if (isMounted) router.push(fallbackRoute);
            return;
          }
          
          try {
            const result = await checkOnboardingOnce();
            checkedRef.current = true;
            
            if (!result.isOnboarded) {
              let targetRoute = getLastOnboardingRoute();
              if (!targetRoute || targetRoute.startsWith("/dashboard") || targetRoute.startsWith("/assessment-centre")) {
                if (result.persona === "candidate") {
                  targetRoute = "/onboarding/personal-info";
                } else if (result.persona === "centre") {
                  targetRoute = "/onboarding/assessment-centre/center-info";
                } else if (result.persona === "assessor") {
                  targetRoute = "/onboarding/assessor/personal-info";
                } else {
                  targetRoute = "/onboarding/role-selection";
                }
              }
              if (isMounted) router.push(targetRoute);
              return;
            }
          } catch {
            const fallbackRoute =
              getLastOnboardingRoute() || "/onboarding/role-selection";
            if (isMounted) router.push(fallbackRoute);
            return;
          }
        }

        const currentPersona = persona || getPersona();
        if (currentPersona === "centre" && pathname?.startsWith("/dashboard")) {
          if (isMounted) router.push("/assessment-centre");
          return;
        }
      }

      if (isOnboardingRoute) {
        const isApplicationCreationRoute =
          pathname === "/onboarding/assessment-type" ||
          pathname === "/onboarding/start-application" ||
          pathname === "/onboarding/success" ||
          pathname?.startsWith("/rpl");

        if (isAuth && isOnboarded && !isApplicationCreationRoute) {
          const currentPersona = persona || getPersona();
          if (currentPersona === "centre") {
            if (isMounted) router.push("/assessment-centre");
          } else {
            if (isMounted) router.push("/dashboard");
          }
          return;
        }
        if (pathname) {
          saveLastOnboardingRoute(pathname);
        }
      }

      if (isAuthRoute) {
        if (isAuth) {
          if (isOnboarded) {
            const currentPersona = persona || getPersona();
            if (currentPersona === "centre") {
              if (isMounted) router.push("/assessment-centre");
            } else {
              if (isMounted) router.push("/dashboard");
            }
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
