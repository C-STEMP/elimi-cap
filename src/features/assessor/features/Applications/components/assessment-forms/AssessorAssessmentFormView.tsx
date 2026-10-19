"use client";

import React, { useState } from "react";
import { SkillsDemonstrationForm } from "./SkillsDemonstrationForm";
import { AssessmentMappingForm } from "./AssessmentMappingForm";
import { PracticalObservationForm } from "./PracticalObservationForm";
import { InterviewRecordForm } from "./InterviewRecordForm";
import { ConfirmSubmitFormModal } from "./ConfirmSubmitFormModal";
import { FormSubmittedSuccessModal } from "./FormSubmittedSuccessModal";
import { AssessorAssessmentFormDocumentView } from "./AssessorAssessmentFormDocumentView";

import {
  useGetInterviewFormsBundle,
  useGetInterviewPanel,
  useUpdateInterviewForm,
  useGetApplicationById,
} from "@/src/features/shared/applications/hooks";
import { usePanelMemberMatch } from "@/src/features/assessor/hooks";
import { useToast } from "@/src/components/ui/toast";
import { useGetUnitsByTrade } from "@/src/features/shared/reference/hooks";
import { toUnitLabel } from "./utils";
import { useAppSelector } from "@/src/store/hooks";

interface AssessorAssessmentFormViewProps {
  applicationId: string;
  formId: string;
  candidateName: string;
  onBack: () => void;
  isReadOnly?: boolean;
  isCandidate?: boolean;
  isLeadPanelist?: boolean;
  applicationTrade?: string;
  /** Observers outside the interview (e.g. the centre) — read-only, no sign controls. */
  viewOnly?: boolean;
}

const FORM_MAP: Record<
  string,
  "skill_demonstration" | "assessment_grid" | "practical_observation" | "records"
> = {
  skills_demo: "skill_demonstration",
  skill_demonstration: "skill_demonstration",
  assessment_mapping: "assessment_grid",
  assessment_grid: "assessment_grid",
  observation_checklist: "practical_observation",
  practical_observation: "practical_observation",
  interview_record: "records",
  records: "records",
};

export const AssessorAssessmentFormView: React.FC<
  AssessorAssessmentFormViewProps
> = ({
  applicationId,
  formId,
  candidateName,
  onBack,
  isReadOnly = false,
  isCandidate = false,
  isLeadPanelist,
  applicationTrade,
  viewOnly = false,
}) => {
  const { toast } = useToast();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<Record<string, any> | null>(null);
  const [activeRecordTab, setActiveRecordTab] = useState<"own" | "canonical">("own");

  const { data: applicationData } = useGetApplicationById(applicationId);
  const { data: interviewPanel } = useGetInterviewPanel(applicationId);
  const isMemberMatch = usePanelMemberMatch();
  const user = useAppSelector((state) => state.auth.user);

  const isCandidateUser = user?.role?.toLowerCase() === "candidate";
  const effectiveIsCandidate = isCandidate || isCandidateUser;

  const leadMember = interviewPanel?.members?.find((m: any) => m.isLead);
  const matchedPanelMember = interviewPanel?.members?.find((m: any) =>
    isMemberMatch(m),
  );
  const ivMember = interviewPanel?.members?.find((m: any) => m.isObserver);
  const isObserverUser = Boolean(
    user?.role?.toLowerCase() === "iv" ||
      user?.role?.toLowerCase() === "verifier" ||
      (ivMember && isMemberMatch(ivMember)),
  );

  const effectiveIsLead =
    isLeadPanelist !== undefined
      ? isLeadPanelist
      : !effectiveIsCandidate &&
        !viewOnly &&
        Boolean(
          (leadMember && isMemberMatch(leadMember)) ||
            (!leadMember &&
              (applicationData as any)?.role?.toLowerCase()?.includes("lead")),
        );

  const resolvedTrade =
    applicationTrade ||
    applicationData?.trade?.name ||
    (typeof (applicationData as any)?.trade === "string" ? (applicationData as any).trade : "") ||
    "";

  // Signing these forms is an "interview stage" action on the backend — once
  // the application has moved on (e.g. to external verification), signing
  // always fails, so the sign controls must not be offered any more.
  const isInterviewStage = !viewOnly && applicationData?.currentStageKey === "interview";

  const formType = FORM_MAP[formId] || "records";
  // Unit dropdowns list the trade's NOS units, candidate-preferred ones first.
  const { data: tradeUnits = [] } = useGetUnitsByTrade(
    applicationData?.tradeId || "",
  );
  const unitLabels = React.useMemo(() => {
    const preferred = new Set(applicationData?.unitIds ?? []);
    return [...tradeUnits]
      .sort((a, b) => Number(preferred.has(b.id)) - Number(preferred.has(a.id)))
      .map(toUnitLabel);
  }, [tradeUnits, applicationData?.unitIds]);

  const { data: formsBundle } = useGetInterviewFormsBundle(applicationId);
  const remoteForms = formsBundle?.forms;
  const panelistRecords = formsBundle?.panelistRecords;
  const updateFormMutation = useUpdateInterviewForm(applicationId);

  const matchedCanonicalForm = remoteForms?.find((f) => f.formType === formType);
  const myPanelistRecord = React.useMemo(() => {
    if (!panelistRecords?.length) return undefined;
    return panelistRecords.find(
      (r) =>
        r.formType === formType &&
        (isMemberMatch({ assessorId: r.assessorId }) ||
          (matchedPanelMember?.assessorId &&
            r.assessorId === matchedPanelMember.assessorId) ||
          (!matchedPanelMember && isObserverUser && r.isObserver)),
    );
  }, [
    panelistRecords,
    formType,
    isMemberMatch,
    matchedPanelMember,
    isObserverUser,
  ]);

  const isCandidateSigned = Boolean(matchedCanonicalForm?.candidateSignedAt);
  const isAssessmentMapping = formType === "assessment_grid";
  const isNonLeadSeatedMember =
    !effectiveIsCandidate && !viewOnly && !isReadOnly && !effectiveIsLead;

  // Lead is blocked after candidate signoff; non-lead panelists & IV observer
  // upsert their own optional InterviewFormRecord (not candidate-signed).
  const effectiveReadOnly =
    isAssessmentMapping ||
    viewOnly ||
    isReadOnly ||
    (effectiveIsLead && isCandidateSigned);

  const activeFormData = isNonLeadSeatedMember
    ? myPanelistRecord?.data
    : matchedCanonicalForm?.data;

  const hasCanonicalFormData = Boolean(
    matchedCanonicalForm?.data &&
      Object.keys(matchedCanonicalForm.data).length > 0,
  );

  const handleRequestSubmit = (data: Record<string, any>) => {
    if (effectiveReadOnly) return;
    setPendingFormData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    try {
      const now = new Date().toISOString();
      const uName = user?.fullName || (user as any)?.name || "";
      const baseData = effectiveIsLead
        ? matchedCanonicalForm?.data || {}
        : myPanelistRecord?.data || {};

      await updateFormMutation.mutateAsync({
        formType,
        data: {
          ...baseData,
          ...(pendingFormData || {}),
          submittedAt: now,
          status: "submitted",
          assessorSigned: true,
          assessorSignedAt: pendingFormData?.assessorSignedAt || now,
          assessorName:
            pendingFormData?.assessorName ||
            uName ||
            (baseData as any)?.assessorName,
          ...(effectiveIsLead
            ? {
                leadPanelistSigned: true,
                leadPanelistSignedAt:
                  pendingFormData?.leadPanelistSignedAt || now,
                leadPanelistName:
                  pendingFormData?.leadPanelistName ||
                  uName ||
                  (baseData as any)?.leadPanelistName,
              }
            : {}),
        },
      });
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Submission Error",
        description: err?.message || "Failed to submit assessment form.",
      });
    }
  };

  const handleSuccessContinue = () => {
    setIsSuccessModalOpen(false);
    onBack();
  };

  if (effectiveReadOnly || effectiveIsCandidate) {
    return (
      <AssessorAssessmentFormDocumentView
        applicationId={applicationId}
        formId={formId}
        candidateName={candidateName}
        formData={matchedCanonicalForm?.data}
        onBack={onBack}
        isCandidate={effectiveIsCandidate}
        formRecord={matchedCanonicalForm}
        applicationTrade={resolvedTrade}
        unitLabels={unitLabels}
        isInterviewStage={isInterviewStage}
      />
    );
  }

  const renderForm = () => {
    switch (formId) {
      case "skills_demo":
        return (
          <SkillsDemonstrationForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
          />
        );
      case "assessment_mapping":
        return (
          <AssessmentMappingForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
          />
        );
      case "observation_checklist":
        return (
          <PracticalObservationForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            isReadOnly={effectiveReadOnly}
            applicationTrade={resolvedTrade}
            unitLabels={unitLabels}
          />
        );
      case "interview_record":
      default:
        return (
          <InterviewRecordForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            formData={activeFormData}
            isReadOnly={effectiveReadOnly}
          />
        );
    }
  };

  return (
    <div className="w-full flex flex-col">
      {isNonLeadSeatedMember && hasCanonicalFormData && (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-2 flex items-center justify-between gap-2 flex-wrap shadow-2xs">
            <span className="text-xs font-semibold text-neutral-secondary px-2">
              Viewing mode:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveRecordTab("own")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeRecordTab === "own"
                    ? "bg-[#8A1538] text-white"
                    : "bg-gray-100 text-neutral-primary hover:bg-gray-200"
                }`}
              >
                My Panelist Record
              </button>
              <button
                type="button"
                onClick={() => setActiveRecordTab("canonical")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeRecordTab === "canonical"
                    ? "bg-[#8A1538] text-white"
                    : "bg-gray-100 text-neutral-primary hover:bg-gray-200"
                }`}
              >
                Lead Form (Canonical)
              </button>
            </div>
          </div>
        </div>
      )}

      {isNonLeadSeatedMember && activeRecordTab === "canonical" ? (
        <AssessorAssessmentFormDocumentView
          applicationId={applicationId}
          formId={formId}
          candidateName={candidateName}
          formData={matchedCanonicalForm?.data}
          onBack={onBack}
          isCandidate={false}
          formRecord={matchedCanonicalForm}
          applicationTrade={resolvedTrade}
          unitLabels={unitLabels}
          isInterviewStage={false}
        />
      ) : (
        renderForm()
      )}

      <ConfirmSubmitFormModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />

      <FormSubmittedSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessContinue}
      />
    </div>
  );
};
