"use client";

import React from "react";
import { Modal } from "antd";
import { Button } from "@/src/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";

interface NsqConfirmationModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const NsqConfirmationModal: React.FC<NsqConfirmationModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={isLoading ? () => {} : onClose}
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
        {/* Warning Icon */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <FiAlertTriangle className="w-8 h-8 text-amber-600 animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Are you sure?
          </h3>
          <p className="text-neutral-secondary text-sm font-normal">
            Confirm you want to submit
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full pt-2">
          <Button
            type="button"
            variant="amber"
            size="lg"
            loading={isLoading}
            onClick={onConfirm}
            className="w-full h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer"
          >
            Yes, Submit
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={isLoading}
            onClick={onClose}
            className="w-full h-12 border border-[#fbab2a] text-[#fbab2a] hover:bg-amber-50/50 bg-white font-bold text-sm rounded-xl cursor-pointer"
          >
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
};
