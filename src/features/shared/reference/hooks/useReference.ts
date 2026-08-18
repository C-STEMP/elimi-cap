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

/**
 * Composite hook grouping Reference / Catalogue data operations
 */
export function useReference() {
  const sectors = useGetSectors();
  const centres = useGetCentres();
  const awardingBodies = useGetAwardingBodies();
  const thirdPartyTemplate = useGetThirdPartyReportTemplate();

  return {
    sectors,
    centres,
    awardingBodies,
    thirdPartyTemplate,
  };
}
