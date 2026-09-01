"use client";

import React, { useEffect, useState } from "react";
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
  const [resolvedPersona, setResolvedPersona] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedPersona = getPersona();
    const effectiveRole = userRole || storedPersona;

    if (effectiveRole === "centre") {
      setResolvedPersona("centre");
      setIsReady(true);
      router.replace("/assessment-centre");
    } else if (
      effectiveRole === "assessor" ||
      effectiveRole === "quality-assurance" ||
      effectiveRole === "quality_assurance" ||
      effectiveRole === "qaa"
    ) {
      savePersona("assessor");
      setResolvedPersona("assessor");
      setIsReady(true);
    } else if (effectiveRole === "candidate") {
      savePersona("candidate");
      setResolvedPersona("candidate");
      setIsReady(true);
    } else if (storedPersona) {
      setResolvedPersona(storedPersona);
      setIsReady(true);
    } else {
      setResolvedPersona("candidate");
      setIsReady(true);
    }
  }, [userRole, router]);

  if (!isReady || !resolvedPersona) {
    return <Loader tip="Loading dashboard..." />;
  }

  if (resolvedPersona === "centre") {
    return <Loader tip="Redirecting to Assessment Centre..." />;
  }

  if (
    resolvedPersona === "assessor" ||
    resolvedPersona === "quality-assurance" ||
    resolvedPersona === "quality_assurance" ||
    resolvedPersona === "qaa"
  ) {
    return <AssessorDashboard />;
  }

  return <CandidateDashboard />;
}
