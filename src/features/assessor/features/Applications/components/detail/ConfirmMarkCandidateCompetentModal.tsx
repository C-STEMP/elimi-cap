"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { FiCheckCircle, FiUpload } from "react-icons/fi";
import { ASSETS_URL } from "@/src/assets";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import {
  useAssessorProfileSignature,
  useSetAssessorProfileSignature,
} from "@/src/features/shared/assessor/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";

interface ConfirmMarkCandidateCompetentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureAssetId?: string) => void;
  isLoading?: boolean;
  isLead?: boolean;
}

export const ConfirmMarkCandidateCompetentModal: React.FC<
  ConfirmMarkCandidateCompetentModalProps
> = ({ isOpen, onClose, onConfirm, isLoading = false, isLead = true }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profileSig } = useAssessorProfileSignature(isOpen);
  const setProfileSig = useSetAssessorProfileSignature();
  const uploadFile = useUploadFile();

  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isUploadingSig, setIsUploadingSig] = useState(false);

  if (!isOpen) return null;

  const activeSignatureAssetId = uploadedAssetId || profileSig?.assetId || "";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploadingSig(true);
    try {
      const asset = await uploadFile.mutateAsync({
        file,
        purpose: "signature",
      });
      if (!asset?.assetId) {
        throw new Error("Signature upload did not return an asset ID.");
      }
      setUploadedAssetId(asset.assetId);
      setUploadedFileName(file.name);
      await setProfileSig.mutateAsync({
        assetId: asset.assetId,
        url: asset.url,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Signature Upload Failed",
        description: err?.message || "Could not upload signature file.",
      });
    } finally {
      setIsUploadingSig(false);
    }
  };

  const handleConfirmClick = () => {
    if (!activeSignatureAssetId) {
      toast({
        type: "error",
        title: "Signature Required",
        description:
          "Please upload your official assessor signature to sign off on this evaluation.",
      });
      return;
    }
    onConfirm(activeSignatureAssetId);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
        <div className="w-24 h-24 mb-4 flex items-center justify-center">
          <Image
            src={ASSETS_URL.validationWarningIcon}
            alt="Warning"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-1">
          {isLead ? "Are You sure?" : "Sign Off Interview"}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary font-normal mb-4">
          {isLead
            ? "Confirm you want to mark as competent"
            : "Confirm you want to submit your evaluation and sign off on this interview"}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 mb-5 flex items-center justify-between gap-2 text-left">
          <div className="flex items-center gap-2 min-w-0">
            {activeSignatureAssetId ? (
              <FiCheckCircle className="w-4 h-4 text-[#1E7F4C] shrink-0" />
            ) : (
              <FiUpload className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="text-xs font-semibold text-neutral-primary truncate">
              {uploadedFileName
                ? `Signature: ${uploadedFileName}`
                : profileSig?.assetId
                  ? "Using saved profile signature"
                  : "Assessor signature required"}
            </span>
          </div>
          <button
            type="button"
            disabled={isUploadingSig || isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-[#8A1538] hover:underline shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isUploadingSig
              ? "Uploading..."
              : activeSignatureAssetId
                ? "Change"
                : "Upload"}
          </button>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            type="button"
            onClick={handleConfirmClick}
            loading={isLoading || isUploadingSig}
            disabled={isLoading || isUploadingSig}
            variant="amber"
            fullWidth
            className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all"
          >
            {isLoading
              ? "Submitting..."
              : isLead
              ? "Yes, Mark As Competent"
              : "Yes, Sign Off Interview"}
          </Button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isUploadingSig}
            className="h-12 w-full border border-[#FBAB2A] text-[#FBAB2A] hover:bg-orange-50/60 font-bold text-sm sm:text-base rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};
