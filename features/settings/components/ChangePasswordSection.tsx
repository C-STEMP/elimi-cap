"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { saveIcon } from "@/assets";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { SecurityFormData } from "../types/settings.types";

interface ChangePasswordSectionProps {
  formData: SecurityFormData;
  onChange: (field: keyof SecurityFormData, value: string) => void;
  onSubmit: () => void;
}

export const ChangePasswordSection: React.FC<ChangePasswordSectionProps> = ({
  formData,
  onChange,
  onSubmit,
}) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="text-lg lg:text-xl font-bold text-[#1e1e1e]">
        Change Password
      </h2>

      <div className="flex flex-col gap-4">
        {/* Password */}
        <Input
          label="Password"
          type={showCurrent ? "text" : "password"}
          value={formData.currentPassword}
          onChange={(e) => onChange("currentPassword", e.target.value)}
          placeholder="•••••••••"
          suffix={
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label="Toggle password visibility"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showCurrent ? (
                <FiEye className="w-4 h-4" />
              ) : (
                <FiEyeOff className="w-4 h-4" />
              )}
            </button>
          }
        />

        {/* New Password */}
        <Input
          label="New Password"
          type={showNew ? "text" : "password"}
          value={formData.newPassword}
          onChange={(e) => onChange("newPassword", e.target.value)}
          placeholder="•••••••••"
          suffix={
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              aria-label="Toggle new password visibility"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showNew ? (
                <FiEye className="w-4 h-4" />
              ) : (
                <FiEyeOff className="w-4 h-4" />
              )}
            </button>
          }
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
          placeholder="•••••••••"
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label="Toggle confirm password visibility"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirm ? (
                <FiEye className="w-4 h-4" />
              ) : (
                <FiEyeOff className="w-4 h-4" />
              )}
            </button>
          }
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-3">
        <button
          type="submit"
          className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-95 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2.5 shadow-sm transition-all cursor-pointer text-sm"
        >
          <span>Change Passowrd</span>
          <Image
            src={saveIcon}
            alt="Save"
            width={18}
            height={18}
            className="brightness-0 invert"
          />
        </button>
      </div>
    </form>
  );
};
