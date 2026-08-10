import { capFetch } from "@/src/lib/api/cap";

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

export async function getSectorsApi(): Promise<Sector[]> {
  return capFetch<Sector[]>("/admin/sectors", {
    method: "GET",
  });
}

export async function getTradesBySectorApi(sectorId: string): Promise<Trade[]> {
  return capFetch<Trade[]>(`/admin/sectors/${sectorId}/trades`, {
    method: "GET",
  });
}

export async function getCentresApi(status?: string): Promise<Centre[]> {
  const query = status ? `?status=${status}` : "";
  try {
    return await capFetch<Centre[]>(`/admin/centres${query}`, {
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

export async function getThirdPartyReportTemplateApi(): Promise<ThirdPartyReportTemplate> {
  return capFetch<ThirdPartyReportTemplate>(
    "/evidence/third-party-report-template",
    {
      method: "GET",
    },
  );
}
