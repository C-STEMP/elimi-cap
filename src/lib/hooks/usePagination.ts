"use client";

import { useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Client-side pagination over an already-filtered list. Jumps back to page 1
 * whenever the number of items changes (search / filter / refetch), and never
 * lets the current page run past the last one.
 */
export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset during render (not in an effect) so the stale page never paints.
  const [prevTotalItems, setPrevTotalItems] = useState(totalItems);
  if (prevTotalItems !== totalItems) {
    setPrevTotalItems(totalItems);
    setPage(1);
  }

  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  const pagination: PaginationState = {
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    onPageChange: (next) => setPage(Math.min(Math.max(1, next), totalPages)),
  };

  return { pageItems, pagination };
}
