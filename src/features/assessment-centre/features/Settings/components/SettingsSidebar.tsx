"use client";

import React from "react";
import Image from "next/image";
import { FiCheckCircle } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { SettingsSubTab } from "../hooks/useSettingsViewState";

interface SettingsSidebarProps {
  logoPreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handlePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeSubTab: SettingsSubTab;
  setActiveSubTab: (tab: SettingsSubTab) => void;
  onOpenDeleteModal: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  logoPreview,
  fileInputRef,
  handlePictureChange,
  activeSubTab,
  setActiveSubTab,
  onOpenDeleteModal,
}) => {
  return (
    <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3.5">
        <div className="relative w-29 h-29 flex items-center justify-center rounded-xl overflow-hidden shrink-0 bg-primary/10 shadow-xs">
          <Image
            src={logoPreview || ASSETS_URL.cstempLogo}
            alt="User Avatar"
            fill
            sizes="100px"
            className="object-cover"
            priority
            loading="eager"
          />
        </div>

        <div className="flex flex-col items-start justify-center">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handlePictureChange}
            className="hidden"
          />
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

          <div className="flex items-center gap-1 text-[11px] lg:mt-3 font-medium text-[#1E7F4C]">
            <FiCheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Verified</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab("centre")}
          className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
            activeSubTab === "centre"
              ? "bg-primary/10 text-black font-semibold shadow-2xs"
              : "text-black font-medium hover:bg-gray-50"
          }`}
        >
          Centre Information
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("profile")}
          className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
            activeSubTab === "profile"
              ? "bg-primary/10 text-black font-semibold shadow-2xs"
              : "text-black font-medium hover:bg-gray-50"
          }`}
        >
          Profile Information
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("pricing")}
          className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
            activeSubTab === "pricing"
              ? "bg-[#FDF2F4] text-neutral-primary font-extrabold shadow-2xs"
              : "text-neutral-secondary hover:text-neutral-primary hover:bg-gray-50"
          }`}
        >
          Pricing
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("security")}
          className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
            activeSubTab === "security"
              ? "bg-[#FDF2F4] text-neutral-primary font-extrabold shadow-2xs"
              : "text-neutral-secondary hover:text-neutral-primary hover:bg-gray-50"
          }`}
        >
          Security
        </button>

        <button
          type="button"
          onClick={onOpenDeleteModal}
          className="w-full text-left p-3.5 rounded-2xl text-red-600 font-semibold hover:bg-red-50 transition-all cursor-pointer mt-2"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};
