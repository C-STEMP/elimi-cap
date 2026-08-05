"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ASSETS_URL } from "@/assets";
import { PasswordRequirements } from "@/components/ui/password-requirements";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { SecurityFormData } from "../types/settings.types";
import { useChangePassword } from "@/features/auth/hooks";
import { useToast } from "@/components/ui/toast";

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
  const [errors, setErrors] = useState<{ confirm?: string }>({});
  const { toast } = useToast();
  const { mutate: performChangePassword, isPending } = useChangePassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }
    if (!formData.currentPassword || !formData.newPassword) {
      toast({
        type: "error",
        title: "Required Fields",
        description: "Please fill in all password fields.",
      });
      return;
    }
    setErrors({});
    performChangePassword(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          onSubmit();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary">
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
                <FiEye className="w-5 h-5 text-text-dark/70" />
              ) : (
                <Image
                  src={ASSETS_URL.eyeClosedIcon}
                  alt="Hide password"
                  width={20}
                  height={20}
                  className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
                />
              )}
            </button>
          }
        />

        {/* New Password */}
        <div className="w-full flex flex-col">
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
                  <FiEye className="w-5 h-5 text-text-dark/70" />
                ) : (
                  <Image
                    src={ASSETS_URL.eyeClosedIcon}
                    alt="Hide password"
                    width={20}
                    height={20}
                    className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
                  />
                )}
              </button>
            }
          />
          <PasswordRequirements password={formData.newPassword} />
        </div>

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          value={formData.confirmPassword}
          error={
            formData.confirmPassword &&
            formData.newPassword &&
            formData.confirmPassword !== formData.newPassword
              ? "Passwords do not match"
              : errors.confirm
          }
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
                <FiEye className="w-5 h-5 text-text-dark/70" />
              ) : (
                <Image
                  src={ASSETS_URL.eyeClosedIcon}
                  alt="Hide password"
                  width={20}
                  height={20}
                  className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
                />
              )}
            </button>
          }
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-95 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2.5 shadow-lg transition-all cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{isPending ? "Saving..." : "Change Password"}</span>
          <Image
            src={ASSETS_URL.saveIcon}
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
