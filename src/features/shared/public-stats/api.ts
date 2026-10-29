import axios from "axios";
import { CAP_BASE_URL } from "@/src/lib/api/cap";
import { unwrap, type SuccessEnvelope, type ErrorEnvelope } from "@/src/lib/api/client";
import type { CapPublicStats } from "./types";
import type { LmsPublicStats } from "./lms-types";

export const LMS_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_LMS_API_BASE_URL ||
  process.env.NEXT_PUBLIC_LMS_URL ||
  "https://www.staging-api.elimi-ecosystem.e-limi.africa/v1/lms";

/**
 * Unauthenticated GET /public/stats on CAP.
 * Uses a bare axios request so public pages never trigger auth-redirect
 * interceptors or attach persona headers.
 */
export async function getCapPublicStatsApi(): Promise<CapPublicStats> {
  return unwrap<CapPublicStats>(
    axios.get<SuccessEnvelope<CapPublicStats> | ErrorEnvelope>(
      `${CAP_BASE_URL}/public/stats`,
    ),
  );
}

/**
 * Unauthenticated GET /public/stats on LMS.
 */
export async function getLmsPublicStatsApi(): Promise<LmsPublicStats> {
  return unwrap<LmsPublicStats>(
    axios.get<SuccessEnvelope<LmsPublicStats> | ErrorEnvelope>(
      `${LMS_PUBLIC_BASE_URL}/public/stats`,
    ),
  );
}
