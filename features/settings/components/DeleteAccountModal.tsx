"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { logoIcon2 } from "@/assets";
import { Input } from "@/components/ui/input";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (surname: string) => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [surname, setSurname] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmDelete(surname);
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
          onClick={onClose}
          aria-label="Close modal"
          className="mb-4 w-11 h-11 rounded-xl bg-primary/10 text-primary hover:bg-[#FBE8ED] flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Logo Icon from Assets */}
        <div className="flex justify-center mb-4">
          <Image
            src={logoIcon2}
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
          className="w-full text-left flex flex-col gap-5"
        >
          <Input
            label="Last Name"
            type="text"
            required
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Enter your surname"
          />

          <button
            type="submit"
            className="bg-border-secondary hover:bg-[#A81C19] active:scale-98 text-white font-bold w-full py-3.5 rounded-xl shadow-sm transition-all cursor-pointer text-sm sm:text-base mt-1"
          >
            Delete Account
          </button>
        </form>
      </div>
    </div>
  );
};
