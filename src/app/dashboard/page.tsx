"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { getPersona, savePersona } from "@/src/lib/auth-storage";
import { Dashboard as CandidateDashboard } from "@/features/candidate/features/Dashboard/pages/Dashboard";
import { Loader } from "@/src/components/ui/loader";

const ASSESSOR_ROLES = ["assessor", "quality-assurance", "quality_assurance", "qaa"];

export default function DashboardPage() {
  const router = useRouter();
  const userRole = useAppSelector(
    (state) => state.auth.user?.role || state.onboarding.role,
  );
  const [resolvedPersona, setResolvedPersona] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedPersona = getPersona();
    const effectiveRole = userRole || storedPersona;

    if (effectiveRole === "centre") {
      savePersona("centre");
      router.replace("/assessment-centre/dashboard");
      return;
    }

    if (ASSESSOR_ROLES.includes(effectiveRole || "")) {
      savePersona("assessor");
      router.replace("/assessor/dashboard/overview");
      return;
    }

    if (effectiveRole === "candidate") {
      savePersona("candidate");
      setResolvedPersona("candidate");
      setIsReady(true);
      return;
    }

    // Fallback — use stored persona or default to candidate
    const fallback = storedPersona || "candidate";
    if (ASSESSOR_ROLES.includes(fallback)) {
      router.replace("/assessor/dashboard/overview");
    } else if (fallback === "centre") {
      router.replace("/assessment-centre/dashboard");
    } else {
      setResolvedPersona("candidate");
      setIsReady(true);
    }
  }, [userRole, router]);

  if (!isReady || !resolvedPersona) {
    return <Loader tip="Loading dashboard..." />;
  }

  return <CandidateDashboard />;
}
