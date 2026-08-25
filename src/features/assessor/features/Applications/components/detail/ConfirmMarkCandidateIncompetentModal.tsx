"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/src/assets";
import { Button } from "@/src/components/ui/button";

interface ConfirmMarkCandidateIncompetentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; recommendation: string }) => void;
}

export const ConfirmMarkCandidateIncompetentModal: React.FC<
  ConfirmMarkCandidateIncompetentModalProps
> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [recommendation, setRecommendation] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      reason:
        reason.trim() ||
        "Candidate demonstrated limited practical proficiency during the technical joinery demonstration.",
      recommendation:
        recommendation ||
        "Advanced Joinery Finishing and Workshop Safety Documentation",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text max-h-[90vh] overflow-y-auto">
        <div className="w-20 h-20 mb-3 flex items-center justify-center">
          <Image
            src={ASSETS_URL.validationWarningIcon}
            alt="Warning"
            width={80}
            height={80}
            className="w-20 h-20 object-contain"
          />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
          Are You sure?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-5">
          Confirm you want to mark as incompetent
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-primary">
              Reasons
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type Here"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] focus:border-[#FBAB2A] transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-primary">
              Recommendations
            </label>
            <div className="relative">
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] focus:border-[#FBAB2A] transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">Select</option>
                <option value="Advanced Joinery Finishing and Workshop Safety Documentation">
                  Advanced Joinery Finishing & Workshop Safety
                </option>
                <option value="Carpentry Level 3 Practical Workshop">
                  Carpentry Level 3 Practical Workshop
                </option>
                <option value="Occupational Health & Technical Safety">
                  Occupational Health & Technical Safety
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 w-full mt-2">
            <Button
              type="submit"
              variant="amber"
              fullWidth
              className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all"
            >
              Yes, Mark As Incompetent
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="h-12 w-full border border-[#FBAB2A] text-[#FBAB2A] hover:bg-orange-50/60 font-bold text-sm sm:text-base rounded-xl transition-colors cursor-pointer"
            >
              No
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
