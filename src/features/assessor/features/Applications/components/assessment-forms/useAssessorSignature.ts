"use client";

import { useMemo, useCallback } from "react";
import {
  useAssessorProfileSignature,
  useSetAssessorProfileSignature,
} from "@/src/features/shared/assessor/hooks";
import {
  useUploadFile,
  useResolveAssets,
} from "@/src/features/shared/storage/hooks";
import { useToast } from "@/src/components/ui/toast";

export interface AssessorSignatureState {
  signatureAssetId: string | null;
  signatureUrl: string | null;
  hasSignature: boolean;
  isLoading: boolean;
  saveSignature: (file: File) => Promise<{ assetId: string; url?: string }>;
}

/**
 * Live hook managing the assessor's digital signature.
 * Sourced directly from GET /assessor/profile/signature and updated via
 * PUT /assessor/profile/signature with file storage asset resolution.
 */
export function useAssessorSignature(): AssessorSignatureState {
  const { toast } = useToast();
  const { data: signatureData, isLoading: isSignatureLoading } =
    useAssessorProfileSignature();
  const setSignatureMutation = useSetAssessorProfileSignature();
  const uploadFileMutation = useUploadFile();

  const assetIdsToResolve = useMemo(() => {
    return signatureData?.assetId && !signatureData.url
      ? [signatureData.assetId]
      : [];
  }, [signatureData?.assetId, signatureData?.url]);

  const { data: resolvedAssets, isLoading: isResolving } =
    useResolveAssets(assetIdsToResolve);

  const signatureUrl = useMemo(() => {
    if (signatureData?.url) return signatureData.url;
    if (signatureData?.assetId && resolvedAssets?.length) {
      const match = resolvedAssets.find(
        (a) => a.assetId === signatureData.assetId,
      );
      if (match?.url) return match.url;
    }
    return null;
  }, [signatureData?.url, signatureData?.assetId, resolvedAssets]);

  const hasSignature = Boolean(signatureUrl || signatureData?.assetId);

  const saveSignature = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        const msg = "Please upload an image file (PNG, JPG, or WEBP).";
        toast({ type: "error", title: "Invalid File Type", description: msg });
        throw new Error(msg);
      }

      if (file.size > 5 * 1024 * 1024) {
        const msg = "Signature file size must be less than 5MB.";
        toast({ type: "error", title: "File Too Large", description: msg });
        throw new Error(msg);
      }

      const asset = await uploadFileMutation.mutateAsync({
        file,
        purpose: "signature",
      });

      if (!asset?.assetId) {
        const msg = "File upload did not return an asset ID.";
        toast({ type: "error", title: "Upload Failed", description: msg });
        throw new Error(msg);
      }

      await setSignatureMutation.mutateAsync({
        assetId: asset.assetId,
        url: asset.url,
      });

      return {
        assetId: asset.assetId,
        url: asset.url,
      };
    },
    [uploadFileMutation, setSignatureMutation, toast],
  );

  return {
    signatureAssetId: signatureData?.assetId || null,
    signatureUrl,
    hasSignature,
    isLoading: isSignatureLoading || isResolving,
    saveSignature,
  };
}
