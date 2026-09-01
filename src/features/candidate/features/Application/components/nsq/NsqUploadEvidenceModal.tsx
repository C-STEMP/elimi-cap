"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import { FiUpload, FiX, FiCheck, FiTrash2, FiFileText } from "react-icons/fi";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useUploadFile } from "@/src/features/shared/storage/hooks";

interface NsqUploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  pcCode?: string;
  pcDescription?: string;
  onSuccess?: (fileData: {
    assetId?: string;
    url?: string;
    evidenceType: string;
    fileName: string;
    fileSize: string;
  }) => void;
}

const EVIDENCE_TYPES: SelectOption[] = [
  { label: "Work Product (WP)", value: "WP" },
  { label: "Direct Observation (DO)", value: "DO" },
  { label: "Question & Answer / Oral (QA)", value: "QA" },
  { label: "Written Test (WT)", value: "WT" },
  { label: "Assessment Demonstration (ASS)", value: "ASS" },
  { label: "Third Party Report (TPR)", value: "TPR" },
  { label: "Personal Statement (PS)", value: "PS" },
];

export const NsqUploadEvidenceModal: React.FC<NsqUploadEvidenceModalProps> = ({
  isOpen,
  onClose,
  pcCode = "PC 1.1",
  pcDescription = "Wear Clean, Smart And Appropriate Personal Protective Equipment.",
  onSuccess,
}) => {
  const { toast } = useToast();
  const uploadMutation = useUploadFile();

  const [evidenceType, setEvidenceType] = useState("WP");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        type: "error",
        title: "File Required",
        description: "Please select an evidence file to upload.",
      });
      return;
    }

    setIsUploading(true);

    const fileSizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} mb`;
    const localBlobUrl = URL.createObjectURL(selectedFile);

    try {
      const asset = await uploadMutation.mutateAsync({
        file: selectedFile,
        purpose: "evidence",
      });

      onSuccess?.({
        assetId: asset?.assetId,
        url: asset?.url || localBlobUrl,
        evidenceType,
        fileName: selectedFile.name,
        fileSize: fileSizeStr,
      });

      setSelectedFile(null);
      onClose();
    } catch {
      onSuccess?.({
        url: localBlobUrl,
        evidenceType,
        fileName: selectedFile.name,
        fileSize: fileSizeStr,
      });

      setSelectedFile(null);
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={isUploading ? () => {} : onClose}
      footer={null}
      centered
      closable={false}
      width={480}
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <div className="relative flex flex-col gap-5 p-2 sm:p-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-0 right-0 w-8 h-8 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 flex items-center justify-center cursor-pointer transition-colors"
          title="Close modal"
        >
          <FiX className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Upload Evidence
          </h3>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1 max-w-xs leading-relaxed">
            Name your file properly, so you can be sure you uploaded the right
            evidence
          </p>
        </div>

        <div className="bg-[#f8f9fa] border border-gray-100 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[#a31d38] font-bold text-xs uppercase tracking-wide">
            {pcCode}
          </span>
          <p className="text-xs font-semibold text-neutral-primary leading-relaxed">
            {pcDescription}
          </p>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <Select
            label={
              <span>
                Evidence Type
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={EVIDENCE_TYPES}
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
              Upload Evidence
              <span className="text-primary-solid ml-0.5">*</span>
            </label>

            <label className="border-2 border-dashed border-[#a31d38]/30 bg-[#fdf2f5] hover:bg-[#fbe8ed] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group select-none">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.webm,.webp"
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex flex-col items-center gap-1.5">
                <FiUpload className="w-5 h-5 text-[#a31d38] group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-[#a31d38] font-bold text-xs">
                  Upload Evidence
                </span>
                <span className="text-gray-400 text-[10px] font-medium">
                  JPG, PNG, PDF, Docs, Mp4, or WebP
                </span>
              </div>
            </label>

            {/* Selected File Card (Image 5) */}
            {selectedFile && (
              <div className="mt-2 bg-[#f8f9fa] border border-gray-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    <FiFileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-neutral-primary truncate max-w-55">
                      {selectedFile.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <span>
                        {(selectedFile.size / (1024 * 1024)).toFixed(0)} mb
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <FiCheck className="w-3 h-3 stroke-3" /> Completed
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                  title="Remove file"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={isUploading}
            className="w-full h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md mt-2 cursor-pointer"
          >
            Upload
          </Button>
        </form>
      </div>
    </Modal>
  );
};
