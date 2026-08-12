"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiFileText, FiEye } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { MOCK_ASSESSOR_APPLICANTS } from "@/features/assessment-centre/utils/constants";
import { ASSETS_URL } from "@/assets";
import {
  AssessorDecisionModal,
  AssessorDecisionModalMode,
} from "./AssessorDecisionModal";
import {
  AssessorRequestModal,
  AssessorRequestModalMode,
} from "../../AssessorRequest/components/AssessorRequestModal";

interface AssessorApplicantProfileViewProps {
  applicantId: string;
  onBack: () => void;
  isAssessorRequest?: boolean;
}

export const AssessorApplicantProfileView: React.FC<
  AssessorApplicantProfileViewProps
> = ({ applicantId, onBack, isAssessorRequest = true }) => {
  const { toast } = useToast();
  const applicant =
    MOCK_ASSESSOR_APPLICANTS.find((a) => a.id === applicantId) ||
    MOCK_ASSESSOR_APPLICANTS[0];

  const [status, setStatus] = useState(applicant.status);
  const [previewCertificateUrl, setPreviewCertificateUrl] = useState<
    string | null
  >(null);

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
    setRequestModalMode("confirm-decline");
    setIsRequestModalOpen(true);
  };

  const handleConfirmDecline = () => {
    setStatus("Rejected");
    setRequestModalMode("declined-success");
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
                onClick={() => setPreviewCertificateUrl(cert.title)}
                className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-neutral-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Preview Certificate"
              >
                <FiEye className="w-4.5 h-4.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Section (Image 1 & 4 match) */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-4">
        <h3 className="text-lg font-extrabold text-neutral-primary tracking-tight">
          Decision
        </h3>

        <div className="flex items-center gap-3 flex-wrap">
          {isAssessorRequest ? (
            <>
              <Button
                type="button"
                onClick={handleOpenAcceptModal}
                variant="amber"
                size="md"
                className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
              >
                Accept
              </Button>

              <button
                type="button"
                onClick={handleOpenDeclineModal}
                className="px-8 h-11 text-white font-bold text-sm bg-[#C5221F] hover:bg-[#a81c19] rounded-xl shadow-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                Decline
              </button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleOpenShortlistModal}
                variant="amber"
                size="md"
                className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
              >
                Shortlist Candidate
              </Button>

              <button
                type="button"
                onClick={handleOpenRejectModal}
                className="px-8 h-11 text-white font-bold text-sm bg-[#C5221F] hover:bg-[#a81c19] rounded-xl shadow-lg cursor-pointer whitespace-nowrap transition-colors"
              >
                Reject
              </button>
            </>
          )}
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
        onConfirmDecline={handleConfirmDecline}
      />

      {previewCertificateUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 select-none"
          onClick={() => setPreviewCertificateUrl(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewCertificateUrl(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiEye className="w-5 h-5" />
            </button>
            <FiFileText className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-lg font-extrabold text-neutral-primary mb-1">
              {previewCertificateUrl}
            </h3>
            <p className="text-xs text-gray-400 mb-6">Certificate Preview</p>
            <div className="w-full bg-[#F8F9FA] rounded-2xl p-8 border border-gray-100 flex items-center justify-center min-h-48">
              <span className="text-sm text-gray-400 font-medium">
                Certificate document preview
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewCertificateUrl(null)}
              className="mt-6 w-full h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
