"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ASSETS_URL } from "@/assets";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        type: "error",
        title: "Password Required",
        description: "Please enter your password to confirm account deletion.",
      });
      return;
    }

    toast({
      type: "error",
      title: "Account Deletion Requested",
      description: "Your account deletion request has been submitted.",
    });
    setPassword("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center"
        >
          {/* Close Button X */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>

          <form
            onSubmit={handleDelete}
            className="w-full flex flex-col items-center gap-4"
          >
            {/* Top Elimi Logo */}
            <div className="relative w-28 h-8 mb-1">
              <Image
                src={ASSETS_URL.logoIcon}
                alt="Elimi Logo"
                fill
                className="object-contain"
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
              Delete Account
            </h3>

            <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-2 leading-relaxed">
              Permanently remove your account and all associated data. This
              action cannot be undone, so please ensure you want to proceed
            </p>

            <div className="flex flex-col gap-1.5 w-full text-left my-2">
              <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-transparent focus:border-red-400 rounded-xl px-3.5 py-2.5 text-xs text-neutral-primary outline-none font-medium transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12.5 text-white font-bold text-base bg-[#C5221F] hover:bg-[#a81c19] transition-all shadow-lg cursor-pointer rounded-xl"
            >
              Delete Account
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
