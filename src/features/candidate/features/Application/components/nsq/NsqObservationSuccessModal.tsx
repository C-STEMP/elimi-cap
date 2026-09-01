"use client";

import React from "react";
import { Modal } from "antd";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

interface NsqObservationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const NsqObservationSuccessModal: React.FC<NsqObservationSuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Direct Observation Request Sent",
  subtitle = "You have successfully sent your direct observation request",
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      closable={false}
      width={440}
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <div className="flex flex-col items-center justify-center text-center p-3 sm:p-5 gap-6">
        {/* Green Success Checkmark Icon (Image 5) */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/25">
            <FiCheck className="w-9 h-9 text-white stroke-[3]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            {title}
          </h3>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal max-w-xs leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Continue Button */}
        <div className="w-full pt-1">
          <Button
            type="button"
            variant="amber"
            size="lg"
            onClick={onClose}
            className="w-full h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md cursor-pointer"
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};
