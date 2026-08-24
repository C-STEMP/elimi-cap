"use client";

import React, { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { FiShield, FiCheckCircle, FiCamera, FiUpload } from "react-icons/fi";
import { SettingsTab, VerificationStatus } from "../types/settings.types";
import { CameraCaptureModal } from "@/src/components/ui/camera-capture-modal";

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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const isVerified = verificationStatus === "verified";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onAvatarChange) {
      onAvatarChange(e.target.files[0]);
    }
  };

  const handleCameraCapture = (file: File) => {
    if (onAvatarChange) {
      onAvatarChange(file);
    }
  };

  return (
    <>
      <div className="bg-white rounded-[20px] p-5 shadow-lg border border-gray-100/80 flex flex-col gap-6 w-full lg:w-72 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          style={{ display: "none" }}
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-3.5">
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

          <div className="flex flex-col items-start justify-center gap-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary font-sans hover:bg-[#721328] text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                title="Upload image"
              >
                <FiUpload className="w-3 h-3" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="bg-primary/10 hover:bg-primary/20 text-primary p-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
                title="Take photo with camera"
                aria-label="Take photo with camera"
              >
                <FiCamera className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[10px] font-sans text-[#191913] font-medium">
              Upload or Snap
            </span>

            <div className="mt-2">
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

    <CameraCaptureModal
      isOpen={isCameraOpen}
      onClose={() => setIsCameraOpen(false)}
      onCapture={handleCameraCapture}
      title="Take Profile Photograph"
    />
  </>
);
};
