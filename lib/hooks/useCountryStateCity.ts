"use client";

import { useMemo } from "react";
import { Country, State, City } from "country-state-city";

export interface CountryStateCityOption {
  label: string;
  value: string;
}

/**
 * Hook to derive country → state → city cascading options.
 * All computations are memoised so renders stay cheap.
 *
 * @param countryCode – ISO-2 country code (e.g. "NG"). Pass undefined/empty to
 *   get an empty states list.
 * @param stateCode   – ISO state code (e.g. "LA"). Pass undefined/empty to get
 *   an empty cities list.
 */
export function useCountryStateCity(
  countryCode?: string,
  stateCode?: string,
) {
  const countries = useMemo<CountryStateCityOption[]>(
    () =>
      Country.getAllCountries().map((c) => ({
        label: c.name,
        value: c.isoCode,
      })),
    [],
  );

  const states = useMemo<CountryStateCityOption[]>(() => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode).map((s) => ({
      label: s.name,
      value: s.isoCode,
    }));
  }, [countryCode]);

  const cities = useMemo<CountryStateCityOption[]>(() => {
    if (!countryCode || !stateCode) return [];
    return City.getCitiesOfState(countryCode, stateCode).map((c) => ({
      label: c.name,
      value: c.name,
    }));
  }, [countryCode, stateCode]);

  return { countries, states, cities };
}
