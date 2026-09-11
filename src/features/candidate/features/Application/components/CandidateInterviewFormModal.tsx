"use client";

import React, { useState, useRef } from "react";
import { FiX, FiCheckCircle, FiUpload, FiTrash2, FiFileText } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useSignoffInterviewForm } from "@/src/features/shared/applications/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import type { InterviewForm } from "@/src/features/shared/applications/api/types";

interface CandidateInterviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  formType: "records" | "assessment_grid" | "practical_observation" | "skill_demonstration";
  formTitle: string;
  formRecord?: InterviewForm | null;
  candidateName?: string;
  defaultMode?: "default" | "typed" | "upload";
}

export const CandidateInterviewFormModal: React.FC<
  CandidateInterviewFormModalProps
> = ({
  isOpen,
  onClose,
  applicationId,
  formType,
  formTitle,
  formRecord,
}) => {
  const { toast } = useToast();
  const signoffMutation = useSignoffInterviewForm(applicationId);
  const uploadMutation = useUploadFile();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isAlreadySigned = Boolean(formRecord?.candidateSignedAt);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ type: "error", title: "File Too Large", description: "Signature file size must be less than 5MB." });
      return;
    }
    setSelectedFile(file);
    setIsUploading(true);
    try {
      const asset = await uploadMutation.mutateAsync({ file, purpose: "signature" });
      setUploadedAssetId(asset.assetId);
      toast({ type: "success", title: "Signature Uploaded", description: "Your signature file is ready to submit." });
    } catch {
      toast({ type: "error", title: "Upload Failed", description: "Could not upload signature file. Please try again." });
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignoff = async () => {
    if (!uploadedAssetId) {
      toast({ type: "error", title: "Upload Required", description: "Please upload your signature file before submitting." });
      return;
    }
    try {
      await signoffMutation.mutateAsync({
        formType,
        payload: {
          signatureMode: "upload",
          signatureAssetId: uploadedAssetId,
        },
      });
      toast({ type: "success", title: "Form Signed", description: "You have successfully signed this assessment form." });
      onClose();
    } catch (err: any) {
      toast({ type: "error", title: "Signoff Failed", description: err?.message || "Failed to sign assessment form." });
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setUploadedAssetId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full relative shadow-2xl flex flex-col border border-gray-100"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FDF2F4] text-[#A31D38] hover:bg-[#FCE3E7] flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Title */}
          <h3 className="text-[#1A1A1A] font-extrabold text-lg sm:text-xl text-center mt-1 mb-1 tracking-tight pr-6">
            Upload Signature
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed mb-6 font-normal">
            {formTitle}
          </p>

          {isAlreadySigned ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center flex flex-col items-center gap-2">
              <FiCheckCircle className="w-8 h-8 text-emerald-600" />
              <p className="text-sm font-bold text-emerald-900">Form Already Endorsed</p>
              <p className="text-xs text-emerald-700">
                You signed this form on{" "}
                {formRecord?.candidateSignedAt
                  ? new Date(formRecord.candidateSignedAt).toLocaleDateString("en-GB")
                  : "record"}.
              </p>
            </div>
          ) : (
            <>
              {/* Upload Drop Zone / Selected File */}
              <div className="flex flex-col gap-3 mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#fdf2f4] flex items-center justify-center shrink-0 border border-[#fce3e7]">
                        <FiFileText className="w-4 h-4 text-[#a31d38]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-900 truncate">{selectedFile.name}</span>
                        <span className="text-[11px] text-emerald-600 font-semibold">Ready to submit</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setUploadedAssetId(null); }}
                      className="text-gray-400 hover:text-rose-600 p-1 shrink-0 cursor-pointer transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#F4B4C0] bg-[#FFF5F7] hover:bg-[#FFEBF0] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FDF2F4] flex items-center justify-center">
                      <FiUpload className="w-5 h-5 text-[#A31D38] stroke-2" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#A31D38]">
                        {isUploading ? "Uploading..." : "Upload Signature"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG or PDF · Max 5MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleClose}
                  disabled={signoffMutation.isPending || isUploading}
                  className="w-full h-11 rounded-xl font-bold border-gray-200 hover:bg-gray-50 text-neutral-primary cursor-pointer text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="md"
                  loading={signoffMutation.isPending || isUploading}
                  onClick={handleSignoff}
                  className="w-full h-11 rounded-xl bg-[#FBAB2A]! hover:bg-[#E89B1F]! text-white! font-bold cursor-pointer text-xs sm:text-sm"
                >
                  Sign & Submit
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
