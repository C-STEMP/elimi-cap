"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiUpload,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { NsqUploadEvidenceModal } from "./NsqUploadEvidenceModal";

interface PerformanceCriteria {
  id: string;
  code: string;
  description: string;
  evidenceUrl?: string;
  evidenceType?: string;
}

interface LearningOutcome {
  id: string;
  title: string;
  criteria: PerformanceCriteria[];
}

interface NsqUnitDetailViewProps {
  unitNumber?: string;
  unitTitle?: string;
  tradeName?: string;
  onBack: () => void;
}

const DEFAULT_LEARNING_OUTCOMES: LearningOutcome[] = [
  {
    id: "lo-1",
    title: "LO 1: Maintain personal health and hygiene",
    criteria: [
      {
        id: "pc-1-1",
        code: "PC 1.1",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
      },
      {
        id: "pc-1-2",
        code: "PC 1.2",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
      },
      {
        id: "pc-1-3",
        code: "PC 1.3",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
      },
      {
        id: "pc-1-4",
        code: "PC 1.4",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
      },
      {
        id: "pc-1-5",
        code: "PC 1.5",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
      },
      {
        id: "pc-1-6",
        code: "PC 1.6",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
      },
      {
        id: "pc-1-7",
        code: "PC 1.7",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
      },
      {
        id: "pc-1-8",
        code: "PC 1.8",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
      },
      {
        id: "pc-1-9",
        code: "PC 1.9",
        description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
      },
    ],
  },
  {
    id: "lo-2",
    title: "LO 2: Maintain a hygienic, safe and hazard free workplace.",
    criteria: [
      {
        id: "pc-2-1",
        code: "PC 2.1",
        description: "Identify potential hazards and adhere strictly to safety protocols.",
      },
      {
        id: "pc-2-2",
        code: "PC 2.2",
        description: "Ensure work areas are cleared of obstructions, debris, and contaminants.",
      },
      {
        id: "pc-2-3",
        code: "PC 2.3",
        description: "Operate emergency shut-off controls and first-aid kits correctly.",
      },
    ],
  },
  {
    id: "lo-3",
    title: "LO 3: Maintain a hygienic, safe and secure workplace",
    criteria: [
      {
        id: "pc-3-1",
        code: "PC 3.1",
        description: "Safely store tools, power equipment, and specialized hazardous substances.",
      },
      {
        id: "pc-3-2",
        code: "PC 3.2",
        description: "Maintain secure inventory documentation and report safety irregularities.",
      },
    ],
  },
];

export const NsqUnitDetailView: React.FC<NsqUnitDetailViewProps> = ({
  unitNumber = "Unit 01",
  unitTitle = "Core Fundamentals & Safety Standards",
  tradeName = "Carpentry",
  onBack,
}) => {
  const [expandedLoIds, setExpandedLoIds] = useState<string[]>(["lo-1"]);
  const [expandedPcIds, setExpandedPcIds] = useState<string[]>(["pc-1-1"]);

  const [activePcForUpload, setActivePcForUpload] = useState<PerformanceCriteria | null>(null);
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>(
    DEFAULT_LEARNING_OUTCOMES,
  );

  const toggleLo = (id: string) => {
    setExpandedLoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const togglePc = (id: string) => {
    setExpandedPcIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleEvidenceUploaded = (data: { assetId?: string; url?: string; evidenceType: string }) => {
    if (!activePcForUpload) return;

    setLearningOutcomes((prev) =>
      prev.map((lo) => ({
        ...lo,
        criteria: lo.criteria.map((pc) =>
          pc.id === activePcForUpload.id
            ? { ...pc, evidenceUrl: data.url || "uploaded", evidenceType: data.evidenceType }
            : pc,
        ),
      })),
    );
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#f8f9fa] min-h-screen">
      {/* Edge to edge header banner */}
      <HeaderBanner
        title={unitNumber}
        backTitle={unitNumber}
        backHref="#"
        rightAction={
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            ← Back to Overview
          </button>
        }
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: tradeName, href: "#" },
          { label: unitNumber },
        ]}
      />

      <div className="w-full max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
        {learningOutcomes.map((lo) => {
          const isLoExpanded = expandedLoIds.includes(lo.id);
          return (
            <div
              key={lo.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all"
            >
              {/* LO Header Accordion Toggle */}
              <button
                type="button"
                onClick={() => toggleLo(lo.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-extrabold text-sm sm:text-base text-neutral-primary hover:bg-gray-50/70 transition-colors cursor-pointer select-none"
              >
                <span>{lo.title}</span>
                <div className="text-gray-400">
                  {isLoExpanded ? (
                    <FiChevronUp className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>
              </button>

              {/* LO Body */}
              <AnimatePresence>
                {isLoExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-2.5 px-4 sm:px-5 pb-5 border-t border-gray-100 pt-3 bg-[#fafbfc]"
                  >
                    {lo.criteria.map((pc) => {
                      const isPcExpanded = expandedPcIds.includes(pc.id);
                      return (
                        <div
                          key={pc.id}
                          className="bg-white rounded-xl border border-gray-200/80 overflow-hidden transition-all shadow-2xs"
                        >
                          {/* PC Header */}
                          <div
                            onClick={() => togglePc(pc.id)}
                            className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/60 select-none transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 font-bold text-[11px] uppercase shrink-0">
                                {pc.code}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-neutral-primary line-clamp-1">
                                {pc.description}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {pc.evidenceUrl && (
                                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <FiCheckCircle className="w-3 h-3" /> Evidence Uploaded
                                </span>
                              )}
                              <div className="text-gray-400">
                                {isPcExpanded ? (
                                  <FiChevronUp className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <FiChevronDown className="w-4 h-4 stroke-[2.5]" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* PC Body (Upload Box) */}
                          <AnimatePresence>
                            {isPcExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-4 pb-4 pt-1"
                              >
                                {pc.evidenceUrl ? (
                                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                      <FiFileText className="w-5 h-5 text-emerald-700" />
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold text-emerald-900">
                                          Evidence Uploaded ({pc.evidenceType || "DO"})
                                        </span>
                                        <span className="text-[11px] text-emerald-700">
                                          Ready for Assessor Review
                                        </span>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setActivePcForUpload(pc)}
                                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
                                    >
                                      Re-upload
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setActivePcForUpload(pc)}
                                    className="w-full border-2 border-dashed border-[#a31d38]/30 hover:border-[#a31d38]/60 bg-[#fdf2f5] hover:bg-[#fbe8ed] rounded-xl p-4 flex items-center justify-center gap-2 text-xs font-bold text-[#a31d38] transition-all cursor-pointer select-none"
                                  >
                                    <FiUpload className="w-4 h-4" />
                                    <span>Upload Evidence For {pc.code}</span>
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Upload Evidence Modal */}
      <NsqUploadEvidenceModal
        isOpen={Boolean(activePcForUpload)}
        onClose={() => setActivePcForUpload(null)}
        pcCode={activePcForUpload?.code}
        pcDescription={activePcForUpload?.description}
        onSuccess={handleEvidenceUploaded}
      />
    </div>
  );
};
