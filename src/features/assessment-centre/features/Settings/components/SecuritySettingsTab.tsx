"use client";

import React from "react";
import Image from "next/image";
import { FiCheckCircle, FiEye, FiSave } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { ASSETS_URL } from "@/assets";

interface SecuritySettingsTabProps {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showCurrentPassword: boolean;
  setShowCurrentPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showNewPassword: boolean;
  setShowNewPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({
  currentPassword, setCurrentPassword,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  showCurrentPassword, setShowCurrentPassword,
  showNewPassword, setShowNewPassword,
  showConfirmPassword, setShowConfirmPassword,
}) => {
  const { toast } = useToast();

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Verification Status */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
          Verification Status
        </h3>
        <div className="bg-emerald-50/80 p-4.5 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-bold text-sm text-emerald-800">NIN Verification</span>
            <span className="text-xs text-emerald-600 font-medium">Verification Complete</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-100/80 px-3 py-1.5 rounded-full">
            <FiCheckCircle className="w-4 h-4" />
            <span>Verified</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
          Change Password
        </h3>
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">Password</label>
            <div className="relative w-full">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-input-bg border border-transparent focus:border-primary rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-primary outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-primary cursor-pointer"
              >
                {showCurrentPassword ? (
                  <FiEye className="w-4 h-4 text-text-dark/70" />
                ) : (
                  <Image src={ASSETS_URL.eyeClosedIcon} alt="Hide password" width={16} height={16} className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">New Password</label>
            <div className="relative w-full">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-input-bg border border-transparent focus:border-primary rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-primary outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-primary cursor-pointer"
              >
                {showNewPassword ? (
                  <FiEye className="w-4 h-4 text-text-dark/70" />
                ) : (
                  <Image src={ASSETS_URL.eyeClosedIcon} alt="Hide password" width={16} height={16} className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">Confirm Password</label>
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-input-bg border border-transparent focus:border-primary rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-primary outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-primary cursor-pointer"
              >
                {showConfirmPassword ? (
                  <FiEye className="w-4 h-4 text-text-dark/70" />
                ) : (
                  <Image src={ASSETS_URL.eyeClosedIcon} alt="Hide password" width={16} height={16} className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <Button
          type="button"
          onClick={() => {
            toast({ type: "success", title: "Password Updated", description: "Your password has been changed successfully." });
          }}
          variant="amber"
          size="md"
          rightIcon={<FiSave className="w-4 h-4" />}
          className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
        >
          Change Password
        </Button>
      </div>
    </div>
  );
};
