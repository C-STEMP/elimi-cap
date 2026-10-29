"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetApplicationById, useGetInterviewPanel } from "@/src/features/shared/applications/hooks";
import { useAppSelector } from "@/src/store/hooks";
import { AssessorAssessmentFormView } from "@/src/features/assessor/features/Applications/components/assessment-forms";
import { Loader } from "@/src/components/ui/loader";
import { usePanelMemberMatch } from "@/src/features/assessor/hooks";

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

  const isAssessmentMapping =
    formType === "assessment_mapping" || formType === "assessment_grid";
  const isInterviewForm =
    formType === "interview_record" || formType === "records";
  const isInterviewStage = application?.currentStageKey === "interview";

  const shouldFetchInterviewPanel = Boolean(
    id &&
      application &&
      !isAssessmentMapping &&
      (isInterviewStage || isInterviewForm),
  );

  const { data: interviewPanel } = useGetInterviewPanel(id, {
    enabled: shouldFetchInterviewPanel,
  });
  const isMemberMatch = usePanelMemberMatch();

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

  const isAssignedLead =
    (application as any)?.assignedAssessors?.some(
      (a: any) =>
        (a.role === "LEAD" || a.role === "Lead Panelist" || a.role === "lead_assessor") &&
        ((a.assessorId && a.assessorId === currentAssessorId) ||
          (a.email && a.email.toLowerCase() === currentAssessorEmail) ||
          (a.user?.email && a.user.email.toLowerCase() === currentAssessorEmail)),
    ) || false;

  const fromParam = searchParams.get("from");
  // Centre staff open these forms from the evidence vault to read them only.
  const isCentreViewer = fromParam === "centre";
  const isCandidateUser = Boolean(
    fromParam !== "assessor" &&
    !isCentreViewer &&
    (fromParam === "candidate" ||
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
       !user?.role?.toLowerCase()?.includes("admin"))),
  );

  const leadMember = interviewPanel?.members?.find((m: any) => m.isLead);
  const matchedPanelMember = interviewPanel?.members?.find((m: any) =>
    isMemberMatch(m),
  );

  const isAssessorUser = Boolean(
    fromParam === "assessor" ||
    user?.role?.toLowerCase()?.includes("assessor") ||
    isAssignedLead ||
    (application as any)?.assignedAssessors?.some(
      (a: any) =>
        (a.assessorId && a.assessorId === currentAssessorId) ||
        (a.email && a.email.toLowerCase() === currentAssessorEmail) ||
        (a.user?.email && a.user.email.toLowerCase() === currentAssessorEmail),
    ),
  );

  const isUserLeadPanelist =
    !isCandidateUser &&
    !isCentreViewer &&
    Boolean(
      (leadMember && isMemberMatch(leadMember)) ||
      (!leadMember && isAssignedLead) ||
      (!leadMember && (application as any).role?.toLowerCase()?.includes("lead")),
    );

  const isAssignedNonFacilitator =
    (application as any)?.assignedAssessors?.some(
      (a: any) =>
        a.role !== "FACILITATOR" &&
        a.role !== "facilitator" &&
        ((a.assessorId && a.assessorId === currentAssessorId) ||
          (a.email && a.email.toLowerCase() === currentAssessorEmail) ||
          (a.user?.email && a.user.email.toLowerCase() === currentAssessorEmail)),
    ) || false;

  const isSeatedPanelMember =
    !isCandidateUser &&
    !isCentreViewer &&
    Boolean(
      matchedPanelMember ||
      isUserLeadPanelist ||
      (!interviewPanel?.members?.length &&
        (isAssignedNonFacilitator || isAssessorUser)),
    );

  // Seated panel members (lead, voting panelists, and IV observer) can PUT interview forms;
  const isReadOnly =
    isCentreViewer ||
    isCandidateUser ||
    !isSeatedPanelMember;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
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
        isLeadPanelist={isUserLeadPanelist}
        applicationTrade={resolvedTrade}
        viewOnly={isCentreViewer}
      />
    </div>
  );
}
