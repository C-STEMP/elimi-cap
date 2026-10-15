"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { FiCheckCircle, FiUpload, FiRefreshCw, FiEdit3 } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useUploadFile, useResolveAssets } from "@/src/features/shared/storage/hooks";
import {
  useCandidateProfileSignature,
  useSetCandidateProfileSignature,
} from "@/src/features/shared/onboarding/hooks";

export const SignatureSection: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: signatureData, isLoading: isSignatureLoading } =
    useCandidateProfileSignature();
  const setSignatureMutation = useSetCandidateProfileSignature();
  const uploadFileMutation = useUploadFile();

  const assetIdsToResolve = React.useMemo(() => {
    return signatureData?.assetId && !signatureData.url
      ? [signatureData.assetId]
      : [];
  }, [signatureData?.assetId, signatureData?.url]);

  const { data: resolvedAssets } = useResolveAssets(assetIdsToResolve);

  const displayUrl =
    signatureData?.url ||
    (signatureData?.assetId && resolvedAssets
      ? resolvedAssets.find((a) => a.assetId === signatureData.assetId)?.url
      : null);

  const hasSignature = Boolean(displayUrl || signatureData?.assetId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        type: "error",
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, or JPEG).",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        type: "error",
        title: "File Too Large",
        description: "Signature file size must be less than 5MB.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const asset = await uploadFileMutation.mutateAsync({
        file,
        purpose: "signature",
      });

      if (!asset?.assetId) {
        throw new Error("Upload did not return an asset ID.");
      }

      await setSignatureMutation.mutateAsync(asset.assetId);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Upload Failed",
        description:
          err?.message || "Failed to upload signature. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-1">
        <h2 className="text-lg lg:text-2xl font-extrabold text-neutral-primary flex items-center gap-2">
          Digital Signature
        </h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Upload your official signature. This will be automatically applied to your RPL application forms, interview sign-offs, and observation submissions.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-[#F8F9FA] p-5 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Signature thumbnail or placeholder */}
          <div className="w-32 h-20 sm:w-40 sm:h-24 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex items-center justify-center p-2 overflow-hidden shrink-0">
            {isSignatureLoading ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : hasSignature && displayUrl ? (
              <Image
                src={displayUrl}
                alt="Candidate Signature"
                width={160}
                height={96}
                className="max-h-full max-w-full object-contain"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-gray-400">
                <FiEdit3 className="w-6 h-6 stroke-[1.5]" />
                <span className="text-[10px] font-semibold text-gray-400">
                  No Signature
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-neutral-primary">
                {hasSignature ? "Signature Active" : "No Signature Uploaded"}
              </span>
              {hasSignature && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FiCheckCircle className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {hasSignature
                ? "Your default signature is stored and ready to be used on applications."
                : "Upload a photo or scanned copy of your signature on a clean white background."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={isUploading}
            disabled={isUploading}
            className="bg-[#fbab2a]! hover:bg-[#e89b1f]! text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs shadow-xs cursor-pointer transition-all"
          >
            {hasSignature ? (
              <>
                <FiRefreshCw className={`w-3.5 h-3.5 ${isUploading ? "animate-spin" : ""}`} />
                <span>Replace Signature</span>
              </>
            ) : (
              <>
                <FiUpload className="w-3.5 h-3.5" />
                <span>Upload Signature</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
