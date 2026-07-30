"use client";

import React from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface VerifiedBadgeProps {
  isVerified?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  isVerified = true,
}) => {
  const router = useRouter();

  if (!isVerified) {
    return (
      <div
        onClick={() => router.push("/onboarding/personal-info")}
        className="bg-[#fce8e6] rounded-[22px] p-4 lg:p-5 flex items-center justify-between shadow-2xs border border-[#f5c6cb] cursor-pointer hover:bg-[#fadbd8] transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#f8d7da] flex items-center justify-center shrink-0">
            <Image
              src={ASSETS_URL.validationApprovalIcon}
              alt="Not Verified"
              width={24}
              height={24}
              className="w-6 h-6 opacity-60"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[#a94442] font-bold text-base tracking-tight">
              Not Verified
            </span>
            <span className="text-[#c9302c] text-xs font-medium opacity-90">
              Identity not verified
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#a94442] shrink-0 shadow-xs">
          <FiChevronRight className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#c9e7d2] rounded-[22px] p-4 lg:p-5 flex items-center gap-3.5 shadow-2xs border border-[#b8dfc3]">
      <div className="w-10 h-10 rounded-full bg-[#a9d9b6] flex items-center justify-center shrink-0">
        <Image
          src={ASSETS_URL.validationApprovalIcon}
          alt="Verified"
          width={24}
          height={24}
          className="w-6 h-6 object-contain"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[#1a542b] font-bold text-base tracking-tight">
          Verified
        </span>
        <span className="text-[#2b7040] text-xs font-medium opacity-90">
          Your Identity has been verified
        </span>
      </div>
    </div>
  );
};
