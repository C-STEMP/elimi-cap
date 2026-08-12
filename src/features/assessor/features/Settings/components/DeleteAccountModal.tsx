"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/src/components/ui/toast";
import { Input } from "@/src/components/ui/input";
import { eyeClosedIcon, logoIcon2 } from "@/assets";

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    toast({
      type: "error",
      title: "Account Deletion Requested",
      description: "Your account deletion request has been submitted.",
    });
    setError(undefined);
    setPassword("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 select-text"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center"
        >
          {/* Close Button X */}
          <button
            type="button"
            onClick={() => {
              setError(undefined);
              setPassword("");
              onClose();
            }}
            className="mb-4 w-11 h-11 rounded-xl bg-primary/10 text-primary hover:bg-[#FBE8ED] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Top Elimi Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src={logoIcon2}
              alt="ELIMI Logo"
              width={85}
              height={48}
              className="w-auto h-9 object-contain"
            />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mb-2 tracking-tight">
            Delete Account
          </h3>

          <p className="text-xs sm:text-sm text-neutral-secondary leading-relaxed max-w-xs mb-6 font-normal">
            Permanently remove your account and all associated data. This action
            cannot be undone, so please ensure you want to proceed
          </p>

          <form
            onSubmit={handleDelete}
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
                      src={eyeClosedIcon}
                      alt="Hide password"
                      width={20}
                      height={20}
                      className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
                    />
                  )}
                </button>
              }
            />

            <button
              type="submit"
              className="bg-[#C5221F] hover:bg-[#a81c19] text-white font-bold w-full py-3.5 rounded-xl shadow-lg transition-all cursor-pointer text-sm sm:text-base mt-1"
            >
              Delete Account
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
