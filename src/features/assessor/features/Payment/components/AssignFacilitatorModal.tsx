"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiCheckCircle } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";

interface AssignFacilitatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (facilitatorName: string, trade: string) => void;
}

export const AssignFacilitatorModal: React.FC<AssignFacilitatorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [trade, setTrade] = useState("Carpentry");
  const [facilitator, setFacilitator] = useState("Ngozi Eze");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  if (!isOpen && !isSuccessOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessOpen(true);
  };

  const handleContinueSuccess = () => {
    setIsSuccessOpen(false);
    onSuccess(facilitator, trade);
  };

  return (
    <>
      {/* Form Modal */}
      {isOpen && !isSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-6 shadow-2xl relative select-text"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="text-center flex flex-col gap-1 pr-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
                Assign Facilitator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-secondary">
                Assign a facilitator to this candidate
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Select
                label="Trade"
                placeholder="Select"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                options={["Carpentry", "Masonry", "Plumbing", "Painting"]}
              />

              <Select
                label="Select Facilitator"
                placeholder="Select"
                value={facilitator}
                onChange={(e) => setFacilitator(e.target.value)}
                options={["Ngozi Eze", "Chidi Okonkwo", "Amina Bello"]}
              />

              <Button
                type="submit"
                variant="amber"
                size="md"
                className="w-full h-12 text-white font-bold text-sm rounded-xl shadow-lg mt-2 cursor-pointer"
              >
                Assign Facilitator
              </Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center gap-4 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg my-1">
              <FiCheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
              Facilitator Assigned Successfully
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary">
              You have successfully assigned a facilitator to this candidate.
            </p>

            <Button
              variant="amber"
              size="md"
              onClick={handleContinueSuccess}
              className="w-full h-11 text-white font-bold text-sm rounded-xl shadow-lg mt-2 cursor-pointer"
            >
              Continue
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
};
