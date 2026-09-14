"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { Button } from "@/src/components/ui/button";
import { FiEdit2, FiLock } from "react-icons/fi";
import { ApplicationDetailsPageProps } from "../types";
import { useApplicationDetailsState } from "../hooks";
import { NsqApplicationDetailView } from "../components/nsq/NsqApplicationDetailView";
import { ApplicationDetailsStagesSection } from "../components/ApplicationDetailsStagesSection";
import { ApplicationDetailsSidebar } from "../components/ApplicationDetailsSidebar";
import { ApplicationDetailsModals } from "../components/ApplicationDetailsModals";

export const ApplicationDetailsPage: React.FC<ApplicationDetailsPageProps> = ({ id }) => {
  const router = useRouter();
  const state = useApplicationDetailsState(id);

  if (state.isLoading) {
    return (
      <div className="w-full flex flex-col min-h-screen">
        <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 bg-white rounded-2xl p-4 shadow-2xs animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#F8F9FA] rounded-[20px] p-4 sm:p-6 border border-gray-100/70 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-4 bg-gray-200 rounded w-40" />
                    <div className="h-5 bg-gray-200 rounded-full w-20" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 animate-pulse">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                <div className="h-40 bg-gray-100 rounded" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-4">
                <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.apiApp?.type === "NSQ" || (state.application as any)?.type === "NSQ" || id === "nsq") {
    return <NsqApplicationDetailView application={state.apiApp || state.application || { type: "NSQ" }} />;
  }

  if (!state.application) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 p-6">
        <p className="text-gray-700 text-lg font-bold">Application Not Found</p>
        <p className="text-gray-400 text-sm max-w-md">
          This application could not be found or you do not have permission to view it.
        </p>
        <Button onClick={() => router.push("/dashboard/applications")} className="mt-2">
          Back to My Applications
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col min-h-screen"
    >
      <HeaderBanner
        backHref="/dashboard/applications"
        backTitle={state.application.title}
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: state.application.title },
        ]}
        showCreateButton={!state.isDraft}
        rightAction={
          state.isDraft ? (
            <button
              type="button"
              onClick={state.handleEditApplication}
              className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 select-none"
            >
              <FiEdit2 className="w-4 h-4" />
              <span>Edit Application</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-white text-xs font-semibold select-none">
              <FiLock className="w-3.5 h-3.5" />
              <span>Submitted & Locked</span>
            </div>
          )
        }
      />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <ApplicationDetailsStagesSection
            isDraft={state.isDraft}
            isPaymentPaid={state.isPaymentPaid}
            onEditApplication={state.handleEditApplication}
            stages={state.stages}
          />

          <ApplicationDetailsSidebar
            activeInterviewSchedule={state.activeInterviewSchedule}
            isInterviewScheduled={state.isInterviewScheduled}
            isAtInterviewStage={state.isAtInterviewStage}
            facilitatorData={state.facilitatorData}
            onRequestCall={() => state.setIsCallRequestModalOpen(true)}
            formsToSign={state.formsToSign}
            onOpenForm={state.handleOpenForm}
          />
        </div>
      </div>

      <ApplicationDetailsModals
        activePaymentModal={state.activePaymentModal}
        paymentErrorInfo={state.paymentErrorInfo}
        onClosePaymentModal={() => state.setActivePaymentModal(null)}
        onPaymentAction={
          state.activePaymentModal === "success"
            ? state.handleStartFolderArrangement
            : state.activePaymentModal === "cancelled" || state.activePaymentModal === "unsuccessful"
              ? state.handleMakePayment
              : undefined
        }
        isCallRequestModalOpen={state.isCallRequestModalOpen}
        onCloseCallModal={() => state.setIsCallRequestModalOpen(false)}
        onConfirmCallModal={state.handleConfirmCallModal}
        isFormModalOpen={state.isFormModalOpen}
        onCloseFormModal={() => state.setIsFormModalOpen(false)}
        applicationId={state.application.id}
        isSignatureModalOpen={state.isSignatureModalOpen}
        onCloseSignatureModal={() => state.setIsSignatureModalOpen(false)}
        onSignatureSuccess={() => {}}
        isInterviewFormModalOpen={state.isInterviewFormModalOpen}
        onCloseInterviewFormModal={() => state.setIsInterviewFormModalOpen(false)}
        selectedInterviewFormType={state.selectedInterviewFormType}
        interviewForms={state.interviewForms}
        candidateName={state.apiApp?.candidate?.name || "Candidate"}
        isAppealModalOpen={state.isAppealModalOpen}
        onCloseAppealModal={() => state.setIsAppealModalOpen(false)}
        isReceiptModalOpen={state.isReceiptModalOpen}
        onCloseReceiptModal={() => state.setIsReceiptModalOpen(false)}
        transactionReceipt={state.transactionReceipt}
      />
    </motion.div>
  );
};
