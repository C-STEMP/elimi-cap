import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;
type Params = { toString(): string };

let openedFrom: string | null = null;

function buildUrl(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

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

export function closeUrlSubView(
  router: Router,
  pathname: string,
  searchParams: Params,
  param = "unit",
) {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(param);
  const target = buildUrl(pathname, params);
  openedFrom = null;
  router.replace(target, { scroll: false });
}
