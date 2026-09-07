"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";

interface Props {
  stages: any[];
  appDetail: any;
  isAccepted: boolean;
  isReviewPending: boolean;
  onOpenAccept: () => void;
  onOpenReject: () => void;
}

export const CandidateDecisionSidebar: React.FC<Props> = ({
  stages,
  appDetail,
  isAccepted,
  isReviewPending,
  onOpenAccept,
  onOpenReject,
}) => {
  const appFormStage = stages.find(
    (s) =>
      s.stageKey === "application_form" ||
      s.stageKey === "application_review" ||
      s.stageKey === "application",
  );

  const isApproved = Boolean(
    isAccepted ||
      appFormStage?.status === "successful" ||
      (appFormStage?.status as string) === "approved" ||
      (appDetail?.currentStageKey &&
        appDetail.currentStageKey !== "application_form" &&
        appDetail.currentStageKey !== "application_review" &&
        appDetail.currentStageKey !== "draft" &&
        appDetail.currentStageKey !== "submitted"),
  );

  const isRejected = Boolean(
    appFormStage?.status === "rejected" || appDetail?.status === "rejected",
  );

  return (
    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 no-print">
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
        <h3 className="text-base font-extrabold text-black tracking-tight">Application Decision</h3>

        {isApproved ? (
          <div className="bg-[#E6F4EA] border border-[#1E7F4C]/20 rounded-2xl p-4 flex flex-col gap-1.5 text-center">
            <span className="text-xs font-bold text-[#1E7F4C]">✓ Application Approved</span>
            <span className="text-[11px] text-gray-600">
              This application has been approved by the centre and is active in the assessment pipeline.
            </span>
          </div>
        ) : isRejected ? (
          <div className="bg-[#FCE8EB] border border-[#A31D38]/20 rounded-2xl p-4 flex flex-col gap-1.5 text-center">
            <span className="text-xs font-bold text-[#A31D38]">✕ Application Rejected</span>
            <span className="text-[11px] text-gray-600">
              This application has been rejected by the assessment centre.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500 font-normal">
              Review the details submitted by the candidate and record your decision.
            </p>
            <div className="flex flex-col gap-2.5">
              <Button
                type="button"
                onClick={onOpenAccept}
                variant="amber"
                fullWidth
                disabled={isReviewPending}
                className="bg-[#1E7F4C] hover:bg-[#18663D] text-white font-bold text-sm py-3 rounded-xl shadow-md cursor-pointer"
              >
                Approve Application
              </Button>
              <Button
                type="button"
                onClick={onOpenReject}
                variant="outline"
                fullWidth
                disabled={isReviewPending}
                className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm py-3 rounded-xl cursor-pointer"
              >
                Reject Application
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
