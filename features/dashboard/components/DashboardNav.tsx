"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { FiBell, FiLogOut } from "react-icons/fi";
import { LogoutModal } from "@/components/ui/LogoutModal";
import { NotificationDropdown } from "./NotificationDropdown";

const NAV_LINKS = [
  { label: "Overview", href: "/dashboard" },
  { label: "My Application", href: "/dashboard/applications" },
  { label: "Settings", href: "/dashboard/settings" },
];

export const DashboardNav: React.FC = () => {
  const pathname = usePathname();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 lg:px-10 py-4 relative">
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
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <FiBell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full" />
          </button>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            maxItems={3}
          />
        </div>

        <a
          href="/dashboard/settings"
          aria-label="Profile Settings"
          className="w-9 h-9 rounded-full bg-white/20 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity"
        >
          <span className="text-white text-sm font-semibold">C</span>
        </a>

        <button
          type="button"
          onClick={() => setIsLogoutOpen(true)}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Logout"
        >
          <FiLogOut className="w-[18px] h-[18px]" />
        </button>
      </div>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </nav>
  );
};
