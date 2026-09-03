"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";

interface AssessorFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { type: string; stage: string; status: string }) => void;
}

export const AssessorFilterModal: React.FC<AssessorFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
}) => {
  const [type, setType] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilter({ type, stage, status });
    onClose();
  };

  return (
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
            Filter
          </h2>
          <p className="text-xs sm:text-sm text-neutral-secondary">
            Filter applications.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Assessment Type"
            placeholder="Select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={["RPL", "NSQ"]}
          />

          <Select
            label="Stage"
            placeholder="Select"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            options={[
              "Application Form",
              "Payment",
              "Folder Arrangement",
              "Interview Stage",
              "Internal Verifier",
              "External Verifier",
              "Certification",
            ]}
          />

          <Select
            label="Status"
            placeholder="Select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={["Pending", "Ongoing", "Completed", "Archived"]}
          />

          <Button
            type="submit"
            variant="amber"
            size="md"
            className="w-full h-12 text-white font-bold text-sm rounded-xl shadow-lg mt-2 cursor-pointer"
          >
            Filter Application
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
