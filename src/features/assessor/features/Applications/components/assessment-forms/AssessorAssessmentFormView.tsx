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
  useGetInterviewForms,
  useUpdateInterviewForm,
  useGetApplicationById,
} from "@/src/features/shared/applications/hooks";
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
  applicationTrade?: string;
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
  applicationTrade,
}) => {
  const { toast } = useToast();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<Record<string, any> | null>(null);

  const { data: applicationData } = useGetApplicationById(applicationId);
  const resolvedTrade =
    applicationTrade ||
    applicationData?.trade?.name ||
    (typeof (applicationData as any)?.trade === "string" ? (applicationData as any).trade : "") ||
    "";

  // Signing these forms is an "interview stage" action on the backend — once
  // the application has moved on (e.g. to external verification), signing
  // always fails, so the sign controls must not be offered any more.
  const isInterviewStage = applicationData?.currentStageKey === "interview";

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

  const { data: remoteForms } = useGetInterviewForms(applicationId);
  const updateFormMutation = useUpdateInterviewForm(applicationId);

  const matchedRemoteForm = remoteForms?.find((f) => f.formType === formType);
  const isCandidateSigned = Boolean(matchedRemoteForm?.candidateSignedAt);
  const effectiveReadOnly = isReadOnly || isCandidateSigned;

  const handleRequestSubmit = (data: Record<string, any>) => {
    if (effectiveReadOnly) return;
    setPendingFormData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    try {
      await updateFormMutation.mutateAsync({
        formType,
        data: {
          ...(matchedRemoteForm?.data || {}),
          ...(pendingFormData || {}),
          submittedAt: new Date().toISOString(),
          status: "submitted",
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

  const user = useAppSelector((state) => state.auth.user);
  const isCandidateUser = user?.role?.toLowerCase() === "candidate";
  const effectiveIsCandidate = isCandidate || isCandidateUser;

  if (effectiveReadOnly || effectiveIsCandidate) {
    return (
      <AssessorAssessmentFormDocumentView
        applicationId={applicationId}
        formId={formId}
        candidateName={candidateName}
        formData={matchedRemoteForm?.data}
        onBack={onBack}
        isCandidate={effectiveIsCandidate}
        formRecord={matchedRemoteForm}
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
            formData={matchedRemoteForm?.data}
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
            formData={matchedRemoteForm?.data}
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
            formData={matchedRemoteForm?.data}
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
            formData={matchedRemoteForm?.data}
            isReadOnly={effectiveReadOnly}
          />
        );
    }
  };

  return (
    <div className="w-full flex flex-col">
      {renderForm()}

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
