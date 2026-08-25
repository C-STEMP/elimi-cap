import { useQuery } from "@tanstack/react-query";
import {
  getSectorsApi,
  getTradesBySectorApi,
  getTradeDetailApi,
  getUnitsByTradeApi,
  getEvidenceTypesByTradeApi,
  getCentresApi,
  getAwardingBodiesApi,
  getThirdPartyReportTemplateApi,
  getBanksApi,
  getCountriesApi,
  getStatesApi,
  getLgasApi,
} from "../api/reference.api";

export const REFERENCE_QUERY_KEYS = {
  sectors: ["catalogue", "sectors"] as const,
  trades: (sectorId: string) => ["catalogue", "trades", sectorId] as const,
  tradeDetail: (tradeId: string) => ["catalogue", "trade", tradeId] as const,
  units: (tradeId: string, level?: number) =>
    ["catalogue", "units", tradeId, level] as const,
  evidenceTypes: (tradeId: string) =>
    ["catalogue", "evidence-types", tradeId] as const,
  centres: (params?: { cursor?: string; limit?: number }) =>
    ["catalogue", "centres", params] as const,
  awardingBodies: ["reference", "awarding-bodies"] as const,
  template: ["reference", "third-party-template"] as const,
  banks: (country?: string) => ["reference", "banks", country] as const,
  countries: ["address", "countries"] as const,
  states: (country?: string) => ["address", "states", country] as const,
  lgas: (country?: string, state?: string) =>
    ["address", "lgas", country, state] as const,
};

export function useGetSectors() {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.sectors,
    queryFn: () => getSectorsApi(),
  });
}

export function useGetTradesBySector(sectorId: string) {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.trades(sectorId),
    queryFn: () => getTradesBySectorApi(sectorId),
    enabled: Boolean(sectorId),
  });
}

export function useGetTradeDetail(tradeId: string) {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.tradeDetail(tradeId),
    queryFn: () => getTradeDetailApi(tradeId),
    enabled: Boolean(tradeId),
  });
}

export function useGetUnitsByTrade(tradeId: string, level?: number) {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.units(tradeId, level),
    queryFn: () => getUnitsByTradeApi(tradeId, level),
    enabled: Boolean(tradeId),
  });
}

export function useGetEvidenceTypesByTrade(tradeId: string) {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.evidenceTypes(tradeId),
    queryFn: () => getEvidenceTypesByTradeApi(tradeId),
    enabled: Boolean(tradeId),
  });
}

export function useGetCentres(params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.centres(params),
    queryFn: () => getCentresApi(params),
  });
}

export function useGetAwardingBodies() {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.awardingBodies,
    queryFn: () => getAwardingBodiesApi(),
  });
}

export function useGetThirdPartyReportTemplate() {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.template,
    queryFn: () => getThirdPartyReportTemplateApi(),
  });
}

export function useGetBanks(country: string = "nigeria") {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.banks(country),
    queryFn: () => getBanksApi(country),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours caching per API spec
  });
}

export function useGetCountries() {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.countries,
    queryFn: () => getCountriesApi(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours caching per API spec
  });
}

export function useGetStates(country?: string) {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.states(country),
    queryFn: () => getStatesApi(country!),
    enabled: Boolean(country),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useGetLgas(country?: string, state?: string) {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.lgas(country, state),
    queryFn: () => getLgasApi(country!, state!),
    enabled: Boolean(country && state),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Composite hook grouping Reference / Catalogue data operations
 */
export function useReference(country: string = "nigeria") {
  const sectors = useGetSectors();
  const centres = useGetCentres();
  const awardingBodies = useGetAwardingBodies();
  const thirdPartyTemplate = useGetThirdPartyReportTemplate();
  const banks = useGetBanks(country);
  const countries = useGetCountries();

  return {
    sectors,
    centres,
    awardingBodies,
    thirdPartyTemplate,
    banks,
    countries,
  };
}
