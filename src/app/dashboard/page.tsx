"use client";

import { useAppSelector } from "@/src/store/hooks";
import { Dashboard as CandidateDashboard } from "@/features/candidate/features/Dashboard/pages/Dashboard";
import { AssessorDashboard } from "@/src/features/assessor/features/Dashboard/pages/AssessorDashboard";

export default function DashboardPage() {
  const userRole = useAppSelector(
    (state) => state.auth.user?.role || state.onboarding.role,
  );

  const isAssessor =
    userRole === "assessor" ||
    userRole === "quality-assurance" ||
    userRole === "quality_assurance" ||
    userRole === "qaa";

  if (isAssessor) {
    return <AssessorDashboard />;
  }

  return <CandidateDashboard />;
}
