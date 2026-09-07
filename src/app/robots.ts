import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://cap.e-limi.africa";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/onboarding/", "/nsq/", "/rpl/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
