"use client";

import React from "react";
import { Modal } from "antd";
import { Button } from "@/src/components/ui/button";
import { FiCheck } from "react-icons/fi";

interface NsqSuccessModalProps {
  isOpen: boolean;
  onViewApplication: () => void;
}

export const NsqSuccessModal: React.FC<NsqSuccessModalProps> = ({
  isOpen,
  onViewApplication,
}) => {
  return (
    <Modal
      open={isOpen}
      footer={null}
      centered
      closable={false}
      width={420}
      styles={{
        body: {
          padding: 8,
        },
      }}
    >
      <div className="flex flex-col items-center justify-center text-center p-2 sm:p-4 gap-5">
        {/* Green Success Icon */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
            <FiCheck className="w-8 h-8 text-white stroke-[3]" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Form Submitted
          </h3>
          <p className="text-neutral-secondary text-sm font-normal">
            You have successfully submitted your form
          </p>
        </div>

        {/* Action */}
        <div className="w-full pt-2">
          <Button
            type="button"
            variant="amber"
            size="lg"
            onClick={onViewApplication}
            className="w-full h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md cursor-pointer"
          >
            View Application
          </Button>
        </div>
      </div>
    </Modal>
  );
};
