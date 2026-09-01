"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import { FiX, FiCheck, FiEdit3, FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

export type ObservationStatus =
  | "pending"
  | "attention_required"
  | "scheduled"
  | "completed";

export interface ObservationDetails {
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
  onConfirmSchedule: (updatedDetails: ObservationDetails) => void;
}

export const NsqObservationRequestReviewModal: React.FC<
  NsqObservationRequestReviewModalProps
> = ({ isOpen, onClose, details, onConfirmSchedule }) => {
  const [isSigned, setIsSigned] = useState(details?.isSigned ?? false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!details) return null;

  const units =
    details.units && details.units.length > 0
      ? details.units
      : ["UNIT 1", "UNIT 2", "UNIT 3"];

  const handleAppendSignature = () => {
    setIsSigned(true);
  };

  const handleOpenConfirmDialog = () => {
    if (!isSigned) return;
    setIsConfirmModalOpen(true);
  };

  const handleFinalConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
      onConfirmSchedule({
        ...details,
        isSigned: true,
        status: "scheduled",
      });
      onClose();
    }, 400);
  };

  const statusLabel =
    details.status === "pending"
      ? "Pending"
      : details.status === "scheduled"
        ? "Scheduled"
        : details.status === "completed"
          ? "Completed"
          : "Attention Required";

  const isAttentionRequired = details.status === "attention_required";

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
              {units.map((unit) => (
                <span
                  key={unit}
                  className="bg-pink-50 text-pink-700 text-xs font-bold px-3 py-1.5 rounded-md"
                >
                  {unit}
                </span>
              ))}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-[#f8f9fa] border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
            {/* Status Badge */}
            <span
              className={`self-start text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide ${
                isAttentionRequired
                  ? "bg-pink-100 text-pink-700"
                  : details.status === "scheduled" || details.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
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
                  {details.time || "12:00PM"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Date
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-primary">
                  {details.date || "22/03/2026"}
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

          {/* Signature Section */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
              Signature<span className="text-primary-solid ml-0.5">*</span>
            </label>

            {isSigned ? (
              <div className="w-full h-12 rounded-xl border border-emerald-500 bg-[#f2faf5] text-emerald-700 flex items-center justify-center gap-2 font-bold text-sm shadow-2xs">
                <FiCheck className="w-4 h-4 stroke-[3]" />
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

          {/* Action Button */}
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
            Confirm Schedule
          </Button>
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
              Confirm you want to confirm this schedule
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
              Yes, Confrim
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
    </>
  );
};
