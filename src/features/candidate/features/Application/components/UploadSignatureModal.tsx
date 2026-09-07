"use client";

import React, { useState, useRef } from "react";
import {
  FiX,
  FiUpload,
  FiTrash2,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { useSetCandidateProfileSignature } from "@/src/features/shared/onboarding/hooks";
import type { StorageAsset } from "@/src/features/shared/storage/api";

interface UploadSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (signature?: { assetId: string; url?: string }) => void;
}

export const UploadSignatureModal: React.FC<UploadSignatureModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedAsset, setUploadedAsset] = useState<StorageAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadFile();
  const setSignatureMutation = useSetCandidateProfileSignature();

  if (!isOpen) return null;

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedAsset(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        type: "error",
        title: "File Too Large",
        description: "Signature file size must be less than 5MB.",
      });
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 88 ? prev + 12 : prev));
    }, 120);

    try {
      const asset = await uploadMutation.mutateAsync({
        file,
        purpose: "signature",
      });
      clearInterval(interval);
      setUploadProgress(100);
      setUploadedAsset(asset);
    } catch {
      clearInterval(interval);
      setUploadProgress(0);
      toast({
        type: "error",
        title: "Upload Failed",
        description: "Failed to upload signature. Please try again.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUploading) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedAsset(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!uploadedAsset?.assetId) return;

    try {
      await setSignatureMutation.mutateAsync(uploadedAsset.assetId);
    } catch {
      // Handled by toast
    }

    try {
      localStorage.setItem(
        "user_saved_signature",
        JSON.stringify({
          assetId: uploadedAsset.assetId,
          url: uploadedAsset.url,
        }),
      );
    } catch {}

    onUploadSuccess({
      assetId: uploadedAsset.assetId,
      url: uploadedAsset.url,
    });
    handleClose();
  };

  const fileSizeStr = selectedFile
    ? selectedFile.size > 1024 * 1024
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(selectedFile.size / 1024)} KB`
    : "";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full relative shadow-2xl flex flex-col border border-gray-100"
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FDF2F4] text-[#A31D38] hover:bg-[#FCE3E7] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <FiX className="w-4 h-4 stroke-[2.5]" />
          </button>

          <h3 className="text-[#1A1A1A] font-extrabold text-xl sm:text-2xl text-center mt-2 mb-1 tracking-tight">
            Upload Signature
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm text-center leading-relaxed mb-6 max-w-xs mx-auto font-normal">
            Please upload your signature to complete this step. Ensure the
            signature is clear and legible.
          </p>

          <div className="text-left w-full">
            <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none block mb-1.5">
              Upload Evidence <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf"
              style={{ display: "none" }}
              className="hidden"
            />

            <div
              onClick={() => {
                if (!isUploading) fileInputRef.current?.click();
              }}
              className="border-2 border-dashed border-[#F4B4C0] bg-[#FFF5F7] hover:bg-[#FFEBF0] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors mb-4 select-none"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#BE185D] mb-2">
                <FiUpload className="w-6 h-6 stroke-2" />
              </div>
              <span className="font-semibold text-xs text-[#BE185D] mb-1">
                {isUploading ? "Uploading Signature..." : "Upload Evidence"}
              </span>
              <span className="text-[11px] text-gray-400">
                JPG, PNG, PDF, Docs, or WebP (Max 5MB)
              </span>
            </div>

            {selectedFile && (
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-4 flex flex-col gap-2.5 mb-6 shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#FDF2F4] text-[#A31D38] flex items-center justify-center shrink-0 overflow-hidden border border-rose-100">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Signature preview"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <FiFileText className="w-5 h-5 stroke-[2]" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-black text-xs sm:text-sm leading-snug truncate max-w-45">
                        {selectedFile.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium mt-0.5">
                        <span>{fileSizeStr}</span>
                        <span>•</span>
                        {isUploading ? (
                          <span className="text-[#A31D38] font-semibold flex items-center gap-1">
                            Uploading... {uploadProgress}%
                          </span>
                        ) : (
                          <span className="text-[#047857] font-semibold flex items-center gap-1">
                            <FiCheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                            Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="text-gray-400 hover:text-red-500 hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove file"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar displayed while uploading */}
                {isUploading && (
                  <div className="w-full bg-gray-200/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#A31D38] h-full rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isUploading || !uploadedAsset || setSignatureMutation.isPending
            }
            loading={setSignatureMutation.isPending}
            variant="amber"
            size="lg"
            fullWidth
            rounded="xl"
            className={`h-12 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md ${
              isUploading || !uploadedAsset
                ? "bg-[#fbab2a]/50 text-white/80 cursor-not-allowed border-0"
                : "bg-[#fbab2a] hover:bg-[#e89b1f] text-white cursor-pointer"
            }`}
          >
            Upload
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
