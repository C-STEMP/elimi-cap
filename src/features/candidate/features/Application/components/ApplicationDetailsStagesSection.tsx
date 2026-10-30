"use client";

import React from "react";
import { FiCheckCircle, FiFileText, FiLock } from "react-icons/fi";
import { ApplicationStageCard } from "./ApplicationStageCard";
import type { StageConfig } from "../types";

interface ApplicationDetailsStagesSectionProps {
  isDraft: boolean;
  isPaymentPaid: boolean;
  isAppFormApproved?: boolean;
  isPaymentUnlocked?: boolean;
  paymentAmountText?: string;
  onMakePayment?: () => void;
  onEditApplication: () => void;
  stages: StageConfig[];
  children?: React.ReactNode;
}

export const ApplicationDetailsStagesSection: React.FC<ApplicationDetailsStagesSectionProps> = ({
  isDraft,
  isPaymentPaid,
  isAppFormApproved,
  isPaymentUnlocked,
  paymentAmountText,
  onMakePayment,
  onEditApplication,
  stages,
  children,
}) => {
  return (
    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
      <div className="flex flex-col gap-4 bg-white rounded-2xl p-4 shadow-2xs">
        {/* Draft Status / Approved (Pending Payment) / Locked Status Banner */}
        {isDraft ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-amber-900">
                  Draft Application
                </span>
                <span className="text-xs text-amber-700 font-normal">
                  This application is saved as a draft. You can continue editing your personal details and experience before submitting.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onEditApplication}
              className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-lg hover:bg-secondary/90 transition-all cursor-pointer whitespace-nowrap"
            >
              Edit Application
            </button>
          </div>
        ) : !isPaymentPaid && (isAppFormApproved || isPaymentUnlocked) ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-emerald-900">
                  Application Approved
                </span>
                <span className="text-xs text-emerald-700 font-normal">
                  Your application has been accepted by the Assessment Centre.
                  {paymentAmountText && paymentAmountText !== "—"
                    ? ` Please complete your assessment fee payment of ${paymentAmountText} to proceed.`
                    : " Please complete your assessment fee payment to proceed."}
                </span>
              </div>
            </div>
            {onMakePayment && (
              <button
                type="button"
                onClick={onMakePayment}
                className="px-5 py-2.5 bg-[#FBAB2A] hover:bg-[#e89b1f] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              >
                Make Payment{paymentAmountText && paymentAmountText !== "—" ? ` (${paymentAmountText})` : ""}
              </button>
            )}
          </div>
        ) : !isPaymentPaid ? (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
              <FiLock className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-green-900">
                Application Submitted
              </span>
              <span className="text-xs text-green-700 font-normal">
                This application has been submitted for review and is locked from further editing.
              </span>
            </div>
          </div>
        ) : null}

        {/* 1..4 Portfolio Sections (Induction, Candidate Profile, Standards, Assessment Reports/Evidences) */}
        {children}

        {/* Stages below number 4: Interview Stage, Internal Verifier, External Verifier, Certification */}
        {stages.map((stage) => (
          <ApplicationStageCard key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  );
};
