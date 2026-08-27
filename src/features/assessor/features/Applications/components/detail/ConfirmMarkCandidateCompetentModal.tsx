"use client";

import React from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/src/assets";
import { Button } from "@/src/components/ui/button";

interface ConfirmMarkCandidateCompetentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmMarkCandidateCompetentModal: React.FC<
  ConfirmMarkCandidateCompetentModalProps
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
          Confirm you want to mark as competent
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Button
            type="button"
            onClick={onConfirm}
            variant="amber"
            fullWidth
            className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all"
          >
            Yes, Mark As Competent
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
