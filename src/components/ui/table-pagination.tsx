"use client";

import * as React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { PaginationState } from "@/src/lib/hooks/usePagination";

interface TablePaginationProps extends PaginationState {
  className?: string;
}

/** Page numbers to show: always first/last, a window around the current page, gaps as "…". */
function getPageList(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push("gap");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("gap");
  pages.push(totalPages);
  return pages;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  className = "pt-4",
}) => {
  if (totalItems <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const navButtonClass =
    "w-8 h-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors";

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm ${className}`}
    >
      <span className="text-gray-500">
        Showing <span className="font-semibold text-black">{from}</span>–
        <span className="font-semibold text-black">{to}</span> of{" "}
        <span className="font-semibold text-black">{totalItems}</span>
      </span>

      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={navButtonClass}
          aria-label="Previous page"
        >
          <FiChevronLeft />
        </button>

        {getPageList(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="w-8 text-center text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                p === page
                  ? "bg-[#a31d38] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={navButtonClass}
          aria-label="Next page"
        >
          <FiChevronRight />
        </button>
      </nav>
    </div>
  );
};
