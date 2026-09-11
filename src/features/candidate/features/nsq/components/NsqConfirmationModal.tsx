"use client";

import React from "react";
import Image from "next/image";
import { Modal } from "antd";
import { Button } from "@/src/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";

interface NsqConfirmationModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const NsqConfirmationModal: React.FC<NsqConfirmationModalProps> = ({
  isOpen,
  isLoading = false,
  title = "Are you sure?",
  subtitle = "Confirm you want to submit",
  confirmText = "Yes, Submit",
  cancelText = "No",
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
          padding: 12,
        },
      }}
    >
      <div className="flex flex-col items-center justify-center text-center p-3 sm:p-5 gap-5">
        {/* 3D Warning Sign Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center relative shrink-0">
          <Image
            src={ASSETS_URL.warningSignIcon}
            alt="Warning"
            width={96}
            height={96}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#191918] tracking-tight">
            {title}
          </h3>
          <p className="text-neutral-secondary text-sm font-normal">
            {subtitle}
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
            {confirmText}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={isLoading}
            onClick={onClose}
            className="w-full h-12 border border-[#fbab2a] text-[#fbab2a] hover:bg-amber-50/50 bg-white font-bold text-sm rounded-xl cursor-pointer"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
