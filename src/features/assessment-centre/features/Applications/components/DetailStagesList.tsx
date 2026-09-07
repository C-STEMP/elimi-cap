"use client";

import React from "react";
import { FiFlag } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { getStatusBadge } from "../utils/detailHelpers";

interface DetailStagesListProps {
  submittedDate: string;
  onOpenCandidateForm: () => void;
  onOpenEvidenceVault?: () => void;
  appFormStatus: string;
  paymentStatus: string;
  paymentDate: string;
  isPaymentPaid: boolean;
  isAppFormExplicitlyApproved: boolean;
  activeFacilitator: any;
  isAtInterviewStage: boolean;
  evidenceStatus: string;
  evidenceDate: string;
  interviewStatus: string;
  interviewDate: string;
  interviewDateFormatted: string;
  isInterviewScheduled: boolean;
  interviewAssessorsList: any[];
  resolvedTradeName: string;
  ivStatus: string;
  ivDate: string;
  activeIv: any;
  evStatus: string;
  evDate: string;
  activeEv: any;
  certStatus: string;
  certDate: string;
  onOpenAssignFacilitator: () => void;
  onOpenRescheduleModal: () => void;
  onOpenScheduleModal: () => void;
  onOpenAssignVerifier: (type: "internal" | "external") => void;
  onOpenReviewVerifier: (type: "internal" | "external") => void;
}

export const DetailStagesList: React.FC<DetailStagesListProps> = ({
  submittedDate,
  onOpenCandidateForm,
  onOpenEvidenceVault,
  appFormStatus,
  paymentStatus,
  paymentDate,
  isPaymentPaid,
  isAppFormExplicitlyApproved,
  activeFacilitator,
  isAtInterviewStage,
  evidenceStatus,
  evidenceDate,
  interviewStatus,
  interviewDate,
  interviewDateFormatted,
  isInterviewScheduled,
  interviewAssessorsList,
  resolvedTradeName,
  ivStatus,
  ivDate,
  activeIv,
  evStatus,
  evDate,
  activeEv,
  certStatus,
  certDate,
  onOpenAssignFacilitator,
  onOpenRescheduleModal,
  onOpenScheduleModal,
  onOpenAssignVerifier,
  onOpenReviewVerifier,
}) => {
  return (
    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
      {/* Stage 1: Application Form */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">Application Form</h3>
            <span className={`${getStatusBadge(appFormStatus).className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
              {getStatusBadge(appFormStatus).text}
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-normal">Submitted on: {submittedDate}</p>
        </div>
        <Button
          type="button"
          onClick={onOpenCandidateForm}
          variant="outline"
          size="sm"
          className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl cursor-pointer shrink-0"
        >
          View
        </Button>
      </div>

      {/* Stage 2: Payment */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">Payment</h3>
            <span className={`${getStatusBadge(paymentStatus).className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
              {getStatusBadge(paymentStatus).text}
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-normal">
            {isPaymentPaid ? `Paid On: ${paymentDate}` : isAppFormExplicitlyApproved ? "Awaiting candidate payment" : "Awaiting centre approval"}
          </p>
        </div>
        {paymentStatus === "Successful" ? (
          activeFacilitator || isAtInterviewStage || isInterviewScheduled || evidenceStatus === "Marked as complete" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenAssignFacilitator}
              className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 shadow-none!"
            >
              <FiFlag className="w-4 h-4 text-[#fbab2a]" />
              <span>Change Facilitator</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onOpenAssignFacilitator}
              className="bg-[#fbab2a]! hover:bg-[#e89b1f]! text-white! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl cursor-pointer shrink-0 shadow-none!"
            >
              Assign Facilitator
            </Button>
          )
        ) : (
          <span className="text-gray-400 font-bold text-sm shrink-0">{paymentDate}</span>
        )}
      </div>

      {/* Stage 3: Folder Arrangement */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">Evidence Vault</h3>
            {evidenceStatus === "Under Review" ? (
              <span className="bg-[#EBF3FF] text-[#1D4ED8] text-xs font-semibold px-3 py-0.5 rounded-full capitalize">Awaiting Feedback</span>
            ) : evidenceStatus === "In Progress" ? (
              <span className="bg-[#FFF4E5] text-[#B45309] border border-[#FDE6B0] text-xs font-semibold px-3 py-0.5 rounded-full capitalize">14 Days Left</span>
            ) : (
              <span className={`${getStatusBadge(evidenceStatus).className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                {getStatusBadge(evidenceStatus).text}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-normal">Started on: {evidenceDate}</p>
        </div>
        <Button
          type="button"
          onClick={() => onOpenEvidenceVault?.()}
          variant="outline"
          size="sm"
          className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl cursor-pointer shrink-0 shadow-none!"
        >
          Evidence Vault
        </Button>
      </div>

      {/* Stage 4: Interview Stage */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">Interview Stage</h3>
              <span className={`${interviewStatus === "Completed" ? "bg-[#E6F4EA] text-[#1E7F4C]" : isInterviewScheduled || interviewStatus === "In Progress" ? "bg-[#FEF3C7] text-[#92400E]" : "bg-gray-100 text-gray-500"} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
                {interviewStatus === "Completed" ? "Completed" : isInterviewScheduled ? "Awaiting Interview" : interviewStatus === "In Progress" ? "In Progress" : "Not Started"}
              </span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm font-normal">
              {interviewStatus === "Completed" ? `Completed on: ${interviewDate}` : isInterviewScheduled && interviewDateFormatted ? `Scheduled for: ${interviewDateFormatted}` : "Not scheduled yet"}
            </p>
          </div>

          {interviewStatus === "Completed" ? (
            <Button type="button" variant="outline" size="sm" className="bg-white! text-[#fbab2a]! border border-gray-200! hover:bg-gray-50! font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer shrink-0 shadow-none!">
              View
            </Button>
          ) : isInterviewScheduled ? (
            <Button type="button" variant="outline" size="sm" onClick={onOpenRescheduleModal} className="bg-white! text-[#fbab2a]! border border-[#fbab2a]! hover:bg-[#FFFBEB]! font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer shrink-0 shadow-none!">
              Reschedule Interview
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!isPaymentPaid}
                onClick={() => isPaymentPaid && onOpenScheduleModal()}
                className={`font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-none! shrink-0 transition-all ${isPaymentPaid ? "bg-[#fbab2a]! hover:bg-[#e89b1f]! text-white! cursor-pointer" : "bg-gray-200! text-gray-400! border-gray-200! cursor-not-allowed opacity-60 pointer-events-auto"}`}
              >
                Schedule Interview
              </Button>
              {!isPaymentPaid && <span className="text-[10px] text-gray-400 font-medium">Requires completed payment</span>}
            </div>
          )}
        </div>

        {isInterviewScheduled && (
          <div className="mt-2 pt-3 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-3">YOUR ASSESORS</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {interviewAssessorsList.slice(0, 3).map((assessor, idx) => (
                <div key={assessor.id || idx} className={`bg-white rounded-2xl p-4 flex items-center gap-3.5 border transition-all ${idx === 1 || assessor.isHighlighted ? "border-2 border-[#FBAB2A] shadow-xs" : "border-gray-100 shadow-2xs"}`}>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                    <img src={assessor.avatar || "/images/facilitator_ngozi.jpg"} alt={assessor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-black font-bold text-sm leading-snug truncate">{assessor.name}</h4>
                    <p className="text-gray-400 text-xs font-normal truncate mt-0.5">{assessor.role || (idx === 0 ? "Lead Panelist" : "Panel Member")}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {(assessor.tags || [resolvedTradeName, "RPL Coordinator"]).map((tag: string) => (
                        <span key={tag} className="bg-[#FDF2F4] text-[#A31D38] text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stage 5: Internal Verifier */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">Internal Verifier</h3>
            <span className={`${getStatusBadge(ivStatus).className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
              {getStatusBadge(ivStatus).text}
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-normal">
            {activeIv ? `Assigned to: ${activeIv.name || "Assigned IV"}` : ivStatus === "In Progress" ? "Under review by Internal Verifier" : ivStatus === "Completed" ? "Internal verification completed" : "---"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400 font-bold text-sm hidden sm:inline">{ivDate}</span>
          {!activeIv && ivStatus !== "Not Started" && ivStatus !== "Completed" && (
            <Button type="button" variant="amber" size="sm" onClick={() => onOpenAssignVerifier("internal")} className="cursor-pointer text-xs">Assign IV</Button>
          )}
          {activeIv && ivStatus !== "Not Started" && ivStatus !== "Completed" && (
            <Button type="button" variant="amber" size="sm" onClick={() => onOpenReviewVerifier("internal")} className="cursor-pointer text-xs">Mark Competent</Button>
          )}
        </div>
      </div>

      {/* Stage 6: External Verifier */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">External Verifier</h3>
            <span className={`${getStatusBadge(evStatus).className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
              {getStatusBadge(evStatus).text}
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-normal">
            {activeEv ? `Assigned to: ${activeEv.name || "Assigned EV"}` : evStatus === "In Progress" ? "Under review by External Verifier" : evStatus === "Completed" ? "External verification completed" : "---"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400 font-bold text-sm hidden sm:inline">{evDate}</span>
          {!activeEv && evStatus !== "Not Started" && evStatus !== "Completed" && (
            <Button type="button" variant="amber" size="sm" onClick={() => onOpenAssignVerifier("external")} className="cursor-pointer text-xs">Assign EV</Button>
          )}
          {activeEv && evStatus !== "Not Started" && evStatus !== "Completed" && (
            <Button type="button" variant="amber" size="sm" onClick={() => onOpenReviewVerifier("external")} className="cursor-pointer text-xs">Mark Competent</Button>
          )}
        </div>
      </div>

      {/* Stage 7: Certification */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-black font-bold text-base sm:text-lg lg:text-xl tracking-tight">Certification</h3>
            <span className={`${getStatusBadge(certStatus).className} text-xs font-semibold px-3 py-0.5 rounded-full capitalize`}>
              {getStatusBadge(certStatus).text}
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-normal">
            {certStatus === "Competent" ? "All requirements completed. Candidate qualification certified." : certStatus === "In Progress" ? "Certification pending awarding body signoff" : "---"}
          </p>
        </div>
        <span className="text-gray-400 font-bold text-sm shrink-0">{certDate}</span>
      </div>
    </div>
  );
};
