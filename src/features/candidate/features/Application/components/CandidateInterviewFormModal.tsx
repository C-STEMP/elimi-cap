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
  candidateName = "",
}) => {
  const { toast } = useToast();
  const signoffMutation = useSignoffInterviewForm(applicationId);
  const uploadMutation = useUploadFile();

  const [signatureMode, setSignatureMode] = useState<"typed" | "default" | "upload">("default");
  const [typedName, setTypedName] = useState(candidateName);
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
      toast({
        type: "error",
        title: "File Too Large",
        description: "Signature file size must be less than 5MB.",
      });
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    try {
      const asset = await uploadMutation.mutateAsync({
        file,
        purpose: "signature",
      });
      setUploadedAssetId(asset.assetId);
      toast({
        type: "success",
        title: "Signature Uploaded",
        description: "Your signature file is ready to append.",
      });
    } catch {
      toast({
        type: "error",
        title: "Upload Failed",
        description: "Could not upload signature file. Please try again.",
      });
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignoff = async () => {
    if (signatureMode === "typed" && !typedName.trim()) {
      toast({
        type: "error",
        title: "Typed Name Required",
        description: "Please enter your full name as signature.",
      });
      return;
    }

    if (signatureMode === "upload" && !uploadedAssetId) {
      toast({
        type: "error",
        title: "Upload Required",
        description: "Please upload your signature file before submitting.",
      });
      return;
    }

    try {
      await signoffMutation.mutateAsync({
        formType,
        payload: {
          signatureMode,
          typedName: signatureMode === "typed" ? typedName.trim() : undefined,
          signatureAssetId: signatureMode === "upload" ? uploadedAssetId || undefined : undefined,
        },
      });
      toast({
        type: "success",
        title: "Form Signed",
        description: "You have successfully signed and confirmed this assessment form.",
      });
      onClose();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Signoff Failed",
        description: err?.message || "Failed to sign assessment form.",
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full relative shadow-2xl flex flex-col border border-gray-100 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FDF2F4] text-[#A31D38] hover:bg-[#FCE3E7] flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4 stroke-[2.5]" />
          </button>

          <h3 className="text-[#1A1A1A] font-extrabold text-xl text-center mt-1 mb-1 tracking-tight">
            {formTitle}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm text-center leading-relaxed mb-6 font-normal">
            Review the assessor evaluation notes and sign off on this assessment record.
          </p>

          {/* Form Assessment Status */}
          <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 mb-6 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Assessor Review:</span>
              <span className="text-xs font-bold text-[#1E7F4C] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {formRecord?.assessorSignedAt ? "Signed by Assessor" : "Evaluated"}
              </span>
            </div>
            {formRecord?.data && Object.keys(formRecord.data).length > 0 ? (
              <div className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200/70 max-h-36 overflow-y-auto">
                <span className="font-semibold block mb-1">Evaluation Details:</span>
                <p className="whitespace-pre-line text-gray-600">
                  {typeof (formRecord.data as any)?.summary === "string"
                    ? (formRecord.data as any).summary
                    : "Form findings and competency notes recorded by panel assessor."}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic bg-white p-3 rounded-xl border border-gray-200/70">
                Evaluation recorded and ready for candidate endorsement.
              </p>
            )}
          </div>

          {isAlreadySigned ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center flex flex-col items-center gap-2">
              <FiCheckCircle className="w-8 h-8 text-emerald-600" />
              <p className="text-sm font-bold text-emerald-900">Form Already Endorsed</p>
              <p className="text-xs text-emerald-700">
                You signed this form on{" "}
                {formRecord?.candidateSignedAt
                  ? new Date(formRecord.candidateSignedAt).toLocaleDateString()
                  : "record"}
                .
              </p>
            </div>
          ) : (
            <>
              {/* Signature Mode Selector */}
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-bold text-gray-700">
                  Select Signature Mode:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignatureMode("default")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      signatureMode === "default"
                        ? "bg-[#A31D38] text-white border-[#A31D38] shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode("typed")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      signatureMode === "typed"
                        ? "bg-[#A31D38] text-white border-[#A31D38] shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Type Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode("upload")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      signatureMode === "upload"
                        ? "bg-[#A31D38] text-white border-[#A31D38] shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {/* Mode Specific Inputs */}
              {signatureMode === "default" && (
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed mb-6">
                  Sign with your registered profile signature as recorded in your profile.
                </div>
              )}

              {signatureMode === "typed" && (
                <div className="flex flex-col gap-1.5 mb-6">
                  <label className="text-xs font-medium text-gray-700">
                    Type Your Full Name:
                  </label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] italic font-serif"
                  />
                </div>
              )}

              {signatureMode === "upload" && (
                <div className="flex flex-col gap-2 mb-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-900 truncate">
                        <FiFileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{selectedFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadedAssetId(null);
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-2 border-dashed border-gray-300 hover:border-[#FBAB2A] bg-gray-50 rounded-2xl p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <FiUpload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-semibold text-gray-700">
                        {isUploading ? "Uploading..." : "Click to select signature image"}
                      </span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={signoffMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  loading={signoffMutation.isPending}
                  onClick={handleSignoff}
                  className="bg-[#FBAB2A]! hover:bg-[#E89B1F]! text-white! font-bold"
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
