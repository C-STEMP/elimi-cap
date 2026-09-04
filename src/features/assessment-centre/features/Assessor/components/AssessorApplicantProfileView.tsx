"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiFileText, FiEye, FiExternalLink } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { Avatar } from "@/src/components/ui/avatar";
import { Loader } from "@/src/components/ui/loader";
import { ASSETS_URL } from "@/assets";
import {
  useGetRetainedRequestDetail,
  useApproveRetainedRequest,
  useRejectRetainedRequest,
  useGetJobPostingApplicationDetail,
  usePatchJobPostingApplicationDecision,
} from "@/src/features/shared/centre/hooks";
import {
  AssessorDecisionModal,
  AssessorDecisionModalMode,
} from "./AssessorDecisionModal";
import {
  AssessorRequestModal,
  AssessorRequestModalMode,
} from "../../AssessorRequest/components/AssessorRequestModal";
import {
  CertificatePreviewModal,
  CertificatePreviewData,
} from "@/src/features/shared/settings/components/CertificatePreviewModal";

interface AssessorApplicantProfileViewProps {
  applicantId: string;
  jobId?: string;
  onBack: () => void;
  isAssessorRequest?: boolean;
}

const CERTIFICATE_KIND_LABELS: Record<string, string> = {
  qaa: "Quality Assurance Assessor (QAA)",
  iqm: "Internal Quality Management (IQM)",
  ev: "External Verifier (EV)",
  iv: "Internal Verifier (IV)",
};

export const AssessorApplicantProfileView: React.FC<
  AssessorApplicantProfileViewProps
> = ({ applicantId, jobId, onBack, isAssessorRequest = true }) => {
  // Query real data based on whether this is a retained assessor request or job applicant
  const {
    data: retainedRequest,
    isLoading: isLoadingRetained,
    isError: isErrorRetained,
  } = useGetRetainedRequestDetail(applicantId, {
    enabled: isAssessorRequest && !!applicantId,
  });

  const {
    data: jobApplication,
    isLoading: isLoadingJobApp,
    isError: isErrorJobApp,
  } = useGetJobPostingApplicationDetail(jobId || "", applicantId, {
    enabled: !isAssessorRequest && !!jobId && !!applicantId,
  });

  // Mutations
  const approveRetainedMutation = useApproveRetainedRequest();
  const rejectRetainedMutation = useRejectRetainedRequest();
  const patchDecisionMutation = usePatchJobPostingApplicationDecision();

  // Modals state
  const [previewCertificate, setPreviewCertificate] =
    useState<CertificatePreviewData | null>(null);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionModalMode, setDecisionModalMode] =
    useState<AssessorDecisionModalMode>("confirm-shortlist");

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalMode, setRequestModalMode] =
    useState<AssessorRequestModalMode>("confirm-accept");

  const isLoading = isAssessorRequest ? isLoadingRetained : isLoadingJobApp;
  const isError = isAssessorRequest ? isErrorRetained : isErrorJobApp;

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-3xl p-16 flex items-center justify-center min-h-80 shadow-2xs border border-gray-100/80">
        <Loader
          fullscreen={false}
          size="small"
          tip="Loading assessor profile..."
        />
      </div>
    );
  }

  if (isError || (isAssessorRequest ? !retainedRequest : !jobApplication)) {
    return (
      <div className="w-full bg-white rounded-3xl p-12 flex flex-col items-center justify-center gap-4 text-center min-h-80 shadow-2xs border border-gray-100/80">
        <p className="text-gray-500 font-medium text-sm">
          Assessor profile details could not be found.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="cursor-pointer"
        >
          Back
        </Button>
      </div>
    );
  }

  // Extract snapshot from retained request or job application
  const assessorSnapshot = isAssessorRequest
    ? retainedRequest?.assessor
    : jobApplication?.assessor;

  const assessorName =
    assessorSnapshot?.name ||
    (isAssessorRequest && retainedRequest?.assessorId
      ? `Assessor (${retainedRequest.assessorId.slice(0, 8)})`
      : "Assessor");

  const assessorEmail =
    assessorSnapshot?.email ||
    (isAssessorRequest && retainedRequest?.assessorId
      ? `${retainedRequest.assessorId.slice(0, 8)}@assessor.ng`
      : "No email provided");

  const experienceYears = assessorSnapshot?.yearsOfExperience ?? 0;
  const qualifications = assessorSnapshot?.qualifications || [];
  const sectors = (assessorSnapshot?.sectors || []).map((s) => s.name);
  const certificates = assessorSnapshot?.certificates || [];

  const rawStatus = isAssessorRequest
    ? retainedRequest?.status || "pending"
    : jobApplication?.status || "applied";

  // Handlers for Retained Request (Accept / Decline)
  const handleOpenAcceptModal = () => {
    setRequestModalMode("confirm-accept");
    setIsRequestModalOpen(true);
  };

  const handleOpenDeclineModal = () => {
    setRequestModalMode("confirm-decline");
    setIsRequestModalOpen(true);
  };

  const handleConfirmAccept = () => {
    approveRetainedMutation.mutate(applicantId, {
      onSuccess: () => {
        setRequestModalMode("accepted-success");
      },
    });
  };

  const handleConfirmDecline = () => {
    rejectRetainedMutation.mutate(applicantId, {
      onSuccess: () => {
        setRequestModalMode("declined-success");
      },
    });
  };

  // Handlers for Job Posting Application (Shortlist / Reject)
  const handleOpenShortlistModal = () => {
    setDecisionModalMode("confirm-shortlist");
    setIsDecisionModalOpen(true);
  };

  const handleOpenRejectModal = () => {
    setDecisionModalMode("confirm-reject");
    setIsDecisionModalOpen(true);
  };

  const handleConfirmShortlist = () => {
    if (!jobId) return;
    patchDecisionMutation.mutate(
      {
        id: jobId,
        applicationId: applicantId,
        decision: "shortlist",
      },
      {
        onSuccess: () => {
          setDecisionModalMode("shortlisted-success");
        },
      },
    );
  };

  const handleConfirmReject = () => {
    if (!jobId) return;
    patchDecisionMutation.mutate(
      {
        id: jobId,
        applicationId: applicantId,
        decision: "reject",
      },
      {
        onSuccess: () => {
          setDecisionModalMode("rejected-success");
        },
      },
    );
  };

  const isPending = isAssessorRequest
    ? rawStatus === "pending"
    : rawStatus === "applied";

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Assessor Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar
            src={(assessorSnapshot as any)?.avatar || (assessorSnapshot as any)?.photo?.url}
            name={assessorName}
            className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 border border-gray-100"
            alt={assessorName}
          />

          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-primary">
              {assessorName}
            </h2>

            <span className="text-xs text-gray-400 font-medium">
              {assessorEmail} · {experienceYears} {experienceYears === 1 ? "year" : "years"} experience
            </span>

            {/* Tag Pills */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {qualifications.map((tag, idx) => (
                <span
                  key={`qual-${idx}`}
                  className="bg-[#FCE7F3] text-[#9D174D] text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}

              {sectors.map((sec, idx) => (
                <span
                  key={`sec-${idx}`}
                  className="bg-[#EFF6FF] text-[#1D4ED8] text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {sec}
                </span>
              ))}

              {isAssessorRequest && retainedRequest?.preferredRole && (
                <span className="bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  {retainedRequest.preferredRole.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {rawStatus === "approved" || rawStatus === "accepted" ? (
            <span className="bg-[#1E7F4C]/10 text-[#1E7F4C] font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              {isAssessorRequest ? "Approved" : "Shortlisted"}
            </span>
          ) : rawStatus === "rejected" ? (
            <span className="bg-[#FEE2E2] text-[#991B1B] font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              Rejected
            </span>
          ) : rawStatus === "revoked" ? (
            <span className="bg-gray-200 text-gray-700 font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
              Revoked
            </span>
          ) : (
            <span className="bg-[#F9A825]/10 text-[#F9A825] font-semibold px-4 py-1.5 rounded-full text-xs inline-block">
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

        {certificates.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-400 font-normal py-3">
            No uploaded certificates available for this assessor.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {certificates.map((cert, idx) => {
              const label =
                CERTIFICATE_KIND_LABELS[cert.kind?.toLowerCase()] ||
                `${cert.kind?.toUpperCase()} Certificate`;

              return (
                <div
                  key={cert.assetId || idx}
                  className="bg-[#F8F9FA] hover:bg-[#F3F4F6] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-500 flex items-center justify-center shrink-0">
                      <FiFileText className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm sm:text-base text-neutral-primary">
                        {label}
                      </span>
                      <span className="text-xs text-gray-400 font-medium mt-0.5">
                        Verification Status: Verified
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewCertificate({
                        title: label,
                        url: cert.url || undefined,
                        assetId: cert.assetId || undefined,
                      })
                    }
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-neutral-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Preview Certificate"
                  >
                    <FiEye className="w-4.5 h-4.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decision Section */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-4">
        <h3 className="font-extrabold text-lg text-neutral-primary">
          Decision
        </h3>
        <p className="text-xs text-gray-500 font-normal">
          {isAssessorRequest
            ? "Approve or decline this assessor's application to join your retained roster."
            : "Review this applicant and record your hiring or shortlisting decision."}
        </p>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {isPending ? (
            isAssessorRequest ? (
              <>
                <Button
                  type="button"
                  variant="amber"
                  size="md"
                  onClick={() => {
                    setRequestModalMode("confirm-accept");
                    setIsRequestModalOpen(true);
                  }}
                  className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer"
                >
                  Accept Request
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestModalMode("confirm-decline");
                    setIsRequestModalOpen(true);
                  }}
                  className="px-6 h-11 bg-white border border-red-200 text-red-700 hover:bg-red-50 font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Decline
                </button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="amber"
                  size="md"
                  onClick={() => {
                    setDecisionModalMode("confirm-shortlist");
                    setIsDecisionModalOpen(true);
                  }}
                  className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer"
                >
                  Shortlist Applicant
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionModalMode("confirm-reject");
                    setIsDecisionModalOpen(true);
                  }}
                  className="px-6 h-11 bg-white border border-red-200 text-red-700 hover:bg-red-50 font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Reject
                </button>
              </>
            )
          ) : (
            <div className="text-sm font-semibold text-neutral-secondary">
              Decision already recorded:{" "}
              <span className="font-extrabold capitalize text-neutral-primary">
                {rawStatus}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decision / Request Modals */}
      <AssessorDecisionModal
        isOpen={isDecisionModalOpen}
        mode={decisionModalMode}
        onClose={() => setIsDecisionModalOpen(false)}
        onConfirmShortlist={handleConfirmShortlist}
        onConfirmReject={handleConfirmReject}
      />

      <AssessorRequestModal
        isOpen={isRequestModalOpen}
        mode={requestModalMode}
        onClose={() => setIsRequestModalOpen(false)}
        onConfirmAccept={handleConfirmAccept}
        onConfirmDecline={handleConfirmDecline}
        isLoading={
          approveRetainedMutation.isPending || rejectRetainedMutation.isPending
        }
      />

      {/* In-App Certificate Preview Modal */}
      <CertificatePreviewModal
        isOpen={Boolean(previewCertificate)}
        data={previewCertificate}
        onClose={() => setPreviewCertificate(null)}
      />
    </div>
  );
};
