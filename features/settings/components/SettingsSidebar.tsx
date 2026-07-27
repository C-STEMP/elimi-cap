"use client";

import React, { useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { FiShield, FiCheckCircle } from "react-icons/fi";
import { SettingsTab, VerificationStatus } from "../types/settings.types";

interface SettingsSidebarProps {
  userAvatarSrc: StaticImageData | string;
  verificationStatus: VerificationStatus;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onOpenDeleteModal: () => void;
  onAvatarChange?: (file: File) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  userAvatarSrc,
  verificationStatus,
  activeTab,
  onTabChange,
  onOpenDeleteModal,
  onAvatarChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVerified = verificationStatus === "verified";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onAvatarChange) {
      onAvatarChange(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100/80 flex flex-col gap-6 w-full lg:w-72 shrink-0">
      {/* Hidden File Input for Changing Picture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Profile Card Header */}
      <div className="flex items-center gap-3.5">
        {/* User Photo */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-xs">
          <Image
            src={userAvatarSrc}
            alt="User Avatar"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        {/* Action & Verification Status */}
        <div className="flex flex-col items-start justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#8a1832] hover:bg-[#721328] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Change Picture
          </button>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">
            JPG or PNG 10mb
          </span>

          {/* Verification Badge */}
          <div className="mt-2">
            {isVerified ? (
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#2e7d32]">
                <FiCheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#d9383a]">
                <FiShield className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Not Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Options */}
      <nav className="flex flex-col gap-1.5 pt-2">
        <button
          type="button"
          onClick={() => onTabChange("profile")}
          className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-[#fbebee] text-[#8a1832] font-bold shadow-2xs"
              : "text-[#1e1e1e] font-medium hover:bg-gray-50"
          }`}
        >
          Profile Information
        </button>

        <button
          type="button"
          onClick={() => onTabChange("security")}
          className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-[#fbebee] text-[#8a1832] font-bold shadow-2xs"
              : "text-[#1e1e1e] font-medium hover:bg-gray-50"
          }`}
        >
          Security
        </button>

        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenDeleteModal}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-[#c5221f] hover:bg-red-50 transition-all cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </nav>
    </div>
  );
};
