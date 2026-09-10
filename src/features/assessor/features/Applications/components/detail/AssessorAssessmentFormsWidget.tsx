"use client";

import React from "react";
import { useToast } from "@/src/components/ui/toast";
import type { InterviewForm } from "@/src/features/shared/applications/api/types";

export interface AssessmentFormItem {
  id: string;
  name: string;
}

const DEFAULT_ASSESSMENT_FORMS: AssessmentFormItem[] = [
  { id: "skills_demo", name: "Skills Demonstration Form" },
  { id: "assessment_mapping", name: "Assessment Mapping Form" },
  { id: "interview_record", name: "Interview Record Form" },
  { id: "observation_checklist", name: "Observation Checklist Form" },
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
  forms?: AssessmentFormItem[];
  onViewForm?: (form: AssessmentFormItem) => void;
  isReadOnly?: boolean;
  remoteForms?: InterviewForm[];
}

export const AssessorAssessmentFormsWidget: React.FC<
  AssessorAssessmentFormsWidgetProps
> = ({
  forms = DEFAULT_ASSESSMENT_FORMS,
  onViewForm,
  isReadOnly = false,
  remoteForms,
}) => {
  const { toast } = useToast();

  const handleView = (form: AssessmentFormItem) => {
    if (onViewForm) {
      onViewForm(form);
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
        {isReadOnly ? (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            IV (View Only)
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Lead Panelist (Fill)
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 w-full">
        {forms.map((form) => {
          const typeKey = FORM_TYPE_MAP[form.id] || form.id;
          const matchedRemote = remoteForms?.find(
            (rf) => rf.formType === typeKey || rf.formType === form.id,
          );
          const isSigned = Boolean(matchedRemote?.candidateSignedAt);
          const isSubmitted = Boolean(
            matchedRemote?.assessorSignedAt ||
              matchedRemote?.status === "completed" ||
              (matchedRemote?.data as any)?.submittedAt,
          );
          const hasData = Boolean(
            matchedRemote?.data && Object.keys(matchedRemote.data).length > 0,
          );

          return (
            <div
              key={form.id}
              className="bg-[#F8F9FA] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center justify-between gap-3 transition-all hover:bg-gray-100/70"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-neutral-primary truncate">
                  {form.name}
                </span>
                {isSigned ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    Signed
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
                onClick={() => handleView(form)}
                className="text-[#FBAB2A] hover:text-[#E89B1F] font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
              >
                {isReadOnly || isSigned
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
