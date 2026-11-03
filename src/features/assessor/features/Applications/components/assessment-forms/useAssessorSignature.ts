"use client";

import { useMemo } from "react";
import { useAssessorProfileSignature } from "@/src/features/shared/assessor/hooks";
import { useResolveAssets } from "@/src/features/shared/storage/hooks";
import { useAppSelector } from "@/src/store/hooks";

export interface AssessorSignatureState {
  signatureAssetId: string | null;
  signatureUrl: string | null;
  hasSignature: boolean;
  isLoading: boolean;
}

/**
 * Hook providing the assessor's default profile digital signature (if configured).
 * Guarded so candidates never call assessor profile endpoints.
 */
export function useAssessorSignature(options?: { enabled?: boolean }): AssessorSignatureState {
  const user = useAppSelector((state) => state.auth.user);
  const isCandidate = Boolean(user?.role?.toLowerCase() === "candidate");
  const isAssessor = Boolean(
    user?.role?.toLowerCase()?.includes("assessor") ||
    user?.role?.toLowerCase()?.includes("centre") ||
    user?.role?.toLowerCase()?.includes("center") ||
    user?.role?.toLowerCase()?.includes("facilitator") ||
    user?.role?.toLowerCase()?.includes("admin")
  );
  const isEnabled = (options?.enabled ?? isAssessor) && !isCandidate;

  const { data: signatureData, isLoading: isSignatureLoading } =
    useAssessorProfileSignature(isEnabled);

  const assetIdsToResolve = useMemo(() => {
    return isEnabled && signatureData?.assetId && !signatureData.url
      ? [signatureData.assetId]
      : [];
  }, [isEnabled, signatureData?.assetId, signatureData?.url]);

  const { data: resolvedAssets, isLoading: isResolving } =
    useResolveAssets(assetIdsToResolve);

  const signatureUrl = useMemo(() => {
    if (!isEnabled) return null;
    if (signatureData?.url) return signatureData.url;
    if (signatureData?.assetId && resolvedAssets?.length) {
      const match = resolvedAssets.find(
        (a) => a.assetId === signatureData.assetId,
      );
      if (match?.url) return match.url;
    }
    return null;
  }, [isEnabled, signatureData?.url, signatureData?.assetId, resolvedAssets]);

  const hasSignature = Boolean(signatureUrl || signatureData?.assetId);

  return {
    signatureAssetId: isEnabled ? signatureData?.assetId || null : null,
    signatureUrl,
    hasSignature: isEnabled && hasSignature,
    isLoading: isEnabled && (isSignatureLoading || isResolving),
  };
}
