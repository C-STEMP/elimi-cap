"use client";

import React, { useState } from "react";
import { SkillsDemonstrationForm } from "./SkillsDemonstrationForm";
import { AssessmentMappingForm } from "./AssessmentMappingForm";
import { PracticalObservationForm } from "./PracticalObservationForm";
import { InterviewRecordForm } from "./InterviewRecordForm";
import { ConfirmSubmitFormModal } from "./ConfirmSubmitFormModal";
import { FormSubmittedSuccessModal } from "./FormSubmittedSuccessModal";

interface AssessorAssessmentFormViewProps {
  formId: string;
  candidateName: string;
  onBack: () => void;
  isReadOnly?: boolean;
}

export const AssessorAssessmentFormView: React.FC<
  AssessorAssessmentFormViewProps
> = ({ formId, candidateName, onBack, isReadOnly = false }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleRequestSubmit = () => {
    if (isReadOnly) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false);
    setIsSuccessModalOpen(true);
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
