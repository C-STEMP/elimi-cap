"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiBell,
  FiLogOut,
  FiChevronLeft,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Logo } from "@/src/components/ui/logo";
import { LogoutModal } from "@/components/LogoutModal";
import { NotificationDropdown } from "./NotificationDropdown";

import { useAppSelector } from "@/store/hooks";

import { useGetMeProfile } from "@/src/features/shared/account/hooks";

interface HeaderBannerProps {
  userName?: string;
  title?: string;
  backHref?: string;
  backTitle?: string;
  onBackClick?: () => void;
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];
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
  onBackClick,
  breadcrumbs,
  showCreateButton = true,
  createButtonText = "Start Assessment",
  createButtonHref = "/onboarding/assessment-type",
  rightAction,
}) => {
  const pathname = usePathname();
  const authUser = useAppSelector((state) => state.auth.user);
  const personalInfo = useAppSelector((state) => state.onboarding.personalInfo);
  const { data: meProfile } = useGetMeProfile();

  const rawFirstName =
    meProfile?.personalDetails?.firstName ||
    personalInfo?.firstName ||
    (authUser as any)?.firstName ||
    (authUser as any)?.name?.split(" ")[0] ||
    authUser?.fullName?.split(" ")[0] ||
    (authUser?.email ? authUser.email.split("@")[0] : userName);

  const displayName =
    rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userAvatarSrc =
    meProfile?.photo?.url ||
    personalInfo.passportUrl ||
    authUser?.avatar ||
    (authUser as any)?.avatarUrl ||
    (authUser as any)?.passportUrl ||
    ASSETS_URL.userAvatar;

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="w-full bg-[#a31d38] text-white shadow-md relative">
      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Logo theme="light" width={80} href="/" />

          <nav className="hidden md:flex items-center gap-2">
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
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="text-sm font-semibold px-3.5 py-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer flex items-center gap-1.5 ml-1"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
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

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay (Does not drag down menu) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex justify-end md:hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              />

              {/* Drawer Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full max-w-[280px] bg-[#8c1830] border-l border-white/10 text-white h-full shadow-2xl flex flex-col z-10 p-5 overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/30 shrink-0">
                      <Image
                        src={userAvatarSrc}
                        alt={userName}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate">{displayName}</span>
                      <span className="text-[11px] text-white/70">Candidate</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 pt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 px-3 mb-1">
                    Navigation
                  </span>
                  {NAV_LINKS.map((link, i) => {
                    const isActive =
                      link.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname?.startsWith(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                            isActive
                              ? "bg-white text-[#a31d38] font-bold shadow-sm"
                              : "text-white/85 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span>{link.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Remaining Tabs / Logout in Drawer */}
                <div className="mt-auto pt-4 border-t border-white/15 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLogoutOpen(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-200 hover:text-white hover:bg-red-500/20 flex items-center gap-2.5 text-left transition-all cursor-pointer"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 sm:pt-5 gap-3 sm:gap-4 w-full">
          {backTitle ? (
            <div className="flex flex-col gap-1 min-w-0 max-w-full">
              {onBackClick ? (
                <button
                  type="button"
                  onClick={onBackClick}
                  className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 transition-opacity wrap-break-word text-left cursor-pointer select-none"
                >
                  <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
                  <span className="wrap-break-word">{backTitle}</span>
                </button>
              ) : backHref ? (
                <Link
                  href={backHref}
                  className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight hover:opacity-90 transition-opacity wrap-break-word"
                >
                  <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
                  <span className="wrap-break-word">{backTitle}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-2xl lg:text-3xl tracking-tight">
                  <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
                  <span className="wrap-break-word">{backTitle}</span>
                </div>
              )}

              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-white/90 font-normal flex-wrap">
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.label}>
                      {idx > 0 && <span className="text-white/60">&gt;</span>}
                      {crumb.onClick ? (
                        <button
                          type="button"
                          onClick={crumb.onClick}
                          className="hover:underline transition-colors text-white/90 cursor-pointer"
                        >
                          {crumb.label}
                        </button>
                      ) : crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="hover:underline transition-colors text-white/90"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-white font-medium wrap-break-word">
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white wrap-break-word">
              {title || `Welcome Back, ${displayName}`}
            </h1>
          )}

          {rightAction ? (
            <div className="shrink-0 max-w-full self-start sm:self-auto">{rightAction}</div>
          ) : (
            showCreateButton && (
              <Link
                href={createButtonHref}
                className="bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 no-underline select-none"
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
