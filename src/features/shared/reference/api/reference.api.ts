import { capFetch } from "@/src/lib/api/cap";
import { orchestratorFetch } from "@/src/lib/api/orchestrator";

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  type: string;
  currency: string;
  country: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface State {
  code: string;
  name: string;
  countryCode: string;
}

export interface Lga {
  name: string;
  stateCode: string;
  countryCode: string;
}

export interface Sector {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface Trade {
  id: string;
  sectorId: string;
  slug: string;
  name: string;
  description?: string;
}

export interface Unit {
  id: string;
  referenceNumber: string;
  title: string;
  isMandatory: boolean;
  creditValue?: number;
  guidedLearningHours?: number;
  purpose?: string;
  assessmentMethods?: string[];
  structure?: Record<string, unknown>;
}

export interface QualificationLevel {
  id: string;
  level: number;
  slug?: string;
  purpose: string;
  units?: Unit[];
}

export interface NosDocument {
  id: string;
  tradeId: string;
  version: number;
  title: string;
  status: "active" | "superseded";
  qualificationLevels?: QualificationLevel[];
}

export interface TradeDetail extends Trade {
  activeNosDocument?: NosDocument;
}

export interface Centre {
  id: string;
  name: string;
  registrationNo: string;
  logoAssetId?: string | null;
  status: "pending" | "approved" | "suspended" | "rejected";
}

export interface AwardingBody {
  id: string;
  name: string;
  registrationNo: string;
  logoAssetId?: string | null;
}

export interface ThirdPartyReportTemplate {
  assetId: string;
  url: string;
}

/**
 * Catalogue: List sectors for application draft
 */
export async function getSectorsApi(): Promise<Sector[]> {
  return capFetch<Sector[]>("/sectors", {
    method: "GET",
  });
}

/**
 * Catalogue: List trades under a sector for application draft
 */
export async function getTradesBySectorApi(sectorId: string): Promise<Trade[]> {
  return capFetch<Trade[]>(`/sectors/${sectorId}/trades`, {
    method: "GET",
  });
}

/**
 * Catalogue: Get a trade with its single active NOS document
 */
export async function getTradeDetailApi(tradeId: string): Promise<TradeDetail> {
  return capFetch<TradeDetail>(`/trades/${tradeId}`, {
    method: "GET",
  });
}

/**
 * Catalogue: List units from the trade's active NOS
 */
export async function getUnitsByTradeApi(
  tradeId: string,
  level?: number,
): Promise<Unit[]> {
  const query = level ? `?level=${level}` : "";
  return capFetch<Unit[]>(`/trades/${tradeId}/units${query}`, {
    method: "GET",
  });
}

/**
 * Catalogue: Distinct evidence types allowed for this trade
 */
export async function getEvidenceTypesByTradeApi(
  tradeId: string,
): Promise<string[]> {
  return capFetch<string[]>(`/trades/${tradeId}/evidence-types`, {
    method: "GET",
  });
}

/**
 * Catalogue: List approved centres for application draft
 */
export async function getCentresApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<Centre[]> {
  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.set("cursor", params.cursor);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";

  try {
    const res = await capFetch<Centre[] | { data: Centre[]; meta?: unknown }>(`/centres${query}`, {
      method: "GET",
    });
    return Array.isArray(res) ? res : (res as any)?.data || [];
  } catch (error: any) {
    if (
      error?.status === 404 ||
      error?.code === "http.not_found" ||
      error?.message?.toLowerCase().includes("not found")
    ) {
      return [];
    }
    throw error;
  }
}

/**
 * Admin: List awarding bodies
 */
export async function getAwardingBodiesApi(): Promise<AwardingBody[]> {
  try {
    return await capFetch<AwardingBody[]>("/admin/awarding-bodies", {
      method: "GET",
    });
  } catch (error: any) {
    if (
      error?.status === 404 ||
      error?.code === "http.not_found" ||
      error?.message?.toLowerCase().includes("not found")
    ) {
      return [];
    }
    throw error;
  }
}

/**
 * Static asset: Blank third-party report template
 */
export async function getThirdPartyReportTemplateApi(): Promise<ThirdPartyReportTemplate> {
  return capFetch<ThirdPartyReportTemplate>(
    "/evidence/third-party-report-template",
    {
      method: "GET",
    },
  );
}

/**
 * Orchestrator: List supported banks for payouts
 */
export async function getBanksApi(country: string = "nigeria"): Promise<Bank[]> {
  try {
    const data = await orchestratorFetch<Bank[]>("/banks", {
      method: "GET",
      params: { country: country.toLowerCase() },
    });
    return data || [];
  } catch (error: any) {
    if (
      error?.status === 404 ||
      error?.code === "http.not_found" ||
      error?.message?.toLowerCase().includes("not found")
    ) {
      return [];
    }
    console.error("Failed to fetch banks from orchestrator:", error);
    return [];
  }
}

/**
 * Orchestrator: List countries
 */
export async function getCountriesApi(): Promise<Country[]> {
  try {
    const data = await orchestratorFetch<Country[]>("/address/countries", {
      method: "GET",
    });
    return data || [];
  } catch (error: any) {
    if (
      error?.status === 404 ||
      error?.code === "http.not_found" ||
      error?.message?.toLowerCase().includes("not found")
    ) {
      return [];
    }
    console.error("Failed to fetch countries from orchestrator:", error);
    return [];
  }
}

/**
 * Orchestrator: List states for a country
 */
export async function getStatesApi(country: string): Promise<State[]> {
  if (!country) return [];
  try {
    const data = await orchestratorFetch<State[]>("/address/states", {
      method: "GET",
      params: { country },
    });
    return data || [];
  } catch (error: any) {
    if (
      error?.status === 404 ||
      error?.code === "http.not_found" ||
      error?.message?.toLowerCase().includes("not found")
    ) {
      return [];
    }
    console.error("Failed to fetch states from orchestrator:", error);
    return [];
  }
}

/**
 * Orchestrator: List 3rd-level admin units (LGAs / ADM2) for a country + state
 */
export async function getLgasApi(
  country: string,
  state: string,
): Promise<Lga[]> {
  if (!country || !state) return [];
  try {
    const data = await orchestratorFetch<Lga[]>("/address/lgas", {
      method: "GET",
      params: { country, state },
    });
    return data || [];
  } catch (error: any) {
    if (
      error?.status === 404 ||
      error?.code === "http.not_found" ||
      error?.message?.toLowerCase().includes("not found")
    ) {
      return [];
    }
    console.error("Failed to fetch LGAs from orchestrator:", error);
    return [];
  }
}

