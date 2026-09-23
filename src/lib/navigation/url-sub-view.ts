import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;
type Params = { toString(): string };

// URL a sub-view (e.g. `?unit=`) was opened from in-app, so leaving it can
// return to that exact history entry instead of stacking a new one.
let openedFrom: string | null = null;

function buildUrl(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Opens a sub-view by setting `param` in the URL (adds a history entry). */
export function openUrlSubView(
  router: Router,
  pathname: string,
  searchParams: Params,
  value: string,
  param = "unit",
) {
  const params = new URLSearchParams(searchParams.toString());
  if (!params.has(param)) openedFrom = buildUrl(pathname, params);
  params.set(param, value);
  router.push(buildUrl(pathname, params), { scroll: false });
}

/**
 * Leaves a sub-view: goes back to the exact entry it was opened from when
 * that happened in-app, otherwise (e.g. the URL was opened directly or the
 * page reloaded) just drops `param` from the URL without leaving the page.
 */
export function closeUrlSubView(
  router: Router,
  pathname: string,
  searchParams: Params,
  param = "unit",
) {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(param);
  const target = buildUrl(pathname, params);
  if (openedFrom === target) {
    openedFrom = null;
    router.back();
  } else {
    openedFrom = null;
    router.replace(target, { scroll: false });
  }
}
