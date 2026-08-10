"use client";

import React, { useState } from "react";
import { FiChevronLeft, FiCheckCircle, FiFlag } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";

import { CandidateApplicationFormView } from "./CandidateApplicationFormView";
import { AcceptApplicationModal } from "./AcceptApplicationModal";
import { ApplicationSidebarWidgets } from "./ApplicationSidebarWidgets";
import { AssignFacilitatorModal } from "../../Payment/components/AssignFacilitatorModal";
import { NotifyAwardingBodyModal } from "../../Payment/components/NotifyAwardingBodyModal";
import type { AssessorApplicationRecord } from "./AssessorApplicationsView";

interface AssessorApplicationDetailViewProps {
  application: AssessorApplicationRecord;
  onBack: () => void;
}

export const AssessorApplicationDetailView: React.FC<
  AssessorApplicationDetailViewProps
> = ({ application, onBack }) => {
  const { toast } = useToast();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isAccepted, setIsAccepted] = useState(true);
  const [isPaymentPaid] = useState(true);

  // Facilitator state
  const [isFacilitatorAssigned, setIsFacilitatorAssigned] = useState(false);
  const [facilitatorName, setFacilitatorName] = useState("Ngozi Eze");
  const [tradeName, setTradeName] = useState("Carpentry");

  // Modals visibility state
  const [isConfirmAcceptOpen, setIsConfirmAcceptOpen] = useState(false);
  const [isAssignFacilitatorOpen, setIsAssignFacilitatorOpen] = useState(false);
  const [isNotifyAwardingOpen, setIsNotifyAwardingOpen] = useState(false);
  const [isAwardingNotified, setIsAwardingNotified] = useState(false);

  const stages = [
    {
      id: "form",
      title: "Application Form",
      status: isAccepted ? "Approved" : "Pending",
      date: "Submitted on: 7/21/2026",
      canView: true,
    },
    {
      id: "payment",
      title: "Payment",
      status: isPaymentPaid ? "Successful" : "Not Started",
      date: isPaymentPaid ? "Paid On: 7/22/2026" : "--",
      amountText: "RPL Assessment Fee — Carpentry (Level 3)",
      amountValue: "₦45,000",
    },
    {
      id: "folder",
      title: "Folder Arrangement",
      status: isFacilitatorAssigned ? "14 Days Left" : "Not Started",
      date: isFacilitatorAssigned ? "Started on: 7/23/2026" : "--",
    },
    { id: "interview", title: "Interview Stage", status: "Not Started", date: "---" },
    { id: "verifier", title: "Internal Verifier", status: "Not Started", date: "---" },
    { id: "awarding", title: "Notify Awarding Body", status: isAwardingNotified ? "Completed" : "Not Started", date: "---" },
    { id: "external", title: "External Verifier", status: "Not Started", date: "---" },
    { id: "cert", title: "Certification", status: "Not Started", date: "---" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#a31d38] text-white p-6 rounded-3xl shadow-md">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              if (showApplicationForm) {
                setShowApplicationForm(false);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-2 text-white font-bold text-2xl sm:text-3xl hover:opacity-90 transition-opacity w-fit cursor-pointer"
          >
            <FiChevronLeft className="w-6 h-6 stroke-[2.5]" />
            <span>
              {showApplicationForm
                ? "Application Form"
                : application.candidateName}
            </span>
          </button>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90 font-normal">
            <span onClick={onBack} className="hover:underline cursor-pointer">
              Applications
            </span>
            <span>&gt;</span>
            <span
              onClick={() => setShowApplicationForm(false)}
              className={`${
                showApplicationForm ? "hover:underline cursor-pointer" : "font-semibold"
              }`}
            >
              {application.candidateName}
            </span>
            {showApplicationForm && (
              <>
                <span>&gt;</span>
                <span className="font-semibold">Application Form</span>
              </>
            )}
          </div>
        </div>

        {showApplicationForm && (
          <Button
            variant="amber"
            size="md"
            onClick={() => setIsConfirmAcceptOpen(true)}
            rightIcon={<FiCheckCircle className="w-4 h-4" />}
            className="bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shrink-0 cursor-pointer"
          >
            {isAccepted ? "Accepted ✓" : "Accept Application"}
          </Button>
        )}
      </div>

      {/* Main View Render */}
      {!showApplicationForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Stages List */}
          <div className="lg:col-span-8 flex flex-col gap-3.5">
            {stages.map((stg) => (
              <div
                key={stg.id}
                className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col gap-3 hover:border-gray-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
                        {stg.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          stg.status === "Approved" || stg.status === "Successful" || stg.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : stg.status === "14 Days Left" || stg.status === "Pending"
                            ? "bg-[#FEF3C7] text-[#D97706]"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {stg.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{stg.date}</span>
                  </div>

                  {stg.canView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApplicationForm(true)}
                      className="border-gray-200 text-neutral-primary hover:bg-gray-50 font-bold text-xs sm:text-sm px-6 h-9 rounded-xl cursor-pointer self-start sm:self-center"
                    >
                      View
                    </Button>
                  )}

                  {stg.id === "payment" && isPaymentPaid && (
                    !isFacilitatorAssigned ? (
                      <Button
                        variant="amber"
                        size="sm"
                        onClick={() => setIsAssignFacilitatorOpen(true)}
                        className="bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm px-5 h-10 rounded-xl shadow-md cursor-pointer self-start sm:self-center shrink-0"
                      >
                        Assign Facilitator
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAssignFacilitatorOpen(true)}
                        leftIcon={<FiFlag className="w-4 h-4 text-[#FBAB2A]" />}
                        className="border-[#FBAB2A] text-[#FBAB2A] hover:bg-amber-50 font-bold text-xs sm:text-sm px-4 h-10 rounded-xl cursor-pointer self-start sm:self-center shrink-0"
                      >
                        Change Facilitator
                      </Button>
                    )
                  )}

                  {stg.id === "folder" && isFacilitatorAssigned && (
                    <Button
                      variant="amber"
                      size="sm"
                      onClick={() =>
                        toast({
                          type: "info",
                          title: "Evidence Vault",
                          description: "Opening candidate evidence vault...",
                        })
                      }
                      className="bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm px-5 h-10 rounded-xl shadow-md cursor-pointer self-start sm:self-center shrink-0"
                    >
                      Evidence Vault
                    </Button>
                  )}
                </div>

                {stg.id === "payment" && !isPaymentPaid && stg.amountText && (
                  <div className="bg-gray-50/70 rounded-xl p-4 flex items-center justify-between border border-gray-100 mt-1">
                    <span className="text-xs sm:text-sm font-semibold text-neutral-primary">
                      {stg.amountText}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#a31d38]">
                      {stg.amountValue}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column: Widgets */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <ApplicationSidebarWidgets
              isFacilitatorAssigned={isFacilitatorAssigned}
              facilitatorName={facilitatorName}
              tradeName={tradeName}
            />
          </div>
        </div>
      ) : (
        <CandidateApplicationFormView
          candidateName={application.candidateName}
          trade={application.trade}
        />
      )}

      {/* Feature Modals */}
      <AcceptApplicationModal
        isOpen={isConfirmAcceptOpen}
        onClose={() => setIsConfirmAcceptOpen(false)}
        onSuccess={() => {
          setIsConfirmAcceptOpen(false);
          setIsAccepted(true);
        }}
      />

      <AssignFacilitatorModal
        isOpen={isAssignFacilitatorOpen}
        onClose={() => setIsAssignFacilitatorOpen(false)}
        onSuccess={(name, trade) => {
          setIsAssignFacilitatorOpen(false);
          setIsFacilitatorAssigned(true);
          setFacilitatorName(name);
          setTradeName(trade);
        }}
      />

      <NotifyAwardingBodyModal
        isOpen={isNotifyAwardingOpen}
        onClose={() => setIsNotifyAwardingOpen(false)}
        onSuccess={() => {
          setIsNotifyAwardingOpen(false);
          setIsAwardingNotified(true);
        }}
      />
    </div>
  );
};
