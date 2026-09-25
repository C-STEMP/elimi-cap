import { createApiInstance, unwrap, unwrapEnvelope } from "./client";

export const capClient = createApiInstance(
  process.env.NEXT_PUBLIC_CAP_URL ||
    "https://www.staging-api.elimi-ecosystem.e-limi.africa/v1/cap",
  { isCap: true },
);

export interface CapFetchOptions {
  method: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export async function capFetch<T>(
  url: string,
  config: CapFetchOptions,
): Promise<T> {
  return unwrap<T>(
    capClient.request({
      url,
      method: config.method,
      data: config.data,
      params: config.params,
      headers: config.headers,
    }),
  );
}

// Rows requested per backend page when walking a cursor-paginated list
// (the API accepts limit 1–100; default 20).
const FETCH_ALL_PAGE_SIZE = 100;
// Hard stop so a misbehaving cursor can never loop forever.
const FETCH_ALL_MAX_PAGES = 100;

interface CursorPagination {
  nextCursor?: string | null;
  hasMore?: boolean;
}

function readPagination(meta: unknown): CursorPagination | undefined {
  return (meta as { pagination?: CursorPagination } | undefined)?.pagination;
}

/**
 * GETs every page of a cursor-paginated list endpoint and returns the rows
 * concatenated. The backend caps each response at `limit` rows, so a plain
 * GET silently truncates long lists; tables paginate the full result locally.
 *
 * If the caller passes its own `cursor` or `limit`, only that single page is
 * fetched.
 */
export async function capFetchAll<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T[]> {
  const singlePage = params?.cursor !== undefined || params?.limit !== undefined;
  const rows: T[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  for (let page = 0; page < FETCH_ALL_MAX_PAGES; page++) {
    const envelope = await unwrapEnvelope<T[] | { data: T[]; meta?: unknown }>(
      capClient.request({
        url,
        method: "GET",
        params: singlePage
          ? params
          : { ...params, limit: FETCH_ALL_PAGE_SIZE, ...(cursor ? { cursor } : {}) },
      }),
    );

    const body = envelope.data;
    const pageRows = Array.isArray(body) ? body : body?.data || [];
    rows.push(...pageRows);

    if (singlePage) break;

    const pagination =
      readPagination(envelope.meta) ??
      (Array.isArray(body) ? undefined : readPagination(body?.meta));
    const next = pagination?.nextCursor;
    if (!next || pagination?.hasMore === false || seenCursors.has(next)) break;
    seenCursors.add(next);
    cursor = next;
  }

  return rows;
}
