"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useGetAwardingBodies } from "@/src/features/shared/reference/hooks";

interface NotifyAwardingBodyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (awardingBodyId: string, awardingBodyName: string) => void;
}

const AWARDING_BODY_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  NBTE: {
    title: "National Board for Technical Education (NBTE)",
    description:
      "The National Board for Technical Education (NBTE) is responsible for regulating Technical and Vocational Education and Training (TVET) programmes in Nigeria. It oversees the implementation of the National Skills Qualification Framework (NSQF), accredits Assessment Centres, approves Awarding Bodies, and ensures that assessments and certifications meet national quality standards.",
  },
  NABTEB: {
    title: "National Business and Technical Examinations Board (NABTEB)",
    description:
      "NABTEB is a national assessment and examination board in Nigeria that conducts craft, technical, and business examinations and certifications.",
  },
  "City & Guilds": {
    title: "City & Guilds of London Institute",
    description:
      "A global leader in skills development and vocational training, providing recognized workplace qualifications.",
  },
};

export const NotifyAwardingBodyModal: React.FC<NotifyAwardingBodyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { data: remoteBodies = [] } = useGetAwardingBodies();
  const [selectedBodyId, setSelectedBodyId] = useState("");

  if (!isOpen) return null;

  const defaultOptions = [
    { label: "NBTE", value: "NBTE" },
    { label: "NABTEB", value: "NABTEB" },
    { label: "City & Guilds", value: "City & Guilds" },
  ];

  const options =
    remoteBodies.length > 0
      ? remoteBodies.map((b) => ({ label: b.name, value: b.id || b.name }))
      : defaultOptions;

  const selectedOption = options.find((opt) => opt.value === selectedBodyId);
  const selectedName = selectedOption?.label || selectedBodyId;

  const info =
    AWARDING_BODY_DESCRIPTIONS[selectedName] ||
    AWARDING_BODY_DESCRIPTIONS[selectedBodyId] ||
    (selectedName
      ? {
          title: selectedName,
          description:
            "The selected Awarding Body oversees qualification standards and quality assurance for assessment centres.",
        }
      : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBodyId) return;
    onSuccess(selectedBodyId, selectedName);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100"
        >
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer absolute top-6 right-6 transition-colors"
          >
            <FiX className="w-5 h-5 stroke-[2.5]" />
          </button>

          <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight text-center mb-1">
            Notify Awarding Body
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed mb-6 max-w-sm mx-auto">
            Send a notification to awarding Body
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <Select
              label="Select Awarding Body"
              placeholder="Select"
              value={selectedBodyId}
              onChange={(e) => setSelectedBodyId(e.target.value)}
              options={options}
            />

            {info && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FFF9EE] border border-[#FDE6B0] rounded-2xl p-4 sm:p-5 flex flex-col gap-1.5"
              >
                <h4 className="text-sm font-bold text-[#B45309]">
                  {info.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#92400E] leading-relaxed">
                  {info.description}
                </p>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="secondary"
              size="md"
              disabled={!selectedBodyId}
              className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-6 cursor-pointer"
            >
              Notify Awarding Body
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
