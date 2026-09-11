"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetApplicationById, useGetInterviewPanel } from "@/src/features/shared/applications/hooks";
import { useAppSelector } from "@/src/store/hooks";
import { AssessorAssessmentFormView } from "@/src/features/assessor/features/Applications/components/assessment-forms";
import { Loader } from "@/src/components/ui/loader";

export default function AssessmentFormDedicatedRoutePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id =
    typeof params?.id === "string"
      ? params.id
    : Array.isArray(params?.id)
    ? params.id[0]
    : "";

  const formType =
    typeof params?.formType === "string"
      ? params.formType
    : Array.isArray(params?.formType)
    ? params.formType[0]
    : "skills_demo";

  const user = useAppSelector((state) => state.auth.user);
  const { data: application, isLoading } = useGetApplicationById(id);
  const { data: interviewPanel } = useGetInterviewPanel(id);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <Loader tip="Loading assessment form..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6 bg-[#f8f9fb]">
        <h3 className="text-lg font-bold text-gray-800">
          Application Not Found
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          The application for this assessment form does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/applications")}
          className="px-4 py-2 bg-[#8A1538] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const candidateName =
    application.candidate?.name ||
    (application.candidate?.firstName
      ? `${application.candidate.firstName} ${
          application.candidate.lastName || ""
        }`.trim()
      : application.candidateId || "Candidate");

  const currentAssessorId = (user as any)?.assessorId || (user as any)?.profileId || user?.id;
  const currentAssessorEmail = user?.email?.toLowerCase();

  const roleStr = String((application as any)?.role || user?.role || "").toLowerCase();
  const isGlobalIV = roleStr.includes("internal verifier") || roleStr.includes("iv");

  const isAssignedLead =
    (application as any)?.assignedAssessors?.some(
      (a: any) =>
        (a.role === "LEAD" || a.role === "Lead Panelist" || a.role === "lead_assessor") &&
        ((a.assessorId && a.assessorId === currentAssessorId) ||
          (a.email && a.email.toLowerCase() === currentAssessorEmail) ||
          (a.user?.email && a.user.email.toLowerCase() === currentAssessorEmail)),
    ) || false;

  const isAssignedIV =
    (application as any)?.assignedAssessors?.some(
      (a: any) =>
        (a.role === "INTERNAL_VERIFIER" || a.role === "Internal Verifier" || a.role === "iv") &&
        ((a.assessorId && a.assessorId === currentAssessorId) ||
          (a.email && a.email.toLowerCase() === currentAssessorEmail) ||
          (a.user?.email && a.user.email.toLowerCase() === currentAssessorEmail)),
    ) || false;

  const fromParam = searchParams.get("from");
  const isCandidateUser = Boolean(
    fromParam === "candidate" ||
    user?.role?.toLowerCase() === "candidate" ||
      (application &&
        ((application.candidateId && user?.id === application.candidateId) ||
          (application.candidate?.id && user?.id === application.candidateId) ||
          ((application.candidate as any)?.email &&
            user?.email &&
            (application.candidate as any).email.toLowerCase() ===
              user.email.toLowerCase()))) ||
      (!user?.role?.toLowerCase()?.includes("assessor") &&
       !user?.role?.toLowerCase()?.includes("centre") &&
       !user?.role?.toLowerCase()?.includes("center") &&
       !user?.role?.toLowerCase()?.includes("admin")),
  );

  const leadMember = interviewPanel?.members?.find((m: any) => m.isLead);
  const ivMember = interviewPanel?.members?.find((m: any) => m.isObserver);

  const isMemberMatch = (m: any) => {
    if (!m) return false;
    const mAssessorId = (m.assessorId || m.userId || m.id || "").toString().toLowerCase().trim();
    const mEmail = (m.email || "").toLowerCase().trim();
    const mName = (m.name || "").toLowerCase().trim();

    if (currentAssessorId && (mAssessorId === currentAssessorId.toString().toLowerCase().trim())) return true;
    if (user?.id && (mAssessorId === user.id.toLowerCase().trim())) return true;
    const userNames = [
      user?.fullName,
      (user as any)?.name,
      (user as any)?.firstName,
      (user as any)?.lastName,
    ].filter(Boolean).map((n) => (n as string).toLowerCase().trim());

    if (mName && userNames.some((n) => n === mName || n.includes(mName) || mName.includes(n))) return true;
    return false;
  };

  const isUserLeadPanelist =
    !isCandidateUser &&
    Boolean(
      (leadMember && isMemberMatch(leadMember)) ||
      (!leadMember && isAssignedLead) ||
      (!leadMember && (application as any).role?.toLowerCase()?.includes("lead"))
    );

  const isUserIV =
    !isCandidateUser &&
    Boolean(
      (ivMember && isMemberMatch(ivMember)) ||
      isAssignedIV ||
      isGlobalIV
    );

  const isReadOnly = isCandidateUser || isUserIV || !isUserLeadPanelist;

  const handleBack = () => {
    if (isCandidateUser || fromParam === "candidate") {
      router.push(`/applications/${id}`);
    } else {
      router.push(`/applications/${id}?from=assessor`);
    }
  };

  const resolvedTrade =
    application.trade?.name ||
    (typeof (application as any).trade === "string" ? (application as any).trade : "") ||
    (application as any)?.personalInformation?.trade ||
    (application as any)?.sector?.name ||
    "";

  return (
    <div className="w-full min-h-screen bg-[#FDFBF9]">
      <AssessorAssessmentFormView
        applicationId={id}
        formId={formType}
        candidateName={candidateName}
        onBack={handleBack}
        isReadOnly={isReadOnly}
        isCandidate={isCandidateUser}
        applicationTrade={resolvedTrade}
      />
    </div>
  );
}
