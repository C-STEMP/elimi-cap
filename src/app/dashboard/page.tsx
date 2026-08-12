"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { getPersona } from "@/src/lib/auth-storage";

const CandidateDashboard = dynamic(
  () => import("@/features/candidate/features/Dashboard/pages/Dashboard").then((mod) => mod.Dashboard),
  { ssr: false }
);

const AssessorDashboard = dynamic(
  () => import("@/src/features/assessor/features/Dashboard/pages/AssessorDashboard").then((mod) => mod.AssessorDashboard),
  { ssr: false }
);

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
    }
  }, [effectiveRole, router]);

  if (effectiveRole === "centre") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FDF2F4]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-solid" />
      </div>
    );
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
