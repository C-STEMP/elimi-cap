"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RPLVerifyIdentityPage() {
  const router = useRouter();

  useEffect(() => {
    // Identity verification is handled in Onboarding; redirect directly to review & submit
    router.replace("/rpl/review-submit");
  }, [router]);

  return null;
}
