"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import type { InterviewForm } from "@/src/features/shared/applications/api/types";

export interface AssessmentFormItem {
  id: string;
  name: string;
}

export const DEFAULT_ASSESSMENT_FORMS: AssessmentFormItem[] = [
  { id: "skills_demo", name: "Skills Demonstration Records Form" },
  { id: "observation_checklist", name: "Practical Observation Record" },
  { id: "interview_record", name: "Interview Question Bank & Record Sheet" },
  { id: "assessment_mapping", name: "RPL Assessment Grid / Mapping Form" },
];

const FORM_TYPE_MAP: Record<string, string> = {
  skills_demo: "skill_demonstration",
  skill_demonstration: "skill_demonstration",
  assessment_mapping: "assessment_grid",
  assessment_grid: "assessment_grid",
  observation_checklist: "practical_observation",
  practical_observation: "practical_observation",
  interview_record: "records",
  records: "records",
};

interface AssessorAssessmentFormsWidgetProps {
  applicationId?: string;
  forms?: AssessmentFormItem[];
  onViewForm?: (form: AssessmentFormItem) => void;
  isReadOnly?: boolean;
  remoteForms?: InterviewForm[];
  isAwaitingPanelSignatures?: boolean;
  isInterviewDone?: boolean;
}

export const AssessorAssessmentFormsWidget: React.FC<
  AssessorAssessmentFormsWidgetProps
> = ({
  applicationId,
  forms = DEFAULT_ASSESSMENT_FORMS,
  onViewForm,
  isReadOnly = false,
  remoteForms,
  isAwaitingPanelSignatures = false,
  isInterviewDone = false,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleView = (form: AssessmentFormItem) => {
    if (onViewForm) {
      onViewForm(form);
    } else if (applicationId) {
      router.push(`/applications/${applicationId}/assessment-forms/${form.id}`);
    } else {
      toast({
        type: "info",
        title: form.name,
        description: `Opening ${form.name}...`,
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col gap-4 w-full select-text">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="text-base font-bold text-neutral-primary">
          Assessment Forms
        </h4>
      </div>

      <div className="flex flex-col gap-2.5 w-full">
        {forms.map((form) => {
          const typeKey = FORM_TYPE_MAP[form.id] || form.id;
          const matchedRemote = remoteForms?.find(
            (rf) => rf.formType === typeKey || rf.formType === form.id,
          );
          const isCandidateSigned = Boolean(matchedRemote?.candidateSignedAt);
          const isAssessorSigned = Boolean(
            matchedRemote?.assessorSignedAt ||
              (matchedRemote?.data as any)?.leadPanelistSigned ||
              (matchedRemote?.data as any)?.assessorSigned,
          );
          const isSubmitted = Boolean(
            isAssessorSigned ||
              matchedRemote?.status === "completed" ||
              (matchedRemote?.data as any)?.submittedAt,
          );
          const hasData = Boolean(
            matchedRemote?.data && Object.keys(matchedRemote.data).length > 0,
          );

          // If candidate signed:
          // A form is only fully completed/signed when candidate has signed AND interview stage is completed.
          // While interview stage is ongoing or awaiting panel signatures, it must show "Candidate Signed".
          const isFullySigned = isCandidateSigned && isInterviewDone && !isAwaitingPanelSignatures;
          const isPendingPanel = isCandidateSigned && (!isInterviewDone || isAwaitingPanelSignatures);

          return (
            <div
              key={form.id}
              onClick={() => handleView(form)}
              className="bg-[#F8F9FA] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center justify-between gap-3 transition-all hover:bg-gray-100/70 cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-neutral-primary group-hover:text-primary transition-colors truncate">
                  {form.name}
                </span>
                {isFullySigned ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    Signed
                  </span>
                ) : isPendingPanel ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                    Candidate Signed
                  </span>
                ) : isSubmitted ? (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                    Submitted
                  </span>
                ) : hasData ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                    Draft
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(form);
                }}
                className="text-[#FBAB2A] hover:text-[#E89B1F] font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
              >
                {isReadOnly || isCandidateSigned
                  ? "View"
                  : isSubmitted
                  ? "Edit"
                  : "Fill Form"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
