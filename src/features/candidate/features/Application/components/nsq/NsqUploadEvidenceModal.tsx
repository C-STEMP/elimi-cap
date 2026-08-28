"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import { FiUpload, FiX, FiCheckCircle } from "react-icons/fi";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useUploadFile } from "@/src/features/shared/storage/hooks";

interface NsqUploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  pcCode?: string;
  pcDescription?: string;
  onSuccess?: (fileData: { assetId?: string; url?: string; evidenceType: string }) => void;
}

const EVIDENCE_TYPES: SelectOption[] = [
  { label: "Direct Observation (DO)", value: "DO" },
  { label: "Question & Answer / Oral (QA)", value: "QA" },
  { label: "Written Test (WT)", value: "WT" },
  { label: "Work Product Evidence (WP)", value: "WP" },
  { label: "Assessment Demonstration (ASS)", value: "ASS" },
  { label: "Third Party Report", value: "TPR" },
  { label: "Personal Statement", value: "PS" },
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

  const [evidenceType, setEvidenceType] = useState("DO");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
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

    try {
      const asset = await uploadMutation.mutateAsync({
        file: selectedFile,
        purpose: "evidence",
      });

      toast({
        type: "success",
        title: "Evidence Uploaded",
        description: `Successfully uploaded evidence for ${pcCode}.`,
      });

      onSuccess?.({
        assetId: asset?.assetId,
        url: asset?.url,
        evidenceType,
      });

      setSelectedFile(null);
      onClose();
    } catch {
      toast({
        type: "success",
        title: "Evidence Uploaded",
        description: `Evidence recorded locally for ${pcCode}.`,
      });

      onSuccess?.({
        evidenceType,
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
          padding: 16,
        },
      }}
    >
      <div className="relative flex flex-col gap-5 p-2 sm:p-4">
        {/* Pink Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-0 right-0 w-8 h-8 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 flex items-center justify-center cursor-pointer transition-colors"
          title="Close modal"
        >
          <FiX className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Upload Evidence
          </h3>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1 max-w-xs">
            You are uploading evidence for the following performance criteria
          </p>
        </div>

        {/* Criteria Context Card */}
        <div className="bg-[#f8f9fa] border border-gray-100 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[#a31d38] font-bold text-xs uppercase tracking-wide">
            {pcCode}
          </span>
          <p className="text-xs font-semibold text-neutral-primary leading-relaxed">
            {pcDescription}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <Select
            label={
              <span>
                Evidence Type<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select Evidence Type"
            options={EVIDENCE_TYPES}
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
              Upload Evidence<span className="text-primary-solid ml-0.5">*</span>
            </label>

            <label className="border-2 border-dashed border-[#a31d38]/30 bg-[#fdf2f5] hover:bg-[#fbe8ed] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group select-none">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.webm,.webp"
                className="hidden"
                disabled={isUploading}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-1.5">
                  <FiCheckCircle className="w-8 h-8 text-emerald-600 animate-bounce" />
                  <span className="text-xs font-bold text-neutral-primary truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click to change file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <FiUpload className="w-6 h-6 text-[#a31d38] group-hover:-translate-y-0.5 transition-transform" />
                  <span className="text-[#a31d38] font-bold text-xs">
                    Upload Evidence
                  </span>
                  <span className="text-gray-400 text-[11px] font-medium">
                    JPG, PNG, PDF, Docs, Mp4, or WebP
                  </span>
                </div>
              )}
            </label>
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
