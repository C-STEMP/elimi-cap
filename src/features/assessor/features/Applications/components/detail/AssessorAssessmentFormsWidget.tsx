"use client";

import React from "react";
import { useToast } from "@/src/components/ui/toast";

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

interface AssessorAssessmentFormsWidgetProps {
  forms?: AssessmentFormItem[];
  onViewForm?: (form: AssessmentFormItem) => void;
}

export const AssessorAssessmentFormsWidget: React.FC<
  AssessorAssessmentFormsWidgetProps
> = ({ forms = DEFAULT_ASSESSMENT_FORMS, onViewForm }) => {
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
      <h4 className="text-base font-bold text-neutral-primary">
        Assessment Forms
      </h4>

      <div className="flex flex-col gap-2.5 w-full">
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-[#F8F9FA] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center justify-between gap-3 transition-all hover:bg-gray-100/70"
          >
            <span className="text-xs sm:text-sm font-semibold text-neutral-primary truncate">
              {form.name}
            </span>

            <button
              type="button"
              onClick={() => handleView(form)}
              className="text-[#FBAB2A] hover:text-[#E89B1F] font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
