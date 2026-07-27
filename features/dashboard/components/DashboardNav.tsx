"use client";

import React from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Overview", href: "/dashboard" },
  { label: "My Application", href: "/dashboard/applications" },
  { label: "Settings", href: "/dashboard/settings" },
];

export const DashboardNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-6 lg:px-10 py-4">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            elimi
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-radius-200 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full" />
        </button>

        <div className="w-9 h-9 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
          <span className="text-white text-sm font-semibold">C</span>
        </div>

        <button
          type="button"
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Logout"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </nav>
  );
};
