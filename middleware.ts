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
    "/signup",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("elimi_access_token")?.value;
  const isOnboardedCookie = request.cookies.get("elimi_onboarded")?.value;

  const isAuthenticated = Boolean(token);
  const isOnboarded = isAuthenticated && isOnboardedCookie !== "false";

  const isAuthRoute =
    pathname.startsWith("/signin") || pathname.startsWith("/signup");
  const isOnboardingRoute =
    pathname.startsWith("/onboarding") || pathname.startsWith("/rpl");
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/assessment-centre/dashboard") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/evidence-vault");

  if (!isAuthenticated && (isDashboardRoute || isOnboardingRoute)) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (isAuthenticated && isDashboardRoute && !isOnboarded) {
    const onboardingUrl = new URL("/onboarding/role-selection", request.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (isAuthenticated && isAuthRoute && isOnboarded) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}
