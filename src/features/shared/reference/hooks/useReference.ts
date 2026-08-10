import { useQuery } from "@tanstack/react-query";
import {
  getSectorsApi,
  getTradesBySectorApi,
  getCentresApi,
  getAwardingBodiesApi,
  getThirdPartyReportTemplateApi,
} from "../api/reference.api";

export const REFERENCE_QUERY_KEYS = {
  sectors: ["reference", "sectors"] as const,
  trades: (sectorId: string) => ["reference", "trades", sectorId] as const,
  centres: (status?: string) => ["reference", "centres", status] as const,
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

export function useGetCentres(status?: string) {
  return useQuery({
    queryKey: REFERENCE_QUERY_KEYS.centres(status),
    queryFn: () => getCentresApi(status),
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
 * Composite hook grouping Reference / Config data operations
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
