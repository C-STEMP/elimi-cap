"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiUpload,
  FiFileText,
  FiCheck,
  FiTrash2,
  FiImage,
  FiVideo,
} from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";

function renderFileTypeIcon(mimeType?: string, name?: string) {
  const mime = mimeType?.toLowerCase() || "";
  const ext = (name?.split(".").pop() || "").toLowerCase();

  if (
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)
  ) {
    return <FiImage className="w-5 h-5 text-primary" />;
  }
  if (
    mime.startsWith("video/") ||
    ["mp4", "mov", "avi", "mkv", "webm"].includes(ext)
  ) {
    return <FiVideo className="w-5 h-5 text-primary" />;
  }
  return <FiFileText className="w-5 h-5 text-primary" />;
}

import { useGetEvidenceTypesByTrade } from "@/src/features/shared/reference/hooks";
import type { Unit } from "@/src/features/shared/reference/api";
import { useModalDraft } from "@/src/lib/hooks/usePersistentModal";
import { UPLOAD_EVIDENCE_MODAL } from "@/src/lib/modal-keys";
import { getEvidenceTypeOptionLabel } from "../utils/evidenceConstants";

export interface SelectedFileType {
  name: string;
  size: string;
  completed: boolean;
}

export interface SelectedFileItem {
  file: File;
  name: string;
  size: string;
}

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  PS: "Product / Work Sample (PS)",
  WT: "Witness Testimony (WT)",
  PD: "Professional Discussion (PD)",
  WP: "Workplace Performance (WP)",
  QA: "Questioning / Assessment (QA)",
  ASS: "Assignment (ASS)",
  PE: "Portfolio Evidence (PE)",
  TPR: "Third Party Report (TPR)",
  SIM: "Simulation (SIM)",
};

const DEFAULT_EVIDENCE_TYPE_OPTIONS = [
  { label: "Product / Work Sample (PS)", value: "PS" },
  { label: "Witness Testimony (WT)", value: "WT" },
  { label: "Professional Discussion (PD)", value: "PD" },
  { label: "Workplace Performance (WP)", value: "WP" },
  { label: "Questioning / Assessment (QA)", value: "QA" },
  { label: "Assignment (ASS)", value: "ASS" },
];

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSubmit: (
    items: Array<{ file: File; docName: string }>,
    evidenceType: string,
    unitIds?: string[],
  ) => Promise<void> | void;
  isUploading?: boolean;
  tradeId?: string;
  evidenceTypes?: string[];
  /**
   * Authoritative list from GET /applications/{id}/evidence-types `allowed`
   * (RPL). When provided, values are offered verbatim — no filtering,
   * re-casing or defaults — because the backend validates against it.
   */
  allowedEvidenceTypes?: string[];
  /** True while `allowedEvidenceTypes` is still being fetched. */
  isLoadingEvidenceTypes?: boolean;
  /**
   * Hide the evidence type picker (e.g. CV upload, which goes to
   * POST /applications/{id}/cv and carries no evidence type).
   */
  hideEvidenceType?: boolean;
  initialDocName?: string;
  availableUnits?: Unit[];
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  isOpen,
  onClose,
  onUploadSubmit,
  isUploading = false,
  tradeId = "",
  evidenceTypes,
  allowedEvidenceTypes,
  isLoadingEvidenceTypes = false,
  hideEvidenceType = false,
  initialDocName,
  availableUnits = [],
}) => {
  const hasAllowedList = Array.isArray(allowedEvidenceTypes);
  // The trade catalogue is only the legacy fallback (NSQ / endpoint unavailable).
  const useLegacyTypes = !hasAllowedList && !isLoadingEvidenceTypes;
  const { data: tradeEvidenceTypes } = useGetEvidenceTypesByTrade(
    useLegacyTypes ? tradeId : "",
  );

  const evidenceTypeOptions = React.useMemo(() => {
    if (isLoadingEvidenceTypes) return [];
    if (hasAllowedList) {
      const seen = new Set<string>();
      return (allowedEvidenceTypes || [])
        .filter((t): t is string => typeof t === "string" && t.trim() !== "")
        .map((t) => t.trim())
        .filter((t) => (seen.has(t) ? false : (seen.add(t), true)))
        .map((value) => ({ label: getEvidenceTypeOptionLabel(value), value }));
    }
    const types = evidenceTypes || tradeEvidenceTypes;
    if (Array.isArray(types) && types.length > 0) {
      const filtered = types.filter(
        (t) => t && typeof t === "string" && t.trim().toUpperCase() !== "RPL" && t.trim().toUpperCase() !== "DO",
      );
      if (filtered.length > 0) {
        return filtered.map((type) => {
          const code = type.trim().toUpperCase();
          return {
            label: EVIDENCE_TYPE_LABELS[code] || type,
            value: code,
          };
        });
      }
    }
    return DEFAULT_EVIDENCE_TYPE_OPTIONS;
  }, [
    evidenceTypes,
    tradeEvidenceTypes,
    hasAllowedList,
    allowedEvidenceTypes,
    isLoadingEvidenceTypes,
  ]);

  // Legacy path always has options, so its "PS" fallback is unchanged; with an
  // API-driven list we never invent a value the backend did not allow.
  const defaultType =
    evidenceTypeOptions[0]?.value ||
    (hasAllowedList || isLoadingEvidenceTypes ? "" : "PS");
  const noEvidenceTypesAvailable =
    !hideEvidenceType &&
    !isLoadingEvidenceTypes &&
    hasAllowedList &&
    evidenceTypeOptions.length === 0;
  const [docName, setDocName] = useModalDraft(UPLOAD_EVIDENCE_MODAL, "docName", "");
  const [evidenceType, setEvidenceType] = useModalDraft(UPLOAD_EVIDENCE_MODAL, "evidenceType", defaultType);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{
    file?: string;
    docName?: string;
    evidenceType?: string;
  }>({});

  React.useEffect(() => {
    if (isOpen && initialDocName) {
      setDocName(initialDocName);
    }
  }, [isOpen, initialDocName, setDocName]);

  React.useEffect(() => {
    if (
      evidenceTypeOptions.length > 0 &&
      !evidenceTypeOptions.some((opt) => opt.value === evidenceType)
    ) {
      setEvidenceType(evidenceTypeOptions[0].value);
    }
  }, [evidenceTypeOptions, evidenceType, setEvidenceType]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const addFiles = (incomingFiles: File[]) => {
    if (!incomingFiles.length) return;

    const maxSize = 5 * 1024 * 1024;
    const oversized = incomingFiles.filter((f) => f.size > maxSize);
    if (oversized.length > 0) {
      setErrors({
        file:
          oversized.length === 1
            ? `"${oversized[0].name}" exceeds the 5MB size limit.`
            : `${oversized.length} files exceed the 5MB size limit.`,
      });
      return;
    }

    const newItems: SelectedFileItem[] = incomingFiles.map((file) => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr =
        file.size > 1024 * 1024
          ? `${sizeMb} mb`
          : `${Math.round(file.size / 1024)} kb`;
      return {
        file,
        name: file.name,
        size: sizeStr,
      };
    });

    setSelectedFiles((prev) => {
      const existing = new Set(
        prev.map((p) => `${p.file.name}_${p.file.size}_${p.file.lastModified}`),
      );
      const filtered = newItems.filter(
        (n) => !existing.has(`${n.file.name}_${n.file.size}_${n.file.lastModified}`),
      );
      const combined = [...prev, ...filtered];
      if (combined.length === 1 && !docName) {
        setDocName(combined[0].file.name.replace(/\.[^/.]+$/, ""));
      }
      return combined;
    });

    setErrors({});
  };

  const handleRealFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      addFiles(files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 1 && !docName) {
        setDocName(next[0].file.name.replace(/\.[^/.]+$/, ""));
      } else if (next.length === 0) {
        setDocName("");
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setErrors({ file: "Please select at least one file to upload" });
      return;
    }

    if (
      !hideEvidenceType &&
      (!evidenceType ||
        !evidenceTypeOptions.some((opt) => opt.value === evidenceType))
    ) {
      setErrors({
        evidenceType: noEvidenceTypesAvailable
          ? "No evidence types are available for this application."
          : "Please select an evidence type",
      });
      return;
    }

    const items = selectedFiles.map((item) => ({
      file: item.file,
      docName:
        selectedFiles.length === 1 && docName.trim()
          ? docName.trim()
          : item.file.name.replace(/\.[^/.]+$/, ""),
    }));

    await onUploadSubmit(items, evidenceType, selectedUnitIds);
    setDocName("");
    setEvidenceType(defaultType);
    setSelectedUnitIds([]);
    setSelectedFiles([]);
    setErrors({});
  };

  const handleCloseModal = () => {
    if (isUploading) return;
    setDocName("");
    setEvidenceType(defaultType);
    setSelectedUnitIds([]);
    setSelectedFiles([]);
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-2xl sm:rounded-[28px] p-4 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-9 h-9 sm:w-11 sm:h-11 bg-primary/10 hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-primary cursor-pointer absolute top-4 right-4 sm:top-6 sm:right-6 transition-colors z-10"
          >
            <FiX className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>

          <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight text-center mt-2 sm:mt-0 lg:mt-6 mb-1 pr-8 sm:pr-0">
            Upload Evidence
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed mb-6 max-w-sm mx-auto">
            Name your file properly, so you can be sure you uploaded the right
            evidence
          </p>

          <div className="space-y-4 text-left">
            {selectedFiles.length <= 1 && (
              <Input
                label="Document Name (optional)"
                placeholder="Type The Document Name Here"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
              />
            )}

            {!hideEvidenceType && (
              <Select
                label="Evidence Type"
                placeholder={isLoadingEvidenceTypes ? "Loading evidence types..." : "Select"}
                value={evidenceType || undefined}
                onChange={(e) => {
                  setEvidenceType(e.target.value);
                  setErrors((prev) => ({ ...prev, evidenceType: undefined }));
                }}
                options={evidenceTypeOptions}
                loading={isLoadingEvidenceTypes}
                disabled={isLoadingEvidenceTypes || noEvidenceTypesAvailable}
                error={errors.evidenceType}
                helperText={
                  noEvidenceTypesAvailable
                    ? "No evidence types are available for this application yet. Please contact your assessment centre."
                    : undefined
                }
              />
            )}

            {!hideEvidenceType && availableUnits && availableUnits.length > 0 && (
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-between">
                  <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
                    Target Units (Optional)
                  </label>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {selectedUnitIds.length} of {availableUnits.length} selected
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-200/80 bg-input-bg p-2 flex flex-col gap-1">
                  {availableUnits.map((u) => {
                    const isChecked = selectedUnitIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs select-none ${
                          isChecked
                            ? "bg-white shadow-2xs border border-primary/20"
                            : "hover:bg-white/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedUnitIds((prev) =>
                              prev.includes(u.id)
                                ? prev.filter((id) => id !== u.id)
                                : [...prev, u.id],
                            );
                          }}
                          className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary accent-[#8A1538]"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-neutral-primary leading-tight">
                            {u.referenceNumber ? `${u.referenceNumber}: ` : ""}
                            {u.title}
                          </span>
                          {u.isMandatory && (
                            <span className="text-[10px] text-pink-700 font-medium">
                              Mandatory Unit
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-400">
                  Select the qualification unit(s) this evidence demonstrates competency for.
                </p>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRealFileChange}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.webp,image/*,application/pdf"
              multiple
              className="hidden"
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
                Upload Evidence <span className="text-red-500">*</span>
              </label>
              <div
                onClick={handleSelectFileClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed ${
                  errors.file
                    ? "border-red-400 bg-red-50"
                    : isDragging
                      ? "border-[#BE185D] bg-[#FFF0F4]"
                      : "border-[#F4B4C0] bg-[#FFF5F7]"
                } hover:bg-[#FFEBF0] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#BE185D] mb-2">
                  <FiUpload className="w-6 h-6 stroke-2" />
                </div>
                <span className="font-semibold text-xs text-[#BE185D] mb-1">
                  {selectedFiles.length > 0 ? "Add More Files" : "Upload Evidence"}
                </span>
                <span className="text-[11px] text-gray-400">
                  JPG, PNG, PDF, Docs, Mp4, or WebP (Max 5MB each)
                </span>
              </div>
              {errors.file && (
                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
                  <span>Selected Files ({selectedFiles.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFiles([]);
                      setDocName("");
                    }}
                    className="text-red-500 hover:text-red-700 cursor-pointer font-medium"
                  >
                    Clear All
                  </button>
                </div>
                {selectedFiles.map((item, idx) => (
                  <motion.div
                    key={`${item.name}-${idx}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-input-bg rounded-2xl p-3 sm:p-4 flex items-center justify-between border border-gray-200/50 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#fce3e7]">
                        {renderFileTypeIcon(item.file.type, item.file.name)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-black font-bold text-xs truncate" title={item.name}>
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <span>{item.size}</span>
                          <span>•</span>
                          <span className="text-[#047857] font-semibold flex items-center gap-1">
                            <FiCheck className="w-3.5 h-3.5 stroke-3 text-[#047857]" />
                            Ready
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleSubmit}
              disabled={
                isUploading ||
                (!hideEvidenceType && isLoadingEvidenceTypes) ||
                noEvidenceTypesAvailable
              }
              className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-6 cursor-pointer"
            >
              {isUploading
                ? "Uploading..."
                : selectedFiles.length > 1
                  ? `Upload ${selectedFiles.length} Evidences`
                  : "Upload"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
