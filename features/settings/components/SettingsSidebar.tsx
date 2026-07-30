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
            priority
            loading="eager"
          />
        </div>

        {/* Action & Verification Status */}
        <div className="flex flex-col items-start justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary font-sans hover:bg-[#721328] text-white text-[11px] font-semibold px-4 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            Change Picture
          </button>
          <span className="text-[10px] font-sans text-[#191913] mt-1 font-medium">
            JPG or PNG 10mb
          </span>

          {/* Verification Badge */}
          <div className="mt-4">
            {isVerified ? (
              <div className="flex items-center gap-1 text-[11px] font-medium text-[#1E7F4C]">
                <FiCheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-medium text-border-secondary">
                <FiShield className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Not Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Options */}
      <nav className="flex flex-col gap-1.5 lg:gap-6 pt-2">
        <button
          type="button"
          onClick={() => onTabChange("profile")}
          className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-primary/10 text-black font-semibold shadow-2xs"
              : "text-black font-medium hover:bg-gray-50"
          }`}
        >
          Profile Information
        </button>

        <button
          type="button"
          onClick={() => onTabChange("security")}
          className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-primary/10 text-black font-semibold shadow-2xs"
              : "text-black font-medium hover:bg-gray-50"
          }`}
        >
          Security
        </button>

        <div className="">
          <button
            type="button"
            onClick={onOpenDeleteModal}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-border-secondary hover:bg-red-50 transition-all cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </nav>
    </div>
  );
};
