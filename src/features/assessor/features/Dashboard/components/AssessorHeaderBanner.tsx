"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FiBell,
  FiLogOut,
  FiClipboard,
  FiUser,
  FiFlag,
  FiChevronLeft,
  FiPlus,
  FiCheck,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { Logo } from "@/src/components/ui/logo";
import { Button } from "@/src/components/ui/button";
import { LogoutModal } from "@/components/LogoutModal";
import { NotificationDropdown } from "@/features/candidate/features/Dashboard/components/NotificationDropdown";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { logout } from "@/src/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import { AssessorApplicationStatsCards } from "../../Applications/components/list";

export type AssessorNavTab =
  | "Overview"
  | "Centres"
  | "Applications"
  | "Job Board"
  | "Settings";

interface AssessorHeaderBannerProps {
  userName: string;
  activeTab: AssessorNavTab;
  onSelectTab: (tab: AssessorNavTab) => void;
  selectedCentreName?: string | null;
  onBackFromCentre?: () => void;
  selectedApplicationName?: string | null;
  applicationSubView?:
    | "stages"
    | "application_form"
    | "evidence_vault"
    | "assessment_form";
  canMarkAsComplete?: boolean;
  onMarkAsComplete?: () => void;
  onBackFromApplication?: () => void;
  onApplyToCentre?: () => void;
  totalCentresCount?: number;
  totalApplicationsCount?: number;
  pendingApplicationsCount?: number;
  completedApplicationsCount?: number;
}

export const AssessorHeaderBanner: React.FC<AssessorHeaderBannerProps> = ({
  userName,
  activeTab,
  onSelectTab,
  selectedCentreName,
  onBackFromCentre,
  selectedApplicationName,
  applicationSubView = "stages",
  canMarkAsComplete = false,
  onMarkAsComplete,
  onBackFromApplication,
  onApplyToCentre,
  totalCentresCount = 0,
  totalApplicationsCount = 0,
  pendingApplicationsCount = 0,
  completedApplicationsCount = 0,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: meProfile } = useGetMeProfile();
  const assessorPersonalInfo = useAppSelector(
    (state) => state.onboarding.assessorPersonalInfo,
  );
  const personalInfo = useAppSelector((state) => state.onboarding.personalInfo);
  const uploadedAvatar =
    meProfile?.photo?.url ||
    (assessorPersonalInfo as any)?.passportUrl ||
    personalInfo?.passportUrl ||
    authUser?.avatar ||
    authUser?.avatarUrl ||
    authUser?.passportUrl;
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const rawFirstName =
    meProfile?.personalDetails?.firstName ||
    assessorPersonalInfo?.firstName ||
    personalInfo?.firstName ||
    (authUser as any)?.firstName ||
    (authUser as any)?.name?.split(" ")[0] ||
    authUser?.fullName?.split(" ")[0] ||
    (authUser?.email ? authUser.email.split("@")[0] : userName);

  const effectiveUserName =
    rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1);

  const navItems: AssessorNavTab[] = [
    "Overview",
    "Centres",
    "Applications",
    "Job Board",
    "Settings",
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push("/signin");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#a31d38] text-white shadow-md select-none transition-all relative"
    >
      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col gap-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 border-b border-white/10 pb-5">
        <div className="shrink-0 cursor-pointer">
          <Logo theme="light" href="/" />
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden xl:flex items-center gap-1">
          {navItems.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onSelectTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs lg:text-base font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white/15 text-white shadow-xs"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-all cursor-pointer relative"
            aria-label="Messages"
            title="Messages"
          >
            <BiSolidMessageRoundedDetail className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#fbab2a]" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-all cursor-pointer relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <FiBell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#fbab2a]" />
            </button>

            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              maxItems={3}
            />
          </div>

          <div
            onClick={() => onSelectTab("Settings")}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/30 bg-white/20 flex items-center justify-center text-xs sm:text-sm font-bold text-white shrink-0 cursor-pointer relative"
          >
            {uploadedAvatar ? (
              <Image
                src={uploadedAvatar}
                alt={effectiveUserName}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              effectiveUserName.charAt(0).toUpperCase()
            )}
          </div>

          {/* Desktop Logout Button */}
          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white/90 transition-all cursor-pointer"
            aria-label="Logout"
            title="Logout"
          >
            <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex xl:hidden w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white/90 transition-all cursor-pointer"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <FiMenu className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tabs (Dropdown when hamburger open or horizontal scroll) */}
      {isMobileMenuOpen && (
        <div className="flex xl:hidden flex-col gap-2 pt-2 pb-2 border-b border-white/10 animate-fadeIn">
          {navItems.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  onSelectTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-white/25 text-white shadow-xs"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsLogoutOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 text-left mt-1 cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      )}

      {/* Banner Body Content according to Active Tab & Selected Detail */}
      {activeTab === "Overview" ? (
        <div className="flex flex-col gap-5 pt-2">
          <h1 className="text-2xl sm:text-3xl xl:text-[32px] font-extrabold tracking-tight text-white">
            Welcome Back, {effectiveUserName}
          </h1>

          {/* Overview Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-lg font-medium text-white/80">
                  Total Centres
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {totalCentresCount}
                  </span>
                  <span className="text-xs lg:text-base font-normal text-white">
                    centres
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiClipboard className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-lg font-medium text-white/80">
                  Total Applications
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {totalApplicationsCount}
                  </span>
                  <span className="text-xs lg:text-base font-normal text-white">
                    applications
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiClipboard className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-lg font-medium text-white/80">
                  Completed Applications
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {completedApplicationsCount}
                  </span>
                  <span className="text-xs lg:text-base font-normal text-white">
                    applications
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiUser className="w-5 h-5 text-white/90" />
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-lg font-medium text-white/80">
                  Pending Applications
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {pendingApplicationsCount}
                  </span>
                  <span className="text-xs lg:text-base font-normal text-white">
                    applications
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiFlag className="w-5 h-5 text-white/90" />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "Applications" ? (
        selectedApplicationName ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onBackFromApplication}
                className="flex items-center gap-2 text-white font-bold text-2xl sm:text-3xl hover:opacity-90 transition-opacity w-fit cursor-pointer"
              >
                <FiChevronLeft className="w-6 h-6 stroke-[2.5]" />
                <span>
                  {applicationSubView === "evidence_vault"
                    ? "Evidence Vault"
                    : applicationSubView === "application_form"
                      ? "Application Form"
                      : selectedApplicationName}
                </span>
              </button>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90 font-normal">
                <span
                  onClick={onBackFromApplication}
                  className="hover:underline cursor-pointer"
                >
                  Applications
                </span>
                <span>&gt;</span>
                <span
                  onClick={
                    applicationSubView !== "stages"
                      ? onBackFromApplication
                      : undefined
                  }
                  className={
                    applicationSubView !== "stages"
                      ? "hover:underline cursor-pointer"
                      : "font-semibold text-white"
                  }
                >
                  {selectedApplicationName}
                </span>
                {applicationSubView !== "stages" && (
                  <>
                    <span>&gt;</span>
                    <span className="font-semibold text-white">
                      {applicationSubView === "evidence_vault"
                        ? "Evidence Vault"
                        : "Application Form"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Mark As Complete Button: only shows when all uploaded evidence are approved */}
            {applicationSubView === "evidence_vault" && canMarkAsComplete && (
              <Button
                type="button"
                variant="amber"
                size="md"
                onClick={onMarkAsComplete}
                className="bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all self-start sm:self-center shrink-0"
              >
                <span>Mark As Complete</span>
                <FiCheck className="w-4 h-4 stroke-[3]" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5 pt-2">
            <h1 className="text-2xl sm:text-3xl xl:text-[32px] font-extrabold tracking-tight text-white">
              Applications
            </h1>

            <AssessorApplicationStatsCards
              stats={{
                total: totalApplicationsCount || 1220,
                pending: pendingApplicationsCount || 200,
                completed: completedApplicationsCount || 1000,
                archived: 20,
              }}
            />
          </div>
        )
      ) : activeTab === "Centres" ? (
        selectedCentreName ? (
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={onBackFromCentre}
              className="flex items-center gap-2 text-white font-bold text-2xl sm:text-3xl hover:opacity-90 transition-opacity w-fit cursor-pointer"
            >
              <FiChevronLeft className="w-6 h-6 stroke-[2.5]" />
              <span>{selectedCentreName}</span>
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90 font-normal">
              <span onClick={onBackFromCentre} className="hover:underline cursor-pointer">
                Centres
              </span>
              <span>&gt;</span>
              <span className="font-semibold text-white">
                {selectedCentreName}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl xl:text-[32px] font-extrabold tracking-tight text-white">
                Centres
              </h1>

              <Button
                variant="amber"
                size="md"
                onClick={onApplyToCentre}
                rightIcon={<FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />}
                className="bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-[11px] sm:text-sm px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl shadow-lg cursor-pointer shrink-0"
              >
                Apply To Centre
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-lg font-medium text-white/80">
                    Total Centres
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {totalCentresCount}
                    </span>
                    <span className="text-xs lg:text-base font-normal text-white">
                      centres
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-lg font-medium text-white/80">
                    Total Applications
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {totalApplicationsCount}
                    </span>
                    <span className="text-xs lg:text-base font-normal text-white">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiClipboard className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-lg font-medium text-white/80">
                    Completed Applications
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {completedApplicationsCount}
                    </span>
                    <span className="text-xs lg:text-base font-normal text-white">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiUser className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-lg font-medium text-white/80">
                    Pending Applications
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {pendingApplicationsCount}
                    </span>
                    <span className="text-xs lg:text-base font-normal text-white">
                      applications
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <FiFlag className="w-5 h-5 text-white/90" />
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2 pt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {activeTab}
          </h1>
          <p className="text-sm text-white/80">
            Content for {activeTab} section
          </p>
        </div>
      )}

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
      </div>
    </motion.header>
  );
};
