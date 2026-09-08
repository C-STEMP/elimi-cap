"use client";

import React from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/src/assets";
import { Button } from "@/src/components/ui/button";
import { FiX } from "react-icons/fi";

// ─── 1. Evidence Approval Confirmation Modal ─────────────────────────────────
interface ConfirmApproveEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmApproveEvidenceModal: React.FC<
  ConfirmApproveEvidenceModalProps
> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
        <div className="w-24 h-24 mb-4 flex items-center justify-center">
          <Image
            src={ASSETS_URL.validationWarningIcon}
            alt="Warning"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
          Are You sure?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-6">
          Confirm you want to approve this evidence
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Button
            type="button"
            onClick={onConfirm}
            variant="amber"
            fullWidth
            className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all"
          >
            Yes, Approve
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full border border-[#FBAB2A] text-[#FBAB2A] hover:bg-orange-50/60 font-bold text-sm sm:text-base rounded-xl transition-colors cursor-pointer"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── 2. Evidence Approved Success Modal ──────────────────────────────────────
interface EvidenceApprovedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceApprovedSuccessModal: React.FC<
  EvidenceApprovedSuccessModalProps
> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
        <div className="w-24 h-24 mb-4 flex items-center justify-center">
          <Image
            src={ASSETS_URL.successCheckmarkImg}
            alt="Success"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
          Evidence Approved
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-6">
          You have successfully approved this evidence
        </p>

        <Button
          type="button"
          onClick={onClose}
          variant="amber"
          fullWidth
          className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// ─── 3. Reject Evidence Modal ────────────────────────────────────────────────
interface RejectEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const RejectEvidenceModal: React.FC<RejectEvidenceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [comment, setComment] = React.useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit(comment.trim());
    setComment("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
          Reject Evidence
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-6">
          Send a feedback on this evidence
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-start gap-4">
          <div className="w-full text-left">
            <label className="block text-xs font-semibold text-neutral-primary mb-1.5">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type Here"
              rows={4}
              required
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBAB2A]/40 resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="amber"
            fullWidth
            disabled={!comment.trim()}
            className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            Reject Evidence
          </Button>
        </form>
      </div>
    </div>
  );
};

// ─── 4. Accept Observation Confirmation Modal ────────────────────────────────
interface ConfirmAcceptObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmAcceptObservationModal: React.FC<
  ConfirmAcceptObservationModalProps
> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
        <div className="w-24 h-24 mb-4 flex items-center justify-center">
          <Image
            src={ASSETS_URL.validationWarningIcon}
            alt="Warning"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
          Are You sure?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-6">
          Confirm you want to accept this request
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Button
            type="button"
            onClick={onConfirm}
            variant="amber"
            fullWidth
            className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all"
          >
            Yes, Accept
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full border border-[#FBAB2A] text-[#FBAB2A] hover:bg-orange-50/60 font-bold text-sm sm:text-base rounded-xl transition-colors cursor-pointer"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── 5. Observation Accepted Success Modal ───────────────────────────────────
interface ObservationAcceptedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ObservationAcceptedSuccessModal: React.FC<
  ObservationAcceptedSuccessModalProps
> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
        <div className="w-24 h-24 mb-4 flex items-center justify-center">
          <Image
            src={ASSETS_URL.successCheckmarkImg}
            alt="Success"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
          Request Accepted
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-6">
          You have successfully accepted this request
        </p>

        <Button
          type="button"
          onClick={onClose}
          variant="amber"
          fullWidth
          className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// ─── 6. Observation Rejected Success Modal ───────────────────────────────────
interface ObservationRejectedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ObservationRejectedSuccessModal: React.FC<
  ObservationRejectedSuccessModalProps
> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
        <div className="w-24 h-24 mb-4 flex items-center justify-center">
          <Image
            src={ASSETS_URL.successCheckmarkImg}
            alt="Success"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
          Request Rejected
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-6">
          You have successfully rejected this request
        </p>

        <Button
          type="button"
          onClick={onClose}
          variant="amber"
          fullWidth
          className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
