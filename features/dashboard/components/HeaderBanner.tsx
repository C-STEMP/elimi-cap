"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiPlus, FiBell, FiLogOut, FiChevronLeft } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Logo } from "@/components/ui/logo";

interface HeaderBannerProps {
  userName?: string;
  title?: string;
  backHref?: string;
  backTitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  showCreateButton?: boolean;
  createButtonText?: string;
  createButtonHref?: string;
}

const NAV_LINKS = [
  { label: "Overview", href: "/dashboard" },
  { label: "My Applications", href: "/dashboard/applications" },
  { label: "Settings", href: "/dashboard/settings" },
];

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  userName = "Chidi",
  title,
  backHref,
  backTitle,
  breadcrumbs,
  showCreateButton = true,
  createButtonText = "Create Application",
  createButtonHref = "/onboarding/assessment-type?from=dashboard",
}) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="bg-[#a31d38] rounded-[22px] px-6 lg:px-8 py-5 text-white shadow-md mb-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center group">
          <Logo theme="light" width={80} />
        </Link>

        {/* Navigation Pills */}
        <nav className="hidden md:flex items-center gap-3">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#b93852] text-white shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right User & Utility Controls */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <FiBell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#fbab2a] rounded-full ring-2 ring-[#a31d38]" />
          </button>

          {/* User Avatar */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
            <Image
              src={ASSETS_URL.userAvatar}
              alt={userName}
              fill
              sizes="36px"
              className="object-cover"
              priority
              loading="eager"
            />
          </div>

          {/* Logout Button */}
          <button
            type="button"
            aria-label="Log out"
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-5 gap-4">
        {backHref && backTitle ? (
          <div className="flex flex-col gap-1">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 transition-opacity"
            >
              <FiChevronLeft className="w-6 h-6 stroke-[2.5]" />
              <span>{backTitle}</span>
            </Link>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.label}>
                    {idx > 0 && <span className="text-white/60">&gt;</span>}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:underline transition-colors text-white/90"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white font-medium">
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            {title || `Welcome Back, ${userName}`}
          </h1>
        )}

        {showCreateButton && (
          <button
            type="button"
            onClick={() => router.push(createButtonHref)}
            className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            {createButtonText}
            <FiPlus className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};

