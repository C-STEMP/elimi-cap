"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isAuthenticated,
  getOnboardedStatus,
  saveOnboardedStatus,
  getLastOnboardingRoute,
  saveLastOnboardingRoute,
  getPersona,
  savePersona,
  getCentreId,
  saveCentreId,
  getUser,
  resolveUserDestination,
} from "@/src/lib/auth-storage";
import {
  getOnboardingMineApi,
  parseOnboardingMine,
} from "@/src/features/shared/onboarding/api";
import { getMeApi } from "@/src/features/shared/account/api";
import { Loader } from "@/src/components/ui/loader";

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
      // 1. Signup / Register pages should NEVER be restricted or redirected back to dashboard
      if (pathname === "/signup" || pathname === "/register") {
        if (isMounted) setChecking(false);
        return;
      }

      const isAuth = isAuthenticated();
      let isOnboarded = getOnboardedStatus();
      const currentUser = getUser();
      const userEmail = currentUser?.email;

      const isDashboardRoute =
        pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/assessment-centre");
      const isRplRoute = pathname?.startsWith("/rpl");
      const isAllowedOnboardingRoute =
        pathname?.startsWith("/onboarding/success") ||
        pathname?.startsWith("/onboarding/start-application") ||
        pathname?.startsWith("/onboarding/assessment-type");
      const isPreOnboardingRoute =
        pathname?.startsWith("/onboarding") && !isAllowedOnboardingRoute;
      const isSignInRoute = pathname === "/signin";

      let currentPersona = getPersona();

      if (isAuth) {
        try {
          const [resMine, resMe] = await Promise.allSettled([
            getOnboardingMineApi(),
            getMeApi(),
          ]);

          if (resMine.status === "fulfilled") {
            const parsed = parseOnboardingMine(resMine.value);
            if (parsed.persona) {
              currentPersona = parsed.persona;
              savePersona(parsed.persona);
            }
            if (parsed.isOnboarded) {
              isOnboarded = true;
              saveOnboardedStatus(true);
            }
          }

          if (resMe.status === "fulfilled" && resMe.value) {
            const meData = resMe.value;
            if (meData.centres && meData.centres.length > 0) {
              const activeCentre = meData.centres[0];
              if (activeCentre?.centreId) {
                saveCentreId(activeCentre.centreId);
              }
            }
          }
        } catch {
          // ignore network error, rely on stored flag
        }
      }

      if (isDashboardRoute) {
        if (!isAuth) {
          if (isMounted) {
            router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        if (!isOnboarded) {
          saveOnboardedStatus(false);
          const targetRoute = resolveUserDestination(
            false,
            currentPersona,
            userEmail,
          );
          if (isMounted) router.push(targetRoute);
          return;
        }

        if (currentPersona === "centre" && pathname?.startsWith("/dashboard")) {
          if (isMounted) router.push("/assessment-centre");
          return;
        }
      }

      if (isRplRoute) {
        if (!isAuth) {
          if (isMounted) {
            router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }
        // Allow RPL application flow
      }

      if (isAllowedOnboardingRoute) {
        if (!isAuth) {
          if (isMounted) {
            router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }
        // Allow user to view success page and select start application or dashboard
      }

      if (isPreOnboardingRoute) {
        if (isAuth && isOnboarded) {
          const destination = resolveUserDestination(
            true,
            currentPersona,
            userEmail,
          );
          if (isMounted) router.push(destination);
          return;
        }
        if (pathname && isAuth) {
          saveLastOnboardingRoute(pathname, userEmail);
        }
      }

      if (isSignInRoute) {
        if (isAuth) {
          const destination = resolveUserDestination(
            isOnboarded,
            currentPersona,
            userEmail,
          );
          if (isMounted) router.push(destination);
          return;
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
    return <Loader tip="Checking session..." />;
  }

  return <>{children}</>;
};
