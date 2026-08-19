"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { getPersona, savePersona } from "@/src/lib/auth-storage";
import { Dashboard as CandidateDashboard } from "@/features/candidate/features/Dashboard/pages/Dashboard";
import { AssessorDashboard } from "@/src/features/assessor/features/Dashboard/pages/AssessorDashboard";

import { Loader } from "@/src/components/ui/loader";

export default function DashboardPage() {
  const router = useRouter();
  const userRole = useAppSelector(
    (state) => state.auth.user?.role || state.onboarding.role,
  );
  const storedPersona = typeof window !== "undefined" ? getPersona() : null;
  const effectiveRole = userRole || storedPersona;

  useEffect(() => {
    if (effectiveRole === "centre") {
      router.replace("/assessment-centre");
    } else if (effectiveRole === "assessor" || effectiveRole === "quality-assurance" || effectiveRole === "quality_assurance") {
      // Assessors stay on /dashboard — keep assessor persona
      savePersona("assessor");
    } else {
      // Default: candidate workspace — overwrite any stale persona immediately
      // so that all subsequent API calls in this render cycle use the right hat
      savePersona("candidate");
    }
  }, [effectiveRole, router]);

  if (effectiveRole === "centre") {
    return <Loader tip="Redirecting to Assessment Centre..." />;
  }

  const isAssessor =
    effectiveRole === "assessor" ||
    effectiveRole === "quality-assurance" ||
    effectiveRole === "quality_assurance" ||
    effectiveRole === "qaa";

  if (isAssessor) {
    return <AssessorDashboard />;
  }

  return <CandidateDashboard />;
}
