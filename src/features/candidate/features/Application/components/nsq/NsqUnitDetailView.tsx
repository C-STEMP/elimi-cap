"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiUpload,
  FiCheck,
  FiCheckCircle,
  FiFileText,
  FiX,
  FiLock,
} from "react-icons/fi";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { submitUnitEvidenceApi } from "@/src/features/shared/applications/api";
import type { NsqCriterion } from "@/src/features/shared/applications/api/types";
import {
  useGetUnitCriteria,
  useSubmitUnitEvidence,
  useSubmitUnitSignoff,
} from "@/src/features/shared/applications/hooks";
import { NsqUploadEvidenceModal } from "./NsqUploadEvidenceModal";
import { NsqPreviewEvidenceModal } from "./NsqPreviewEvidenceModal";
import { useUrlModalValue, useModalDraft } from "@/src/lib/hooks/usePersistentModal";
import { NSQ_UPLOAD_EVIDENCE_MODAL } from "@/src/lib/modal-keys";

export type EvidenceStatus = "in_review" | "approved" | "rejected";

export interface EvidenceItem {
  id: string;
  title: string;
  evidenceType: string;
  status: EvidenceStatus;
  feedback?: string;
  url?: string;
  fileName?: string;
  fileSize?: string;
}

export interface PerformanceCriteria {
  id: string;
  code: string;
  description: string;
  evidences: EvidenceItem[];
}

export interface LearningOutcome {
  id: string;
  title: string;
  criteria: PerformanceCriteria[];
}

interface NsqUnitDetailViewProps {
  applicationId?: string;
  unitId?: string;
  unitNumber?: string;
  unitTitle?: string;
  tradeName?: string;
  currentStageKey?: string;
  structure?: Record<string, unknown>;
  onBack: () => void;
}

function parseStructureToLearningOutcomes(
  structure?: Record<string, unknown>,
  tradeName: string = "Trade",
): LearningOutcome[] {
  if (structure) {
    const rawOutcomes =
      (structure as any).learningObjectives ||
      (structure as any).learningOutcomes ||
      (Array.isArray(structure) ? structure : null);

    if (Array.isArray(rawOutcomes) && rawOutcomes.length > 0) {
      return rawOutcomes.map((lo: any, loIdx: number) => {
        const loCode = lo.code || `LO ${loIdx + 1}`;
        const loText = lo.text || lo.title || `Maintain core competencies in ${tradeName}`;
        const loTitle = loText.startsWith("LO") ? loText : `${loCode}: ${loText}`;

        const rawCriteria = lo.performanceCriteria || lo.criteria || [];
        const criteria: PerformanceCriteria[] = Array.isArray(rawCriteria) && rawCriteria.length > 0
          ? rawCriteria.map((pc: any, pcIdx: number) => {
              const pcCode = pc.code
                ? pc.code.startsWith("PC")
                  ? pc.code
                  : `PC ${pc.code}`
                : `PC ${loIdx + 1}.${pcIdx + 1}`;
              const pcDesc =
                pc.text ||
                pc.description ||
                `Demonstrate required occupational standard criteria for ${tradeName}.`;

              // Use real evidences if provided from backend or empty array for fresh criteria
              const initialEvidences: EvidenceItem[] = Array.isArray(pc.evidences)
                ? pc.evidences
                : [];

              return {
                id: `pc-${loIdx + 1}-${pcIdx + 1}`,
                code: pcCode,
                description: pcDesc,
                evidences: initialEvidences,
              };
            })
          : [
              {
                id: `pc-${loIdx + 1}-1`,
                code: `PC ${loIdx + 1}.1`,
                description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
                evidences: [],
              },
              {
                id: `pc-${loIdx + 1}-2`,
                code: `PC ${loIdx + 1}.2`,
                description: "Adhere to environmental safety, tool calibration, and equipment maintenance protocols.",
                evidences: [],
              },
            ];

        return {
          id: `lo-${loIdx + 1}`,
          title: loTitle,
          criteria,
        };
      });
    }
  }

  // Default Learning Outcomes (clean state without hardcoded mock cards)
  return [
    {
      id: "lo-1",
      title: "LO 1: Maintain personal health and hygiene",
      criteria: [
        {
          id: "pc-1-1",
          code: "PC 1.1",
          description: "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
          evidences: [],
        },
        {
          id: "pc-1-2",
          code: "PC 1.2",
          description: "Ensure personal hygiene meets industry and regulatory health safety standards.",
          evidences: [],
        },
        {
          id: "pc-1-3",
          code: "PC 1.3",
          description: "Identify communication tools and their uses e.g. tablets, phones, magazines etc.",
          evidences: [],
        },
        {
          id: "pc-1-4",
          code: "PC 1.4",
          description: "List the different channels of communication e.g. notice board, flyers, stickers, flyers, etc.",
          evidences: [],
        },
      ],
    },
    {
      id: "lo-2",
      title: "LO 2: Understand communication style and maintain a hygienic, safe workplace.",
      criteria: [
        {
          id: "pc-2-1",
          code: "PC 2.1",
          description: `Identify potential hazards and adhere strictly to ${tradeName} safety protocols.`,
          evidences: [],
        },
        {
          id: "pc-2-2",
          code: "PC 2.2",
          description: "Ensure work areas are cleared of obstructions, debris, and contaminants.",
          evidences: [],
        },
      ],
    },
    {
      id: "lo-3",
      title: "LO 3: Know the art of effective communication and secure inventory handling",
      criteria: [
        {
          id: "pc-3-1",
          code: "PC 3.1",
          description: `Safely store tools, power equipment, and specialized substances for ${tradeName}.`,
          evidences: [],
        },
        {
          id: "pc-3-2",
          code: "PC 3.2",
          description: "Maintain secure inventory documentation and report safety irregularities.",
          evidences: [],
        },
      ],
    },
  ];
}

function parseCriteriaToLearningOutcomes(
  criteria: NsqCriterion[],
  tradeName: string = "Trade",
): LearningOutcome[] {
  const groups: Record<
    string,
    { title: string; criteria: PerformanceCriteria[] }
  > = {};

  criteria.forEach((crit) => {
    const loKey = crit.learningObjectiveCode || "LO 1";
    const loTitle = crit.learningObjectiveText
      ? `${loKey}: ${crit.learningObjectiveText}`
      : `${loKey}: Occupational Core Competencies for ${tradeName}`;

    if (!groups[loKey]) {
      groups[loKey] = {
        title: loTitle,
        criteria: [],
      };
    }

    // Per the backend contract, `latest` is the single live row for this
    // criterion — everything else in `history` has been superseded by a
    // newer submission. Only the live row should render as "the" evidence;
    // showing the full history here would make every re-upload look like
    // it added a duplicate instead of replacing the prior submission.
    const evidences: EvidenceItem[] = (crit.latest ? [crit.latest] : []).map((item) => ({
      id: item.id,
      title:
        item.evidenceType === "WP"
          ? "Work Product(WP)"
          : `${item.evidenceType} Evidence`,
      evidenceType: item.evidenceType,
      status:
        item.reviewStatus === "approved"
          ? "approved"
          : item.reviewStatus === "rejected"
            ? "rejected"
            : "in_review",
      feedback: item.reviewComment || item.iqaReviewComment || undefined,
      url: item.evidenceAssetId ? `/api/assets/${item.evidenceAssetId}` : undefined,
      fileName: `Evidence_${item.performanceCriteriaCode}.${item.evidenceType.toLowerCase()}`,
    }));

    groups[loKey].criteria.push({
      id: `pc-${crit.code.replace(/[^a-zA-Z0-9]/g, "-")}`,
      code: crit.code.startsWith("PC") ? crit.code : `PC ${crit.code}`,
      description:
        crit.text || `Demonstrate performance standard for ${crit.code}`,
      evidences,
    });
  });

  const outcomeList = Object.keys(groups).map((key, loIdx) => ({
    id: `lo-${loIdx + 1}`,
    title: groups[key].title,
    criteria: groups[key].criteria,
  }));

  return outcomeList.length > 0
    ? outcomeList
    : [
        {
          id: "lo-1",
          title: `LO 1: Core Occupational Competencies for ${tradeName}`,
          criteria: [],
        },
      ];
}

export const NsqUnitDetailView: React.FC<NsqUnitDetailViewProps> = ({
  applicationId,
  unitId,
  unitNumber = "Unit 01",
  unitTitle = "Core Fundamentals & Safety Standards",
  tradeName = "Carpentry",
  currentStageKey,
  structure,
  onBack,
}) => {
  const { data: remoteCriteriaData } = useGetUnitCriteria(
    applicationId || "",
    unitId || "",
    { enabled: Boolean(applicationId && unitId) },
  );
  const { mutateAsync: submitEvidenceMutation } = useSubmitUnitEvidence(
    applicationId || "",
    unitId || "",
  );
  const { mutateAsync: submitSignoffMutation } = useSubmitUnitSignoff(
    applicationId || "",
    unitId || "",
  );

  const [expandedLoIds, setExpandedLoIds] = useState<string[]>(["lo-1"]);
  const [expandedPcIds, setExpandedPcIds] = useState<string[]>(["pc-1-1"]);

  const [activePcForUpload, setActivePcForUpload] = useUrlModalValue<PerformanceCriteria>(NSQ_UPLOAD_EVIDENCE_MODAL);
  // Set only when re-uploading to replace an existing evidence row — seeds
  // the modal's evidence type with the type being replaced instead of
  // defaulting to a fresh upload's default.
  const [replacingEvidenceType, setReplacingEvidenceType] = useModalDraft<string | undefined>(NSQ_UPLOAD_EVIDENCE_MODAL, "replacingEvidenceType", undefined);
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>(() =>
    parseStructureToLearningOutcomes(structure, tradeName),
  );

  useEffect(() => {
    if (remoteCriteriaData?.criteria && remoteCriteriaData.criteria.length > 0) {
      setLearningOutcomes(
        parseCriteriaToLearningOutcomes(remoteCriteriaData.criteria, tradeName),
      );
    }
  }, [remoteCriteriaData, tradeName]);

  // Evidence Preview State
  const [previewEvidenceItem, setPreviewEvidenceItem] = useState<{
    item: EvidenceItem;
    pc: PerformanceCriteria;
  } | null>(null);

  // Floating Upload Success Banner
  const [showUploadToast, setShowUploadToast] = useState(false);

  const toggleLo = (id: string) => {
    setExpandedLoIds((prev) => (prev.includes(id) ? [] : [id]));
  };

  const togglePc = (id: string) => {
    setExpandedPcIds((prev) => (prev.includes(id) ? [] : [id]));
  };

  const handleEvidenceUploaded = async (data: {
    assetId?: string;
    url?: string;
    evidenceType: string;
    fileName: string;
    fileSize: string;
  }) => {
    if (!activePcForUpload) return;

    // Evidence isn't recorded until the backend confirms it — an upload that
    // never reached storage or failed to attach to this criterion must not
    // appear as if it succeeded.
    if (!applicationId || !unitId || !data.assetId) return;

    try {
      await submitEvidenceMutation({
        performanceCriteriaCode: activePcForUpload.code.replace("PC ", ""),
        evidenceType: data.evidenceType,
        evidenceAssetId: data.assetId,
      });
    } catch {
      // useSubmitUnitEvidence already surfaced an error toast.
      return;
    }

    const newEvidence: EvidenceItem = {
      id: `ev-${Date.now()}`,
      title: data.evidenceType === "WP" ? "Work Product(WP)" : `${data.evidenceType} Evidence`,
      evidenceType: data.evidenceType,
      status: "in_review",
      url: data.url,
      fileName: data.fileName,
      fileSize: data.fileSize,
    };

    // Replace, not append — this submission is now the single live row for
    // the criterion (matches the backend's latest/history model above), so
    // a re-upload must visually replace the evidence it's superseding.
    setLearningOutcomes((prev) =>
      prev.map((lo) => ({
        ...lo,
        criteria: lo.criteria.map((pc) =>
          pc.id === activePcForUpload.id
            ? { ...pc, evidences: [newEvidence] }
            : pc,
        ),
      })),
    );

    setShowUploadToast(true);
    setTimeout(() => setShowUploadToast(false), 4000);
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#f8f9fa] min-h-screen relative pb-12">
      {/* Top Right Floating Upload Success Notification (Image 2) */}
      <AnimatePresence>
        {showUploadToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 flex items-center gap-3.5 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FiCheck className="w-5 h-5 stroke-3" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-extrabold text-neutral-primary">
                Upload Successful
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                You have successfully uploaded an evidence
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadToast(false)}
              className="text-gray-400 hover:text-gray-600 ml-auto p-1 cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edge to edge header banner */}
      <HeaderBanner
        title={unitNumber}
        backTitle={unitNumber}
        onBackClick={onBack}
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
          { label: tradeName, onClick: onBack },
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
                    className="flex flex-col gap-3 px-4 sm:px-5 pb-5 border-t border-gray-100 pt-3 bg-[#fafbfc]"
                  >
                    {lo.criteria.map((pc) => {
                      const isPcExpanded = expandedPcIds.includes(pc.id);
                      const evidenceCount = pc.evidences.length;

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

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="bg-amber-100/70 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                {evidenceCount} Evidence
                              </span>
                              <div className="text-gray-400">
                                {isPcExpanded ? (
                                  <FiChevronUp className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <FiChevronDown className="w-4 h-4 stroke-[2.5]" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* PC Body (Evidence List & Upload) */}
                          <AnimatePresence>
                            {isPcExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-4 pb-4 pt-1 flex flex-col gap-3"
                              >
                                {/* Upload Evidence Trigger or Locked Notice */}
                                {currentStageKey && currentStageKey !== "regular_assessment" && currentStageKey !== "induction" ? (
                                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-semibold text-gray-500">
                                    <FiLock className="w-3.5 h-3.5 text-gray-400" />
                                    <span>
                                      Evidence upload closed &mdash; {currentStageKey === "internal_verification" ? "In Internal Verification (IQA)" : `Stage: ${currentStageKey}`}
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivePcForUpload(pc);
                                      setReplacingEvidenceType(undefined);
                                    }}
                                    className="w-full border-2 border-dashed border-[#a31d38]/30 hover:border-[#a31d38]/60 bg-[#fdf2f5] hover:bg-[#fbe8ed] rounded-xl p-3.5 flex items-center justify-center gap-2 text-xs font-bold text-[#a31d38] transition-all cursor-pointer select-none"
                                  >
                                    <FiUpload className="w-4 h-4" />
                                    <span>Upload Evidence For {pc.code}</span>
                                  </button>
                                )}

                                {/* List of Uploaded Evidences */}
                                {pc.evidences.map((ev) => {
                                  // 1. In Review Card (Amber)
                                  if (ev.status === "in_review") {
                                    return (
                                      <div
                                        key={ev.id}
                                        className="bg-[#fffcf4] border border-amber-300 rounded-xl p-3.5 flex items-center justify-between gap-3"
                                      >
                                        <div
                                          onClick={() =>
                                            setPreviewEvidenceItem({ item: ev, pc })
                                          }
                                          className="flex items-center gap-2.5 cursor-pointer group/item select-none"
                                        >
                                          <FiFileText className="w-4 h-4 text-amber-600" />
                                          <span className="text-xs font-bold text-amber-700 underline group-hover/item:text-amber-900 transition-colors">
                                            {ev.title}
                                          </span>
                                          <span className="bg-[#e07d10] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                            In Review
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActivePcForUpload(pc);
                                              setReplacingEvidenceType(ev.evidenceType);
                                            }}
                                            className="text-xs font-semibold text-neutral-800 hover:text-black cursor-pointer"
                                          >
                                            Re-upload
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // 2. Approved Card (Green)
                                  if (ev.status === "approved") {
                                    return (
                                      <div
                                        key={ev.id}
                                        className="bg-[#f2faf5] border border-emerald-300 rounded-xl p-3.5 flex flex-col gap-2"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div
                                            onClick={() =>
                                              setPreviewEvidenceItem({ item: ev, pc })
                                            }
                                            className="flex items-center gap-2 cursor-pointer group/item select-none"
                                          >
                                            <span className="text-xs font-bold text-emerald-900 underline group-hover/item:text-emerald-950 transition-colors">
                                              {ev.title}
                                            </span>
                                            <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                              <FiCheck className="w-2.5 h-2.5 stroke-3" />
                                              Approved
                                            </span>
                                          </div>
                                        </div>

                                        {ev.feedback && (
                                          <div className="bg-white/80 border border-emerald-200/80 rounded-lg p-2.5 text-[11px] text-gray-600 font-medium leading-relaxed">
                                            {ev.feedback}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }

                                  // 3. Rejected Card (Red)
                                  if (ev.status === "rejected") {
                                    return (
                                      <div
                                        key={ev.id}
                                        className="bg-[#fdf2f5] border border-[#a31d38]/40 rounded-xl p-3.5 flex flex-col gap-2"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div
                                            onClick={() =>
                                              setPreviewEvidenceItem({ item: ev, pc })
                                            }
                                            className="flex items-center gap-2 cursor-pointer group/item select-none"
                                          >
                                            <FiFileText className="w-4 h-4 text-[#a31d38]" />
                                            <span className="text-xs font-bold text-[#a31d38] underline group-hover/item:text-[#8a1538] transition-colors">
                                              {ev.title}
                                            </span>
                                            <span className="bg-[#8a1538] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                              Rejected
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-3">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActivePcForUpload(pc);
                                                setReplacingEvidenceType(ev.evidenceType);
                                              }}
                                              className="text-xs font-semibold text-neutral-800 hover:text-black cursor-pointer"
                                            >
                                              Re-upload
                                            </button>
                                          </div>
                                        </div>

                                        {ev.feedback && (
                                          <div className="bg-white/80 border border-red-200/80 rounded-lg p-2.5 text-[11px] text-[#a31d38] font-medium leading-relaxed">
                                            {ev.feedback}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }

                                  return null;
                                })}
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
        onClose={() => {
          setActivePcForUpload(null);
          setReplacingEvidenceType(undefined);
        }}
        pcCode={activePcForUpload?.code}
        pcDescription={activePcForUpload?.description}
        initialEvidenceType={replacingEvidenceType}
        isReplace={Boolean(replacingEvidenceType)}
        onSuccess={handleEvidenceUploaded}
      />

      {/* Preview Evidence Document Modal */}
      <NsqPreviewEvidenceModal
        isOpen={Boolean(previewEvidenceItem)}
        onClose={() => setPreviewEvidenceItem(null)}
        evidence={previewEvidenceItem?.item || null}
        performanceCriteria={previewEvidenceItem?.pc || null}
      />
    </div>
  );
};
