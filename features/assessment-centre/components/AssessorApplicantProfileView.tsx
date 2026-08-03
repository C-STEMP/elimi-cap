"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiFileText, FiEye } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { MOCK_ASSESSOR_APPLICANTS } from "../utils/constants";
import { ASSETS_URL } from "@/assets";
import {
  AssessorDecisionModal,
  AssessorDecisionModalMode,
} from "./AssessorDecisionModal";
import {
  AssessorRequestModal,
  AssessorRequestModalMode,
} from "./AssessorRequestModal";

interface AssessorApplicantProfileViewProps {
  applicantId: string;
  onBack: () => void;
}

export const AssessorApplicantProfileView: React.FC<
  AssessorApplicantProfileViewProps
> = ({ applicantId, onBack }) => {
  const { toast } = useToast();
  const applicant =
    MOCK_ASSESSOR_APPLICANTS.find((a) => a.id === applicantId) ||
    MOCK_ASSESSOR_APPLICANTS[0];

  const [status, setStatus] = useState(applicant.status);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionModalMode, setDecisionModalMode] =
    useState<AssessorDecisionModalMode>("confirm-shortlist");

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalMode, setRequestModalMode] =
    useState<AssessorRequestModalMode>("confirm-accept");

  const handleOpenAcceptModal = () => {
    setRequestModalMode("confirm-accept");
    setIsRequestModalOpen(true);
  };

  const handleOpenDeclineModal = () => {
    setStatus("Rejected");
    setRequestModalMode("declined-success");
    setIsRequestModalOpen(true);
  };

  const handleConfirmAccept = () => {
    setStatus("Shortlisted");
    setRequestModalMode("accepted-success");
  };

  const handleOpenShortlistModal = () => {
    setDecisionModalMode("confirm-shortlist");
    setIsDecisionModalOpen(true);
  };

  const handleOpenRejectModal = () => {
    setDecisionModalMode("confirm-reject");
    setIsDecisionModalOpen(true);
  };

  const handleConfirmShortlist = () => {
    setStatus("Shortlisted");
    setDecisionModalMode("shortlisted-success");
  };

  const handleConfirmReject = () => {
    setStatus("Rejected");
    setDecisionModalMode("rejected-success");
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner */}
      <div className="w-full bg-[#a31d38] text-white rounded-3xl p-6 sm:p-8 xl:p-10 flex flex-col gap-4 shadow-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-white/80 text-xs font-semibold select-none">
            <span>Requests</span>
            <span className="mx-1">&gt;</span>
            <span>Assessor</span>
            <span className="mx-1">&gt;</span>
            <span className="text-white">{applicant.name}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={onBack}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {applicant.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Assessor Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
            <Image
              src={ASSETS_URL.userAvatar}
              alt={applicant.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-primary">
              {applicant.name}
            </h2>

            <span className="text-xs text-gray-400 font-medium">
              {applicant.email} · {applicant.experienceYears} years experience
            </span>

            {/* Tag Pills */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {applicant.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#FCE7F3] text-[#9D174D] text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {status === "Shortlisted" ? (
            <span className="bg-[#D1FAE5] text-[#065F46] font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              Shortlisted
            </span>
          ) : status === "Rejected" ? (
            <span className="bg-[#FEE2E2] text-[#991B1B] font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              Rejected
            </span>
          ) : (
            <span className="bg-[#FEF3C7] text-[#D97706] font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Certificates & Qualification Section */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-4">
        <h3 className="text-lg font-extrabold text-neutral-primary tracking-tight">
          Certificates & Qualification
        </h3>

        <div className="flex flex-col gap-3">
          {applicant.certificates?.map((cert) => (
            <div
              key={cert.id}
              className="bg-[#F8F9FA] hover:bg-[#F3F4F6] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-500 flex items-center justify-center shrink-0">
                  <FiFileText className="w-5 h-5" />
                </div>

                <div className="flex flex-col">
                  <span className="font-extrabold text-sm sm:text-base text-neutral-primary">
                    {cert.title}
                  </span>
                  <span className="text-xs text-gray-400 font-medium mt-0.5">
                    {cert.issuer} · {cert.year}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-neutral-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Preview Certificate"
              >
                <FiEye className="w-4.5 h-4.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Section */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-4">
        <h3 className="text-lg font-extrabold text-neutral-primary tracking-tight">
          Decision
        </h3>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            onClick={handleOpenAcceptModal}
            variant="amber"
            size="md"
            className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
          >
            Accept
          </Button>

          <button
            type="button"
            onClick={handleOpenDeclineModal}
            className="px-8 h-11 text-white font-bold text-sm bg-[#C5221F] hover:bg-[#a81c19] rounded-xl shadow-sm cursor-pointer whitespace-nowrap transition-colors"
          >
            Decline
          </button>

          <Button
            type="button"
            onClick={handleOpenShortlistModal}
            variant="amber"
            size="md"
            className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a]/80 hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap ml-auto"
          >
            Shortlist Candidate
          </Button>

          <button
            type="button"
            onClick={handleOpenRejectModal}
            className="px-6 h-11 text-white font-bold text-sm bg-[#C5221F]/80 hover:bg-[#a81c19] rounded-xl shadow-sm cursor-pointer whitespace-nowrap transition-colors"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Shortlist / Reject Decision Modal */}
      <AssessorDecisionModal
        isOpen={isDecisionModalOpen}
        mode={decisionModalMode}
        onClose={() => setIsDecisionModalOpen(false)}
        onConfirmShortlist={handleConfirmShortlist}
        onConfirmReject={handleConfirmReject}
      />

      {/* Accept / Decline Request Modal */}
      <AssessorRequestModal
        isOpen={isRequestModalOpen}
        mode={requestModalMode}
        onClose={() => setIsRequestModalOpen(false)}
        onConfirmAccept={handleConfirmAccept}
      />
    </div>
  );
};
