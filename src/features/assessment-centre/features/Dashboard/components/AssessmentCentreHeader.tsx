"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
import { Avatar } from "@/src/components/ui/avatar";
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
        <div className="flex items-center justify-between gap-2 xl:gap-3 2xl:gap-4 border-b border-white/10 pb-5 min-w-0">
          <div className="shrink-0 cursor-pointer">
            <Logo theme="light" width={118} href="/" />
          </div>

        <div className="hidden xl:flex items-center gap-0.5 2xl:gap-1.5 shrink min-w-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1.5 2xl:px-3.5 2xl:py-1.5 rounded-full text-xs xl:text-[13px] 2xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
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

        <div className="flex items-center gap-1.5 sm:gap-2 2xl:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab("messages")}
            className={`w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === "messages"
                ? "bg-white/30 text-white"
                : "bg-white/10 hover:bg-white/20 text-white/90"
            }`}
            aria-label="Messages"
            title="Messages"
          >
            <BiSolidMessageRoundedDetail className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
            <span className="absolute top-1.5 right-1.5 2xl:top-2 2xl:right-2 w-2 h-2 rounded-full bg-[#fbab2a]" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-all cursor-pointer relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <FiBell className="w-4 h-4 sm:w-4.5 sm:h-4.5 2xl:w-5 2xl:h-5" />
              <span className="absolute top-1.5 right-1.5 2xl:top-2 2xl:right-2 w-2 h-2 rounded-full bg-[#fbab2a]" />
            </button>

            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              maxItems={3}
            />
          </div>

          <div
            onClick={() => onSelectTab("settings")}
            className="shrink-0 cursor-pointer"
            title="Settings"
          >
            <Avatar
              src={centreProfile?.logo?.url || centreData?.centre?.centreInformation?.logoUrl}
              name={centreName}
              className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 border border-white/30 shrink-0 hover:opacity-90 transition-opacity"
              alt={centreName}
            />
          </div>

          {/* Logout Icon Button on desktop */}
          <button
            type="button"
            aria-label="Log out"
            title="Log out"
            onClick={() => setIsLogoutOpen(true)}
            className="hidden xl:flex w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white/90 transition-all cursor-pointer shrink-0"
          >
            <FiLogOut className="w-4 h-4 2xl:w-4.5 2xl:h-4.5" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex xl:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white/90 transition-all cursor-pointer ml-1"
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

      {/* Mobile Navigation Drawer Overlay (Does not drag down menu) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
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
              className="relative w-full max-w-[290px] bg-[#8c1830] border-l border-white/10 text-white h-full shadow-2xl flex flex-col z-10 p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={centreProfile?.logo?.url || centreData?.centre?.centreInformation?.logoUrl}
                    name={centreName}
                    className="w-10 h-10 border border-white/30 shrink-0"
                    alt={centreName}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white truncate">{centreName}</span>
                    <span className="text-[11px] text-white/70 capitalize">{effectiveRole.replace(/_/g, " ")}</span>
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
                  Menu & Tabs
                </span>
                {navItems.map((item, i) => {
                  const isActive = activeTab === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left flex items-center justify-between ${
                          isActive
                            ? "bg-white text-[#a31d38] font-bold shadow-sm"
                            : "text-white/85 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
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
