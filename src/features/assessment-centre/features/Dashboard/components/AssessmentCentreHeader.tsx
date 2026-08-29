"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiBell,
  FiLogOut,
  FiClipboard,
  FiFlag,
  FiUser,
  FiDollarSign,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { Logo } from "@/src/components/ui/logo";
import { ASSETS_URL } from "@/assets";
import { LogoutModal } from "@/components/LogoutModal";
import { NotificationDropdown } from "@/features/candidate/features/Dashboard/components/NotificationDropdown";
import { AssessmentCentreTab } from "@/features/assessment-centre/types";
import { useGetApplications } from "@/src/features/shared/applications/hooks";
import {
  useGetCentreStaff,
  useGetRetainedRequests,
  useGetCentreWallet,
  useGetCentreDashboard,
  useGetCentreApplicationsSummary,
  useGetCentreStaffSummary,
  useGetCentreAssessorsSummary,
  useGetCentreProfile,
} from "@/src/features/shared/centre/hooks";
import { useGetOnboarding } from "@/src/features/assessment-centre/features/Onboarding/hooks/useOnboarding";
import { useAppSelector } from "@/src/store/hooks";

import { getPermittedTabs } from "@/features/assessment-centre/utils/rbac";

interface HeaderProps {
  activeTab: AssessmentCentreTab;
  onSelectTab: (tab: AssessmentCentreTab) => void;
  onOpenNotifications?: () => void;
  title?: string;
  showStats?: boolean;
  userRole?: string;
  children?: React.ReactNode;
}

export const AssessmentCentreHeader: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNotifications,
  title,
  showStats = true,
  userRole,
  children,
}) => {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: onboardingRecord } = useGetOnboarding();
  const user = useAppSelector((state) => state.auth.user);
  const effectiveRole = userRole || user?.centreRole || user?.role || "centre";

  const centreData = onboardingRecord?.data as any;
  const centreName =
    centreData?.centre?.centreInformation?.name ||
    centreData?.centreInformation?.name ||
    centreData?.name ||
    user?.fullName ||
    "Assessment Centre";

  const displayTitle = title || `Welcome Back, ${centreName}`;

  const { data: dashboardData } = useGetCentreDashboard();
  const { data: appSummary } = useGetCentreApplicationsSummary();
  const { data: staffSummary } = useGetCentreStaffSummary();
  const { data: assessorSummary } = useGetCentreAssessorsSummary();
  const { data: applications = [] } = useGetApplications();
  const { data: assessors = [] } = useGetRetainedRequests();
  const { data: staff = [] } = useGetCentreStaff();
  const { data: wallet } = useGetCentreWallet();
  const { data: centreProfile } = useGetCentreProfile();

  const totalAppsCount =
    dashboardData?.kpis?.applications ??
    appSummary?.total ??
    applications.length;
  const totalAssessorsCount =
    dashboardData?.kpis?.assessors ??
    assessorSummary?.total ??
    assessorSummary?.active ??
    assessors.length;
  const totalStaffCount =
    dashboardData?.kpis?.staff ?? staffSummary?.total ?? staff.length;

  const rawRevenue = dashboardData?.kpis?.revenue || wallet?.balance;
  const formattedRevenue = rawRevenue?.amountMinorUnits
    ? `${rawRevenue.currency === "USD" ? "$" : "₦"}${(
        Number(rawRevenue.amountMinorUnits) / 100
      ).toLocaleString()}`
    : "₦0";

  const dynamicStats = [
    {
      id: "total-applications",
      label: "Total Applications",
      count: totalAppsCount.toLocaleString(),
      unit: "applications",
      icon: "clipboard",
    },
    {
      id: "total-assessors",
      label: "Total Assessors",
      count: totalAssessorsCount.toLocaleString(),
      unit: "assessors",
      icon: "flag",
    },
    {
      id: "total-staffs",
      label: "Total Staffs",
      count: totalStaffCount.toLocaleString(),
      unit: "staffs",
      icon: "user",
    },
    {
      id: "total-revenue",
      label: "Total Revenue",
      count: formattedRevenue,
      unit: "",
      icon: "money",
    },
  ];

  const permittedTabs = getPermittedTabs(effectiveRole);

  const allNavItems: { id: AssessmentCentreTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "applications", label: "Applications" },
    { id: "assessor-request", label: "Assessor Request" },
    { id: "assessors", label: "Assessors" },
    { id: "job-listing", label: "Job Listing" },
    { id: "staff", label: "Staff" },
    { id: "payments", label: "Payments" },
    { id: "settings", label: "Settings" },
  ];

  const navItems = allNavItems.filter((item) =>
    permittedTabs.includes(item.id),
  );

  const renderStatIcon = (iconName: string) => {
    switch (iconName) {
      case "clipboard":
        return <FiClipboard className="w-5 h-5 text-white/90" />;
      case "flag":
        return <FiFlag className="w-5 h-5 text-white/90" />;
      case "user":
        return <FiUser className="w-5 h-5 text-white/90" />;
      case "money":
        return <FiDollarSign className="w-5 h-5 text-white/90" />;
      default:
        return <FiClipboard className="w-5 h-5 text-white/90" />;
    }
  };

  return (
    <header className="w-full bg-[#a31d38] text-white shadow-md select-none transition-all relative">
      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="shrink-0 cursor-pointer">
            <Logo theme="light" href="/" />
          </div>

        <div className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs lg:text-base font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white/15 text-white shadow-xs"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab("messages")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === "messages"
                ? "bg-white/30 text-white"
                : "bg-white/10 hover:bg-white/20 text-white/90"
            }`}
            aria-label="Messages"
            title="Messages"
          >
            <BiSolidMessageRoundedDetail className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#fbab2a]" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-all cursor-pointer relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <FiBell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#fbab2a]" />
            </button>

            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              maxItems={3}
            />
          </div>

          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 bg-white flex items-center justify-center shrink-0 cursor-pointer">
            <Image
              src={centreProfile?.logo?.url || centreData?.centre?.centreInformation?.logoUrl || ASSETS_URL.faviconIcon}
              alt="Centre Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Desktop Logout Button */}
          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="hidden sm:flex w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white/90 transition-all cursor-pointer ml-1"
            aria-label="Logout"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex xl:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white/90 transition-all cursor-pointer ml-1"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tabs (Dropdown when hamburger open) */}
      {isMobileMenuOpen && (
        <div className="flex xl:hidden flex-col gap-2 pt-2 pb-2 border-b border-white/10 animate-fadeIn">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-white/25 text-white shadow-xs"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
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

      {children ? (
        children
      ) : showStats ? (
        <div className="flex flex-col gap-5 pt-2">
          <h1 className="text-2xl sm:text-3xl xl:text-[32px] font-extrabold tracking-tight text-white">
            {displayTitle}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dynamicStats.map((stat) => (
              <div
                key={stat.id}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white border border-white/15 transition-all shadow-xs"
              >
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm lg:text-lg font-medium text-white/80">
                    {stat.label}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                      {stat.count}
                    </span>
                    {stat.unit && (
                      <span className="text-xs lg:text-white font-normal text-white">
                        {stat.unit}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  {renderStatIcon(stat.icon)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
      </div>
    </header>
  );
};
