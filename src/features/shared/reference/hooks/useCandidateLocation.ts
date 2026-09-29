"use client";

import { useAppSelector } from "@/src/store/hooks";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import type { GetCentresParams } from "../api/reference.api";

/**
 * Derives candidate/user residential location (country, state, LGA)
 * from active onboarding draft or authenticated profile.
 * Used for address-boost sorting of catalogue centres.
 */
export function useCandidateLocation(): GetCentresParams {
  const onboardingInfo = useAppSelector(
    (state) => (state as any).onboarding?.personalInfo,
  );
  const { data: meProfile } = useGetMeProfile();

  const country =
    onboardingInfo?.country ||
    meProfile?.residentialAddress?.country ||
    undefined;

  const state =
    onboardingInfo?.state ||
    meProfile?.residentialAddress?.state ||
    undefined;

  const lga =
    onboardingInfo?.lga ||
    meProfile?.residentialAddress?.lga ||
    undefined;

  return { country, state, lga };
}

export const useUserLocation = useCandidateLocation;
