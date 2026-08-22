"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS_URL } from "@/assets";
import { FiCheck } from "react-icons/fi";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Congratulations",
  message = "Your Password has been changed successfully",
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToDashboard = () => {
    onClose();
    router.push("/dashboard");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top 3D Green Checkmark Badge */}
        <div className="relative mb-6 w-[100px] h-[100px] flex items-center justify-center mx-auto">
          {ASSETS_URL.successCheckmarkImg ? (
            <Image
              src={ASSETS_URL.successCheckmarkImg}
              alt="Success"
              width={100}
              height={100}
              className="w-[100px] h-[100px] object-contain drop-shadow-md"
              style={{ width: 100, height: 100 }}
            />
          ) : (
            <div className="w-[100px] h-[100px] rounded-full bg-linear-to-b from-[#66bb6a] to-[#2e7d32] flex items-center justify-center shadow-lg shadow-green-600/30 ring-4 ring-green-100">
              <FiCheck className="w-12 h-12 text-white stroke-3" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-[#1e1e1e] mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleGoToDashboard}
          className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-98 text-white font-semibold w-full py-3.5 rounded-xl shadow-lg transition-all text-sm cursor-pointer"
        >
          Go To Dashboard
        </button>
      </div>
    </div>
  );
};
