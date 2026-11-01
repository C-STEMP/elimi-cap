"use client";

import React from "react";
import Image from "next/image";
import { Modal } from "antd";
import { Button } from "@/src/components/ui/button";
import { ASSETS_URL } from "@/assets";

interface WithdrawApplicationModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  isDraft?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const WithdrawApplicationModal: React.FC<
  WithdrawApplicationModalProps
> = ({ isOpen, isLoading = false, isDraft = false, onConfirm, onClose }) => {
  return (
    <Modal
      open={isOpen}
      onCancel={isLoading ? undefined : onClose}
      footer={null}
      centered
      closable={false}
      width={420}
      styles={{
        mask: {
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
        body: {
          padding: 12,
        },
      }}
    >
      <div className="flex flex-col items-center justify-center text-center p-3 sm:p-5 gap-5">
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center relative shrink-0">
          <Image
            src={ASSETS_URL.warningSignIcon}
            alt="Withdraw Application"
            width={96}
            height={96}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#191918] tracking-tight">
            Withdraw Application?
          </h3>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal leading-relaxed">
            {isDraft
              ? "Are you sure you want to withdraw this draft application? Once withdrawn, you can start a new application with another centre or trade."
              : "Are you sure you want to withdraw this application from the assessment centre? Once withdrawn, you will be free to create a new application."}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full pt-2">
          <Button
            type="button"
            variant="amber"
            size="lg"
            loading={isLoading}
            onClick={onConfirm}
            className="w-full h-12 text-white font-bold text-sm bg-[#a31d38] hover:bg-[#8a182f] rounded-xl shadow-sm cursor-pointer"
          >
            Yes, Withdraw Application
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={isLoading}
            onClick={onClose}
            className="w-full h-12 border border-gray-200 text-neutral-primary hover:bg-gray-50 bg-white font-bold text-sm rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
