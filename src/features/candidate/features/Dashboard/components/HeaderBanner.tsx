"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiPlus, FiBell, FiLogOut, FiChevronLeft } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Logo } from "@/src/components/ui/logo";
import { LogoutModal } from "@/components/LogoutModal";
import { NotificationDropdown } from "./NotificationDropdown";

import { useAppSelector } from "@/store/hooks";

interface HeaderBannerProps {
  userName?: string;
  title?: string;
  backHref?: string;
  backTitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  showCreateButton?: boolean;
  createButtonText?: string;
  createButtonHref?: string;
  rightAction?: React.ReactNode;
}

const NAV_LINKS = [
  { label: "Overview", href: "/dashboard" },
  { label: "My Applications", href: "/dashboard/applications" },
  { label: "Settings", href: "/dashboard/settings" },
];

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  userName = "User",
  title,
  backHref,
  backTitle,
  breadcrumbs,
  showCreateButton = true,
  createButtonText = "Start Assessment",
  createButtonHref = "/onboarding/assessment-type",
  rightAction,
}) => {
  const pathname = usePathname();
  const authUser = useAppSelector((state) => state.auth.user);
  const displayName =
    authUser?.fullName ||
    authUser?.email?.split("@")[0] ||
    userName;

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const personalInfo = useAppSelector((state) => state.onboarding.personalInfo);
  const userAvatarSrc =
    personalInfo.passportUrl ||
    authUser?.avatar ||
    (authUser as any)?.avatarUrl ||
    (authUser as any)?.passportUrl ||
    ASSETS_URL.userAvatar;

  return (
    <header className="w-full bg-[#a31d38] text-white shadow-md relative">
      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Logo theme="light" width={80} href="/" />

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
                  className={`text-sm font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-primary shadow-xs"
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
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer relative"
              >
                <FiBell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#fbab2a]" />
              </button>

              <NotificationDropdown
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                maxItems={3}
              />
            </div>

            {/* User Avatar */}
            <Link
              href="/dashboard/settings"
              aria-label="Profile Settings"
              className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <Image
                src={userAvatarSrc}
                alt={userName}
                fill
                sizes="36px"
                className="object-cover"
                priority
                loading="eager"
              />
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              aria-label="Log out"
              onClick={() => setIsLogoutOpen(true)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Links Row */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-1 pt-3 border-t border-white/10 no-scrollbar">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-[#b93852] text-white shadow-lg"
                    : "text-white/80 hover:text-white bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Bottom Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 sm:pt-5 gap-3 sm:gap-4 w-full">
          {backHref && backTitle ? (
            <div className="flex flex-col gap-1 min-w-0 max-w-full">
              <Link
                href={backHref}
                className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 transition-opacity break-words"
              >
                <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
                <span className="break-words">{backTitle}</span>
              </Link>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal flex-wrap">
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
                        <span className="text-white font-medium break-words">
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white break-words">
              {title || `Welcome Back, ${displayName}`}
            </h1>
          )}

          {rightAction ? (
            <div className="shrink-0 max-w-full self-start sm:self-auto">{rightAction}</div>
          ) : (
            showCreateButton && (
              <Link
                href={createButtonHref}
                className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 inline-flex no-underline select-none"
              >
                <span>{createButtonText}</span>
                <FiPlus className="w-4 h-4 stroke-[2.5]" />
              </Link>
            )
          )}
        </div>
      </div>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </header>
  );
};
