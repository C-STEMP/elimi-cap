"use client";

import { useMemo } from "react";
import { useAssessorProfileSignature } from "@/src/features/shared/assessor/hooks";
import { useResolveAssets } from "@/src/features/shared/storage/hooks";

export interface AssessorSignatureState {
  signatureAssetId: string | null;
  signatureUrl: string | null;
  hasSignature: boolean;
  isLoading: boolean;
}

/**
 * Hook providing the assessor's default profile digital signature (if configured).
 * Sourced directly from GET /assessor/profile/signature with asset resolution.
 */
export function useAssessorSignature(): AssessorSignatureState {
  const { data: signatureData, isLoading: isSignatureLoading } =
    useAssessorProfileSignature();

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

  return {
    signatureAssetId: signatureData?.assetId || null,
    signatureUrl,
    hasSignature,
    isLoading: isSignatureLoading || isResolving,
  };
}
