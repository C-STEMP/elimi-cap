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
} from "react-icons/fi";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { Logo } from "@/src/components/ui/logo";
import { ASSETS_URL } from "@/assets";
import { LogoutModal } from "@/components/LogoutModal";
import { NotificationDropdown } from "@/features/dashboard/components/NotificationDropdown";
import { AssessmentCentreTab } from "../types";
import { MOCK_STATS } from "../utils/constants";

interface HeaderProps {
  activeTab: AssessmentCentreTab;
  onSelectTab: (tab: AssessmentCentreTab) => void;
  onOpenNotifications?: () => void;
  title?: string;
  showStats?: boolean;
  children?: React.ReactNode;
}

export const AssessmentCentreHeader: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNotifications,
  title = "Welcome Back, Chidi",
  showStats = true,
  children,
}) => {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navItems: { id: AssessmentCentreTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "staff", label: "Staff" },
    { id: "applications", label: "Applications" },
    { id: "job-listing", label: "Job Listing" },
    { id: "assessor-request", label: "Assessor Request" },
    { id: "assessors", label: "Assessors" },
    { id: "payments", label: "Payments" },
    { id: "settings", label: "Settings" },
  ];

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
    <div className="w-full bg-[#a31d38] text-white rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-md select-none transition-all relative">
      <div className="flex items-center justify-between gap-4">
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
              src={ASSETS_URL.faviconIcon}
              alt="CSTEMP Logo Badge"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-all cursor-pointer ml-1"
            aria-label="Logout"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex xl:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-white/25 text-white shadow-xs"
                  : "bg-white/10 text-white/80 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {children ? (
        children
      ) : showStats ? (
        <div className="flex flex-col gap-5 pt-2">
          <h1 className="text-2xl sm:text-3xl xl:text-[32px] font-extrabold tracking-tight text-white">
            {title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_STATS.map((stat) => (
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
  );
};
