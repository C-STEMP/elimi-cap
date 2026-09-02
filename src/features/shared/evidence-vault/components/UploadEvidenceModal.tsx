"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUpload, FiFileText, FiCheck, FiTrash2 } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";

import { useGetEvidenceTypesByTrade } from "@/src/features/shared/reference/hooks";

export interface SelectedFileType {
  name: string;
  size: string;
  completed: boolean;
}

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  PS: "Product / Work Sample (PS)",
  WT: "Witness Testimony (WT)",
  DO: "Direct Observation (DO)",
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
  { label: "Direct Observation (DO)", value: "DO" },
  { label: "Professional Discussion (PD)", value: "PD" },
  { label: "Workplace Performance (WP)", value: "WP" },
  { label: "Questioning / Assessment (QA)", value: "QA" },
  { label: "Assignment (ASS)", value: "ASS" },
];

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSubmit: (
    docName: string,
    evidenceType: string,
    file: File | null,
  ) => Promise<void> | void;
  isUploading?: boolean;
  tradeId?: string;
  evidenceTypes?: string[];
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  isOpen,
  onClose,
  onUploadSubmit,
  isUploading = false,
  tradeId = "",
  evidenceTypes,
}) => {
  const { data: tradeEvidenceTypes } = useGetEvidenceTypesByTrade(tradeId);

  const evidenceTypeOptions = React.useMemo(() => {
    const types = evidenceTypes || tradeEvidenceTypes;
    if (Array.isArray(types) && types.length > 0) {
      const filtered = types.filter(
        (t) => t && typeof t === "string" && t.trim().toUpperCase() !== "RPL",
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
  }, [evidenceTypes, tradeEvidenceTypes]);

  const defaultType = evidenceTypeOptions[0]?.value || "PS";
  const [docName, setDocName] = useState("");
  const [evidenceType, setEvidenceType] = useState(defaultType);
  const [realFile, setRealFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFileType | null>(
    null,
  );
  const [errors, setErrors] = useState<{
    file?: string;
    docName?: string;
  }>({});

  React.useEffect(() => {
    if (
      evidenceTypeOptions.length > 0 &&
      !evidenceTypeOptions.some((opt) => opt.value === evidenceType)
    ) {
      setEvidenceType(evidenceTypeOptions[0].value);
    }
  }, [evidenceTypeOptions, evidenceType]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleRealFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors({ file: "File size must be less than 5MB" });
        e.target.value = "";
        return;
      }

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr =
        file.size > 1024 * 1024
          ? `${sizeMb} mb`
          : `${Math.round(file.size / 1024)} kb`;
      setRealFile(file);
      setSelectedFile({
        name: file.name,
        size: sizeStr,
        completed: true,
      });
      if (!docName) {
        setDocName(file.name.replace(/\.[^/.]+$/, ""));
      }
      setErrors({});
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    const newErrors: { file?: string; docName?: string } = {};

    if (!realFile && !selectedFile) {
      newErrors.file = "Please select a file to upload";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onUploadSubmit(docName, evidenceType, realFile);
    setDocName("");
    setEvidenceType(defaultType);
    setRealFile(null);
    setSelectedFile(null);
    setErrors({});
  };

  const handleCloseModal = () => {
    if (isUploading) return;
    setDocName("");
    setEvidenceType(defaultType);
    setRealFile(null);
    setSelectedFile(null);
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
          className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100"
        >
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-11 h-11 bg-primary/10 hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-primary cursor-pointer absolute top-6 right-6 transition-colors"
          >
            <FiX className="w-6 h-6 stroke-[2.5]" />
          </button>

          <h3 className="text-xl lg:mt-10 lg:text-2xl font-extrabold text-black tracking-tight text-center mb-1">
            Upload Evidence
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed mb-6 max-w-sm mx-auto">
            Name your file properly, so you can be sure you uploaded the right
            evidence
          </p>

          <div className="space-y-4 text-left">
            <Input
              label="Document Name (optional)"
              placeholder="Type The Document Name Here"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
            />

            <Select
              label="Evidence Type"
              placeholder="Select"
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              options={evidenceTypeOptions}
            />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRealFileChange}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.webp,image/*,application/pdf"
              className="hidden"
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
                Upload Evidence <span className="text-red-500">*</span>
              </label>
              <div
                onClick={handleSelectFileClick}
                className={`border-2 border-dashed ${
                  errors.file
                    ? "border-red-400 bg-red-50"
                    : "border-[#F4B4C0] bg-[#FFF5F7]"
                } hover:bg-[#FFEBF0] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#BE185D] mb-2">
                  <FiUpload className="w-6 h-6 stroke-2" />
                </div>
                <span className="font-semibold text-xs text-[#BE185D] mb-1">
                  Upload Evidence
                </span>
                <span className="text-[11px] text-gray-400">
                  JPG, PNG, PDF, Docs, Mp4, or WebP (Max 5MB)
                </span>
              </div>
              {errors.file && (
                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
              )}
            </div>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-input-bg rounded-2xl p-4 flex items-center justify-between border border-gray-200/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#fce3e7]">
                    <FiFileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-black font-bold text-xs">
                      {selectedFile.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <span>{selectedFile.size}</span>
                      <span>•</span>
                      <span className="text-[#047857] font-semibold flex items-center gap-1">
                        <FiCheck className="w-3.5 h-3.5 stroke-3 text-[#047857]" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setRealFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleSubmit}
              disabled={isUploading}
              className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-6 cursor-pointer"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
