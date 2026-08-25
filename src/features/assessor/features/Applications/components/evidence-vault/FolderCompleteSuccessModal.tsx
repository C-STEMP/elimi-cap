"use client";

import React from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/src/assets";
import { Button } from "@/src/components/ui/button";

interface FolderCompleteSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FolderCompleteSuccessModal: React.FC<
  FolderCompleteSuccessModalProps
> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
        <div className="w-24 h-24 mb-4 flex items-center justify-center">
          <Image
            src={ASSETS_URL.successCheckmarkImg}
            alt="Folder Complete"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
          Folder Marked As Complete
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-6">
          You have successfully marked this folder as complete
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
