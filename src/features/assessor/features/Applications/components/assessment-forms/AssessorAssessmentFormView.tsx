"use client";

import React, { useState } from "react";
import { SkillsDemonstrationForm } from "./SkillsDemonstrationForm";
import { AssessmentMappingForm } from "./AssessmentMappingForm";
import { PracticalObservationForm } from "./PracticalObservationForm";
import { InterviewRecordForm } from "./InterviewRecordForm";
import { ConfirmSubmitFormModal } from "./ConfirmSubmitFormModal";
import { FormSubmittedSuccessModal } from "./FormSubmittedSuccessModal";

import { useGetInterviewForms, useUpdateInterviewForm } from "@/src/features/shared/applications/hooks";
import { useToast } from "@/src/components/ui/toast";

interface AssessorAssessmentFormViewProps {
  applicationId: string;
  formId: string;
  candidateName: string;
  onBack: () => void;
  isReadOnly?: boolean;
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
> = ({ applicationId, formId, candidateName, onBack, isReadOnly = false }) => {
  const { toast } = useToast();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const formType = FORM_MAP[formId] || "records";
  const { data: remoteForms } = useGetInterviewForms(applicationId);
  const updateFormMutation = useUpdateInterviewForm(applicationId);

  const matchedRemoteForm = remoteForms?.find((f) => f.formType === formType);
  const isCandidateSigned = Boolean(matchedRemoteForm?.candidateSignedAt);
  const effectiveReadOnly = isReadOnly || isCandidateSigned;

  const handleRequestSubmit = () => {
    if (effectiveReadOnly) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    try {
      await updateFormMutation.mutateAsync({
        formType,
        data: {
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

  const renderForm = () => {
    switch (formId) {
      case "skills_demo":
        return (
          <SkillsDemonstrationForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            isReadOnly={isReadOnly}
          />
        );
      case "assessment_mapping":
        return (
          <AssessmentMappingForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            isReadOnly={isReadOnly}
          />
        );
      case "observation_checklist":
        return (
          <PracticalObservationForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            isReadOnly={isReadOnly}
          />
        );
      case "interview_record":
      default:
        return (
          <InterviewRecordForm
            candidateName={candidateName}
            onBack={onBack}
            onSubmit={handleRequestSubmit}
            isReadOnly={isReadOnly}
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
