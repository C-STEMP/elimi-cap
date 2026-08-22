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
  const isOnboarded = isAuthenticated && isOnboardedCookie !== "false";

  const isRplRoute = pathname.startsWith("/rpl");
  const isAllowedOnboardingRoute =
    pathname.startsWith("/onboarding/success") ||
    pathname.startsWith("/onboarding/start-application");
  const isPreOnboardingRoute =
    pathname.startsWith("/onboarding") && !isAllowedOnboardingRoute;
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/assessment-centre/dashboard") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/evidence-vault");

  if (
    !isAuthenticated &&
    (isDashboardRoute || isPreOnboardingRoute || isAllowedOnboardingRoute || isRplRoute)
  ) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (isAuthenticated && isDashboardRoute && !isOnboarded) {
    const onboardingUrl = new URL("/onboarding/role-selection", request.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (isAuthenticated && isPreOnboardingRoute && isOnboarded) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (isAuthenticated && pathname.startsWith("/signin") && isOnboarded) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}
