"use client";

import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { Logo } from "@/components/ui/logo";

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
        className="bg-white rounded-2xl max-w-md w-full p-6 lg:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100/80 hover:bg-gray-200 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div className="flex justify-center mt-2">
          <Logo theme="dark" height={28} width={63} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#1e1e1e] mt-4 mb-2">
          Delete Account
        </h3>

        {/* Description */}
        <p className="text-xs lg:text-sm text-gray-500 leading-relaxed mb-6 px-1">
          Permanently remove your account and all associated data. This action
          cannot be undone, so please ensure you want to proceed
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full text-left">
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
            Last Name
          </label>
          <input
            type="text"
            required
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Enter your surname"
            className="w-full bg-[#f5f6fa] rounded-xl px-4 py-3 text-sm text-[#1e1e1e] border border-transparent focus:border-[#c5221f] focus:bg-white outline-none transition-all"
          />

          <button
            type="submit"
            className="bg-[#c5221f] hover:bg-[#a81c19] active:scale-98 text-white font-semibold w-full py-3.5 rounded-xl shadow-sm transition-all mt-5 cursor-pointer text-sm"
          >
            Delete Account
          </button>
        </form>
      </div>
    </div>
  );
};
