import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assessment-centre/dashboard/:path*",
    "/applications/:path*",
    "/evidence-vault/:path*",
    "/onboarding/:path*",
    "/rpl/:path*",
    "/signin",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("elimi_access_token")?.value;
  const isOnboardedCookie = request.cookies.get("elimi_onboarded")?.value;

  const isAuthenticated = Boolean(token);
  const isOnboarded = isAuthenticated && isOnboardedCookie === "true";

  const isRplRoute = pathname.startsWith("/rpl");
  const isAllowedOnboardingRoute =
    pathname.startsWith("/onboarding/success") ||
    pathname.startsWith("/onboarding/start-application") ||
    pathname.startsWith("/onboarding/assessment-type");
  const isPreOnboardingRoute =
    pathname.startsWith("/onboarding") && !isAllowedOnboardingRoute;
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/assessment-centre/dashboard") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/evidence-vault");

  const personaCookie = request.cookies.get("elimi_persona")?.value;
  const isNotificationRoute = pathname.startsWith("/dashboard/notifications");
  const isAssessmentCentreRoute = pathname.startsWith("/assessment-centre");

  if (
    !isAuthenticated &&
    (isDashboardRoute || isPreOnboardingRoute || isAllowedOnboardingRoute || isRplRoute)
  ) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (
    isAuthenticated &&
    isDashboardRoute &&
    !isOnboarded &&
    !isNotificationRoute &&
    !isAssessmentCentreRoute &&
    !personaCookie
  ) {
    const onboardingUrl = new URL("/onboarding/welcome", request.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (isAuthenticated && isPreOnboardingRoute && (isOnboarded || Boolean(personaCookie))) {
    const destination = personaCookie === "centre" ? "/assessment-centre/dashboard" : "/dashboard";
    const dashboardUrl = new URL(destination, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (isAuthenticated && pathname.startsWith("/signin") && (isOnboarded || Boolean(personaCookie))) {
    const destination = personaCookie === "centre" ? "/assessment-centre/dashboard" : "/dashboard";
    const dashboardUrl = new URL(destination, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}
