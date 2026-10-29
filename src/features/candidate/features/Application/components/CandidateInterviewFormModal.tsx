"use client";

import React, { useState, useRef } from "react";
import {
  FiX,
  FiCheckCircle,
  FiUpload,
  FiTrash2,
  FiFileText,
  FiCheck,
  FiEdit3,
  FiRefreshCw,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useSignoffInterviewForm } from "@/src/features/shared/applications/hooks";
import { useUploadFile, useResolveAssets } from "@/src/features/shared/storage/hooks";
import {
  useCandidateProfileSignature,
  useSetCandidateProfileSignature,
} from "@/src/features/shared/onboarding/hooks";
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
  const { data: profileSignature, isLoading: isSignatureLoading } =
    useCandidateProfileSignature(isOpen);
  const setProfileSignatureMutation = useSetCandidateProfileSignature();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const signatureAssetsToResolve = React.useMemo(() => {
    return profileSignature?.assetId && !profileSignature.url
      ? [profileSignature.assetId]
      : [];
  }, [profileSignature?.assetId, profileSignature?.url]);

  const { data: resolvedSignatureAssets } = useResolveAssets(signatureAssetsToResolve);

  const savedSignatureUrl =
    profileSignature?.url ||
    (profileSignature?.assetId && resolvedSignatureAssets
      ? resolvedSignatureAssets.find((a) => a.assetId === profileSignature.assetId)?.url
      : null);

  if (!isOpen) return null;

  const isAlreadySigned = Boolean(formRecord?.candidateSignedAt);
  const hasSavedSignature = Boolean(profileSignature?.assetId);
  const isUsingSavedSignature = hasSavedSignature && !selectedFile;
  const canSubmit = isUsingSavedSignature || Boolean(uploadedAssetId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ type: "error", title: "File Too Large", description: "Signature file size must be less than 5MB." });
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
    setIsUploading(true);
    setUploadedAssetId(null);
    try {
      const asset = await uploadMutation.mutateAsync({ file, purpose: "signature" });
      setUploadedAssetId(asset.assetId);
      try {
        await setProfileSignatureMutation.mutateAsync(asset.assetId);
      } catch {
        // Keep form signoff flow unblocked even if default profile update fails
      }
      toast({ type: "success", title: "Signature Ready", description: "Your signature file is ready to append." });
    } catch {
      toast({ type: "error", title: "Upload Failed", description: "Could not upload signature file. Please try again." });
      setSelectedFile(null);
      setUploadedAssetId(null);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} mb`;
    }
    return `${Math.round(bytes / 1024)} kb`;
  };

  const handleSignoff = async () => {
    if (!canSubmit) {
      toast({
        type: "error",
        title: "Signature Required",
        description: "Please upload or append your signature before submitting.",
      });
      return;
    }
    try {
      if (isUsingSavedSignature) {
        await signoffMutation.mutateAsync({
          formType,
          payload: {
            signatureMode: "default",
          },
        });
      } else {
        await signoffMutation.mutateAsync({
          formType,
          payload: {
            signatureMode: "upload",
            signatureAssetId: uploadedAssetId!,
          },
        });
      }
      toast({ type: "success", title: "Signature Appended", description: "You have successfully signed this assessment form." });
      handleClose();
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
          className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full relative shadow-2xl flex flex-col border border-gray-100 max-h-[92vh] overflow-y-auto"
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
            Append Signature
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
              <div className="flex flex-col gap-3 mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                />

                {isSignatureLoading ? (
                  <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center border border-gray-200/80">
                    <span className="w-5 h-5 border-2 border-[#A31D38] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : isUsingSavedSignature ? (
                  <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {savedSignatureUrl ? (
                          <div className="w-20 h-12 rounded-xl bg-white border border-amber-200/80 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                            <img
                              src={savedSignatureUrl}
                              alt="Saved Signature"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <FiEdit3 className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-extrabold text-neutral-primary">
                            Saved Signature Ready
                          </span>
                          <span className="text-[11px] text-[#047857] font-semibold flex items-center gap-1 mt-0.5">
                            <FiCheck className="w-3.5 h-3.5 stroke-3" />
                            Will be appended to this form
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className="text-xs font-bold text-[#A31D38] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <FiRefreshCw className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-200/80">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center shrink-0 border border-[#fce3e7]">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[240px]">
                          {selectedFile.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                          <span>{formatFileSize(selectedFile.size)}</span>
                          <span>•</span>
                          {isUploading ? (
                            <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                              <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                              Uploading...
                            </span>
                          ) : uploadedAssetId ? (
                            <span className="text-[#047857] font-semibold flex items-center gap-1">
                              <FiCheck className="w-3.5 h-3.5 stroke-3 text-[#047857]" />
                              Completed
                            </span>
                          ) : (
                            <span className="text-rose-500 font-semibold">
                              Upload failed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setSelectedFile(null);
                        setUploadedAssetId(null);
                      }}
                      className="text-gray-400 hover:text-rose-600 p-1 shrink-0 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove file"
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
                        Upload Signature
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
                  disabled={isUploading || !canSubmit || signoffMutation.isPending}
                  loading={signoffMutation.isPending}
                  onClick={handleSignoff}
                  className="w-full h-11 rounded-xl bg-[#FBAB2A]! hover:bg-[#E89B1F]! text-white! font-bold cursor-pointer text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Append Signature
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
