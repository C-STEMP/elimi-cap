"use client";

import { useMemo } from "react";
import { Country, State, City } from "country-state-city";

export interface CountryStateCityOption {
  label: string;
  value: string;
}

const NIGERIA_LGAS: Record<string, string[]> = {
  Lagos: [
    "Ikeja", "Alimosho", "Ajeromi-Ifelodun", "Kosofe", "Mushin", "Oshodi-Isolo",
    "Ojo", "Ikorodu", "Surulere", "Agege", "Ifako-Ijaiye", "Somolu",
    "Amuwo-Odofin", "Lagos Mainland", "Eti-Osa", "Badagry", "Apapa",
    "Lagos Island", "Epe", "Ibeju-Lekki"
  ],
  "Federal Capital Territory": [
    "Abuja Municipal (AMAC)", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji"
  ],
  Abuja: [
    "Abuja Municipal (AMAC)", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji"
  ],
  Rivers: [
    "Port Harcourt", "Obio-Akpor", "Eleme", "Ikwerre", "Oyigbo", "Okrika",
    "Degema", "Bonny", "Ahoada East", "Ahoada West", "Gokana", "Khana"
  ],
  Oyo: [
    "Ibadan North", "Ibadan South-West", "Ibadan North-East", "Ibadan South-East",
    "Ibadan North-West", "Oyo East", "Oyo West", "Ogbomoso North", "Ogbomoso South",
    "Egbeda", "Oluyole", "Akinyele", "Ido", "Lagelu"
  ],
  Kano: [
    "Kano Municipal", "Fagge", "Dala", "Gwale", "Tarauni", "Nasarawa",
    "Kumbotso", "Ungogo", "Dawakin Kudu", "Gwarzo"
  ],
  Enugu: [
    "Enugu North", "Enugu South", "Enugu East", "Nsukka", "Udi", "Ezeagu",
    "Oji River", "Awgu", "Igbo-Eze North", "Igbo-Eze South"
  ],
  Ogun: [
    "Abeokuta South", "Abeokuta North", "Ado-Odo/Ota", "Ifo", "Ijebu Ode",
    "Sagamu", "Obafemi Owode", "Odeda"
  ],
  Delta: [
    "Warri South", "Warri North", "Warri South West", "Uvwie", "Sapele",
    "Ughelli North", "Ughelli South", "Oshimili South (Asaba)"
  ],
  Kaduna: [
    "Kaduna North", "Kaduna South", "Chikun", "Igabi", "Zaria", "Sabon Gari"
  ],
  Edo: [
    "Oredo (Benin City)", "Ikpoba-Okha", "Egor", "Ovia North-East", "Esan West"
  ],
  Anambra: [
    "Awka South", "Awka North", "Onitsha North", "Onitsha South", "Nnewi North"
  ]
};

/**
 * Hook to derive country → state → city/LGA cascading options.
 * Resolves both country ISO codes ("NG") and Country Names ("Nigeria").
 * Resolves both state ISO codes ("LA") and State Names ("Lagos").
 */
// Module-level static cache to avoid parsing country data repeatedly
const ALL_COUNTRIES_CACHE = Country.getAllCountries();
const COUNTRY_OPTIONS_CACHE: CountryStateCityOption[] = ALL_COUNTRIES_CACHE.map((c) => ({
  label: c.name,
  value: c.name,
}));

export function useCountryStateCity(
  countryInput?: string,
  stateInput?: string,
) {
  const countries = COUNTRY_OPTIONS_CACHE;

  // Resolve Country ISO code from name or ISO
  const resolvedCountryCode = useMemo(() => {
    if (!countryInput) return "";
    const clean = countryInput.trim();
    if (clean.length === 2) return clean.toUpperCase();
    const found = ALL_COUNTRIES_CACHE.find(
      (c) =>
        c.name.toLowerCase() === clean.toLowerCase() ||
        c.isoCode.toLowerCase() === clean.toLowerCase()
    );
    return found ? found.isoCode : clean;
  }, [countryInput]);

  // Derive States immediately for resolved country
  const states = useMemo<CountryStateCityOption[]>(() => {
    if (!resolvedCountryCode) return [];
    const rawStates = State.getStatesOfCountry(resolvedCountryCode);
    return rawStates.map((s) => ({
      label: s.name,
      value: s.name,
    }));
  }, [resolvedCountryCode]);

  // Resolve State ISO code or Name
  const { resolvedStateCode, stateName } = useMemo(() => {
    if (!resolvedCountryCode || !stateInput) return { resolvedStateCode: "", stateName: "" };
    const clean = stateInput.trim();
    const rawStates = State.getStatesOfCountry(resolvedCountryCode);
    const found = rawStates.find(
      (s) =>
        s.name.toLowerCase() === clean.toLowerCase() ||
        s.isoCode.toLowerCase() === clean.toLowerCase()
    );
    return {
      resolvedStateCode: found ? found.isoCode : clean,
      stateName: found ? found.name : clean,
    };
  }, [resolvedCountryCode, stateInput]);

  // Derive Cities/LGAs immediately for resolved state
  const cities = useMemo<CountryStateCityOption[]>(() => {
    if (!resolvedCountryCode || (!resolvedStateCode && !stateName)) return [];

    let cityList: CountryStateCityOption[] = [];

    if (resolvedStateCode) {
      const rawCities = City.getCitiesOfState(resolvedCountryCode, resolvedStateCode);
      if (rawCities && rawCities.length > 0) {
        cityList = rawCities.map((c) => ({
          label: c.name,
          value: c.name,
        }));
      }
    }

    // Check Nigeria local LGAs map if list is empty or for extra precision
    if (stateName && NIGERIA_LGAS[stateName]) {
      const lgas = NIGERIA_LGAS[stateName].map((lga) => ({
        label: lga,
        value: lga,
      }));
      // Merge unique
      const existingNames = new Set(cityList.map((c) => c.label.toLowerCase()));
      lgas.forEach((lga) => {
        if (!existingNames.has(lga.label.toLowerCase())) {
          cityList.push(lga);
        }
      });
    }

    return cityList;
  }, [resolvedCountryCode, resolvedStateCode, stateName]);

  return { countries, states, cities, resolvedCountryCode, resolvedStateCode };
}
