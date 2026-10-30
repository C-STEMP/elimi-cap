"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/toast";
import type {
  InterviewForm,
  InterviewFormRecord,
} from "@/src/features/shared/applications/api/types";

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
  panelistRecords?: InterviewFormRecord[];
  isLeadPanelist?: boolean;
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
  panelistRecords,
  isLeadPanelist = true,
  isAwaitingPanelSignatures: _isAwaitingPanelSignatures = false,
  isInterviewDone: _isInterviewDone = false,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleView = (form: AssessmentFormItem) => {
    if (onViewForm) {
      onViewForm(form);
    } else if (applicationId) {
      router.push(`/applications/${applicationId}/assessment-forms/${form.id}?from=assessor`);
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
          const isMappingForm =
            form.id === "assessment_mapping" || form.id === "assessment_grid";
          const typeKey = FORM_TYPE_MAP[form.id] || form.id;
          const matchedRemote = remoteForms?.find(
            (rf) => rf.formType === typeKey || rf.formType === form.id,
          );
          const matchedPanelistRecord = panelistRecords?.find(
            (pr) => pr.formType === typeKey || pr.formType === form.id,
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

          const hasMyRecord = Boolean(
            matchedPanelistRecord?.data &&
              Object.keys(matchedPanelistRecord.data).length > 0,
          );
          const isMyRecordSubmitted = Boolean(
            hasMyRecord &&
              ((matchedPanelistRecord?.data as any)?.status === "submitted" ||
                (matchedPanelistRecord?.data as any)?.submittedAt ||
                (matchedPanelistRecord?.data as any)?.assessorSigned),
          );

          const isNonLeadEditable = !isLeadPanelist && !isReadOnly;
          const isCompletedForMe = isNonLeadEditable
            ? isMyRecordSubmitted
            : (isSubmitted || isCandidateSigned);

          const actionLabel =
            isMappingForm || isReadOnly || isCompletedForMe
              ? "View"
              : "Fill Form";

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
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(form);
                }}
                className="text-[#FBAB2A] hover:text-[#E89B1F] font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
              >
                {actionLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
