"use client";

import { useMemo } from "react";
import {
  useGetCountries,
  useGetStates,
  useGetLgas,
} from "@/src/features/shared/reference/hooks/useReference";

export interface CountryStateCityOption {
  label: string;
  value: string;
}

export function useCountryStateCity(
  countryInput?: string,
  stateInput?: string,
) {
  const { data: countriesData, isLoading: isLoadingCountries } =
    useGetCountries();

  const resolvedCountryCode = useMemo(() => {
    if (!countryInput) return "";
    const clean = countryInput.trim();
    if (clean.length === 2) return clean.toUpperCase();
    if (clean.toLowerCase() === "nigeria") return "NG";

    if (countriesData && countriesData.length > 0) {
      const found = countriesData.find(
        (c) =>
          c.name.toLowerCase() === clean.toLowerCase() ||
          c.code.toLowerCase() === clean.toLowerCase(),
      );
      if (found) return found.code;
    }

    return clean;
  }, [countryInput, countriesData]);

  const { data: statesData, isLoading: isLoadingStates } =
    useGetStates(resolvedCountryCode);

  const { resolvedStateCode, stateName } = useMemo(() => {
    if (!resolvedCountryCode || !stateInput) {
      return { resolvedStateCode: "", stateName: "" };
    }
    const clean = stateInput.trim();

    if (statesData && statesData.length > 0) {
      const found = statesData.find(
        (s) =>
          s.name.toLowerCase() === clean.toLowerCase() ||
          s.code.toLowerCase() === clean.toLowerCase(),
      );
      if (found) {
        return {
          resolvedStateCode: found.code,
          stateName: found.name,
        };
      }
    }

    if (clean.length === 2) {
      return {
        resolvedStateCode: clean.toUpperCase(),
        stateName: clean,
      };
    }

    return {
      resolvedStateCode: clean,
      stateName: clean,
    };
  }, [resolvedCountryCode, stateInput, statesData]);

  const { data: lgasData, isLoading: isLoadingLgas } = useGetLgas(
    resolvedCountryCode,
    resolvedStateCode,
  );

  const countries = useMemo<CountryStateCityOption[]>(() => {
    if (!countriesData || countriesData.length === 0) return [];
    return countriesData.map((c) => ({
      label: c.name,
      value: c.name,
    }));
  }, [countriesData]);

  const states = useMemo<CountryStateCityOption[]>(() => {
    if (!statesData || statesData.length === 0) return [];
    return statesData.map((s) => ({
      label: s.name,
      value: s.name,
    }));
  }, [statesData]);

  const cities = useMemo<CountryStateCityOption[]>(() => {
    if (!lgasData || lgasData.length === 0) return [];
    return lgasData.map((l) => ({
      label: l.name,
      value: l.name,
    }));
  }, [lgasData]);

  return {
    countries,
    states,
    cities,
    lgas: cities,
    resolvedCountryCode,
    resolvedStateCode,
    isLoading: isLoadingCountries || isLoadingStates || isLoadingLgas,
    isLoadingCountries,
    isLoadingStates,
    isLoadingLgas,
  };
}
