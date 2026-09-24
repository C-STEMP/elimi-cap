"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import { FiX, FiCheck, FiEdit3, FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { UploadSignatureModal } from "../UploadSignatureModal";
import { useCandidateProfileSignature } from "@/src/features/shared/onboarding/hooks";
import { signDirectObservationApi } from "@/src/features/shared/applications/api";
import { useGetDirectObservationSession } from "@/src/features/shared/applications/hooks";
import { useModalDraft, useUrlModal } from "@/src/lib/hooks/usePersistentModal";
import { NSQ_OBSERVATION_REVIEW_MODAL, NSQ_OBSERVATION_SIGNATURE_MODAL } from "@/src/lib/modal-keys";

export type ObservationStatus =
  | "pending"
  | "attention_required"
  | "scheduled"
  | "completed"
  | "rejected"
  | "cancelled";

export interface ObservationDetails {
  id?: string;
  units?: string[];
  date: string;
  time: string;
  country?: string;
  state?: string;
  lga?: string;
  address?: string;
  status?: ObservationStatus;
  isSigned?: boolean;
}

interface NsqObservationRequestReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: ObservationDetails | null;
  applicationId?: string;
  availableUnits?: Array<{ id: string; label: string; title?: string; unitNo?: string }>;
  onConfirmSchedule: (updatedDetails: ObservationDetails) => void;
}

export const NsqObservationRequestReviewModal: React.FC<
  NsqObservationRequestReviewModalProps
> = ({
  isOpen,
  onClose,
  details,
  applicationId,
  availableUnits,
  onConfirmSchedule,
}) => {
  const { toast } = useToast();
  const { data: profileSignature } = useCandidateProfileSignature();
  const { data: sessionDetail } = useGetDirectObservationSession(
    applicationId || "",
    details?.id || "",
    { enabled: Boolean(applicationId && details?.id && isOpen) },
  );
  const bothFormsSubmitted =
    sessionDetail?.physicalStatus === "submitted" &&
    sessionDetail?.oralStatus === "submitted";
  const [isSigned, setIsSigned] = useModalDraft(NSQ_OBSERVATION_REVIEW_MODAL, "isSigned", details?.isSigned ?? false);
  const [uploadedAssetId, setUploadedAssetId] = useModalDraft<string | null>(NSQ_OBSERVATION_REVIEW_MODAL, "uploadedAssetId", null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useUrlModal(NSQ_OBSERVATION_SIGNATURE_MODAL);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!details) return null;

  const units = details.units ?? [];

  const resolveUnitName = (unitIdOrName: string, index: number) => {
    const match =
      availableUnits?.find((u) => u.id === unitIdOrName) ||
      sessionDetail?.catalogue?.find((c) => c.unitId === unitIdOrName);
    if (match) {
      return (
        (match as any).unitNo ||
        (match as any).referenceNumber ||
        (match as any).label ||
        (match as any).title ||
        `UNIT ${index + 1}`
      );
    }
    if (unitIdOrName && unitIdOrName.length >= 20) {
      return `UNIT ${index + 1}`;
    }
    return unitIdOrName;
  };

  const handleAppendSignature = () => {
    if (profileSignature?.assetId) {
      setUploadedAssetId(null);
      setIsSigned(true);
      toast({
        type: "success",
        title: "Signature Appended",
        description: "Your saved signature has been appended.",
      });
      return;
    }

    setIsSignatureModalOpen(true);
  };

  const handleSignatureUploadSuccess = (signature?: { assetId: string; url?: string }) => {
    setUploadedAssetId(signature?.assetId || null);
    setIsSigned(true);
    toast({
      type: "success",
      title: "Signature Appended",
      description: "Your signature has been saved and appended.",
    });
  };

  const handleOpenConfirmDialog = () => {
    if (!isSigned) return;
    setIsConfirmModalOpen(true);
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (applicationId && details.id) {
        await signDirectObservationApi(applicationId, details.id, {
          role: "learner",
          signatureMode: profileSignature?.assetId ? "default" : "upload",
          signatureAssetId: profileSignature?.assetId || uploadedAssetId || undefined,
          signedAt: new Date().toISOString(),
        });
      }
      setIsConfirmModalOpen(false);
      onConfirmSchedule({
        ...details,
        isSigned: true,
        status: "scheduled",
      });
      onClose();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Confirmation Failed",
        description: err?.message || "Could not confirm this schedule. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusLabel =
    details.status === "pending"
      ? "Pending"
      : details.status === "scheduled"
        ? "Scheduled"
        : details.status === "completed"
          ? "Completed"
          : details.status === "rejected"
            ? "Rejected"
            : details.status === "cancelled"
              ? "Cancelled"
              : "Attention Required";

  const isAttentionRequired = details.status === "attention_required";
  const isClosed = details.status === "rejected" || details.status === "cancelled";

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={isSubmitting ? () => {} : onClose}
        footer={null}
        centered
        closable={false}
        width={500}
        styles={{
          body: {
            padding: 20,
          },
        }}
      >
        <div className="relative flex flex-col gap-5 p-2 sm:p-4">
          {/* Pink Close Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-0 right-0 w-8 h-8 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 flex items-center justify-center cursor-pointer transition-colors"
            title="Close modal"
          >
            <FiX className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mt-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
              Observation Request
            </h3>
            <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1 max-w-xs leading-relaxed">
              Review the candidate&apos;s request details below
            </p>
          </div>

          {/* Units For Assessment */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-neutral-primary">
              Units For Assessment
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {units.map((unit, idx) => (
                <span
                  key={unit}
                  className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-md"
                >
                  {resolveUnitName(unit, idx)}
                </span>
              ))}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-input-bg border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
            {/* Status Badge */}
            <span
              className={`self-start text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide ${
                isAttentionRequired
                  ? "bg-primary/10 text-primary"
                  : details.status === "scheduled" || details.status === "completed"
                    ? "bg-[#1E7F4C]/10 text-[#1E7F4C]"
                    : isClosed
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-800"
              }`}
            >
              {statusLabel}
            </span>

            {/* Time & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Time
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-primary">
                  {details.time || "—"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Date
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-primary">
                  {details.date || "—"}
                </span>
              </div>
            </div>

            {/* Country, State, LGA */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-gray-200/60">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Country
                </span>
                <span className="text-xs font-extrabold text-neutral-primary truncate">
                  {details.country || "Nigeria"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  State
                </span>
                <span className="text-xs font-extrabold text-neutral-primary truncate">
                  {details.state || "Abuja"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  LGA
                </span>
                <span className="text-xs font-extrabold text-neutral-primary truncate">
                  {details.lga || "Bwari"}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col pt-2 border-t border-gray-200/60">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Address
              </span>
              <span className="text-xs font-semibold text-neutral-primary leading-relaxed">
                {details.address || "3 Abbey Street, Kubwa Expressway"}
              </span>
            </div>
          </div>

          {/* Recorded Observation Results — what the candidate is actually
              attesting to, not just the sitting's logistics. */}
          {!isClosed && (sessionDetail?.physical || sessionDetail?.oral) && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-neutral-primary">
                Recorded Observation Results
              </span>
              <div className="bg-[#f8f9fa] border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 max-h-48 overflow-y-auto">
                {[
                  { label: "Physical (ARF 02A)", form: sessionDetail?.physical },
                  { label: "Oral (ARF 04A)", form: sessionDetail?.oral },
                ].map(
                  ({ label, form }) =>
                    form && form.rows.length > 0 && (
                      <div key={label} className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          {label}
                        </span>
                        {form.rows.map((row, idx) => (
                          <div
                            key={`${row.performanceCriteriaCode}-${idx}`}
                            className="flex items-start justify-between gap-3 text-xs"
                          >
                            <span className="font-semibold text-neutral-primary">
                              PC {row.performanceCriteriaCode}
                              {row.comment ? ` — ${row.comment}` : ""}
                            </span>
                            <span
                              className={`shrink-0 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                row.met
                                  ? "bg-[#1E7F4C]/10 text-[#1E7F4C]"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {row.met ? "Met" : "Not Met"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          {/* Signature Section — only reachable once the assessor has
              actually submitted both forms; signing off on an incomplete
              or nonexistent record isn't meaningful. */}
          {isClosed ? (
            <div className="w-full rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-center text-xs font-semibold text-rose-700">
              This observation request was {statusLabel.toLowerCase()}.
            </div>
          ) : !bothFormsSubmitted ? (
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-center text-xs font-semibold text-amber-700">
              Waiting for your assessor to complete and submit the
              observation forms before you can review and sign.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                Signature<span className="text-primary-solid ml-0.5">*</span>
              </label>

              {isSigned ? (
                <div className="w-full h-12 rounded-xl border-2 border-[#1E7F4C] bg-[#1E7F4C]/10 text-[#1E7F4C] flex items-center justify-center gap-2 font-bold text-sm shadow-2xs">
                  <FiCheck className="w-4 h-4 stroke-3" />
                  <span>Signed</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAppendSignature}
                  className="w-full h-12 rounded-xl border border-[#fbab2a] bg-[#fefbf6] hover:bg-amber-50/70 text-[#fbab2a] flex items-center justify-center gap-2 font-bold text-sm cursor-pointer transition-colors"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Append Signature</span>
                </button>
              )}
            </div>
          )}

          {/* Action Button */}
          {!isClosed && bothFormsSubmitted && (
            <Button
              type="button"
              variant="amber"
              size="lg"
              disabled={!isSigned}
              onClick={handleOpenConfirmDialog}
              className={`w-full h-12 font-bold text-sm rounded-xl shadow-md transition-all mt-1 ${
                isSigned
                  ? "bg-[#fbab2a] hover:bg-[#e89b1f] text-white cursor-pointer"
                  : "bg-[#fbab2a]/40 text-white/90 cursor-not-allowed border-0"
              }`}
            >
              Sign &amp; Confirm Report
            </Button>
          )}
        </div>
      </Modal>

      {/* Confirmation Dialog Modal (Image 4: "Are You sure?") */}
      <Modal
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        footer={null}
        centered
        closable={false}
        width={420}
        styles={{
          body: {
            padding: 16,
          },
        }}
      >
        <div className="flex flex-col items-center justify-center text-center p-2 sm:p-4 gap-5">
          {/* Warning Icon */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <FiAlertTriangle className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
              Are You sure?
            </h3>
            <p className="text-neutral-secondary text-sm font-normal">
              Confirm you want to sign and finalize this observation report
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full pt-2">
            <Button
              type="button"
              variant="amber"
              size="lg"
              loading={isSubmitting}
              onClick={handleFinalConfirm}
              className="w-full h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer"
            >
              Yes, Confirm
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={isSubmitting}
              onClick={() => setIsConfirmModalOpen(false)}
              className="w-full h-12 border border-[#fbab2a] text-[#fbab2a] hover:bg-amber-50/50 bg-white font-bold text-sm rounded-xl cursor-pointer"
            >
              No
            </Button>
          </div>
        </div>
      </Modal>

      <UploadSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onUploadSuccess={handleSignatureUploadSuccess}
      />
    </>
  );
};
