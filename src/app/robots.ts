import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://cap.e-limi.africa";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signin", "/register", "/signup"],
      disallow: [
        "/dashboard/",
        "/assessment-centre/",
        "/assessor/",
        "/onboarding/",
        "/nsq/",
        "/rpl/",
        "/verify",
        "/enter-otp",
        "/forgot-password",
        "/change-password",
        "/complete-signup",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
