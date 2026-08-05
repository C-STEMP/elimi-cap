"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX, FiEye } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Input } from "@/components/ui/input";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (password: string) => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    setError(undefined);
    onConfirmDelete(password);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center flex flex-col items-center select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setError(undefined);
            setPassword("");
            onClose();
          }}
          aria-label="Close modal"
          className="mb-4 w-11 h-11 rounded-xl bg-primary/10 text-primary hover:bg-[#FBE8ED] flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Logo Icon from Assets */}
        <div className="flex justify-center mb-4">
          <Image
            src={ASSETS_URL.logoIcon2}
            alt="ELIMI Logo"
            width={85}
            height={48}
            className="w-auto h-9 object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-2 tracking-tight">
          Delete Account
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm lg:text-base text-neutral-secondary leading-relaxed max-w-xs mb-6 font-normal">
          Permanently remove your account and all associated data. This action
          cannot be undone, so please ensure you want to proceed
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full text-left flex flex-col gap-5"
        >
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            error={error}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(undefined);
            }}
            placeholder="Enter your password"
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer p-1"
              >
                {showPassword ? (
                  <FiEye className="w-5 h-5 text-text-dark/70" />
                ) : (
                  <Image
                    src={ASSETS_URL.eyeClosedIcon}
                    alt="Hide password"
                    width={20}
                    height={20}
                    className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
                    style={{ width: "auto", height: "auto" }}
                  />
                )}
              </button>
            }
          />

          <button
            type="submit"
            className="bg-border-secondary hover:bg-[#A81C19] active:scale-98 text-white font-bold w-full py-3.5 rounded-xl shadow-lg transition-all cursor-pointer text-sm sm:text-base mt-1"
          >
            Delete Account
          </button>
        </form>
      </div>
    </div>
  );
};
