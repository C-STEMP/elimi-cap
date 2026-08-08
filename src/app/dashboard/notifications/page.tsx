"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FiBell,
  FiFileText,
  FiCheckCircle,
  FiInfo,
  FiShield,
  FiCheck,
  FiTrash2,
  FiExternalLink,
} from "react-icons/fi";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import {
  INITIAL_NOTIFICATIONS,
  NotificationItem,
} from "@/features/dashboard/data/notificationsData";

type CategoryFilter = "all" | "unread" | "application" | "assessment" | "system" | "security";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    return n.category === activeFilter;
  });

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getCategoryIcon = (category: NotificationItem["category"]) => {
    switch (category) {
      case "application":
        return <FiFileText className="w-5 h-5 text-[#a31d38]" />;
      case "assessment":
        return <FiCheckCircle className="w-5 h-5 text-[#fbab2a]" />;
      case "security":
        return <FiShield className="w-5 h-5 text-emerald-600" />;
      case "system":
      default:
        return <FiInfo className="w-5 h-5 text-blue-600" />;
    }
  };

  const filterTabs: { id: CategoryFilter; label: string; count?: number }[] = [
    { id: "all", label: "All", count: notifications.length },
    { id: "unread", label: "Unread", count: unreadCount },
    { id: "application", label: "Applications" },
    { id: "assessment", label: "Assessments" },
    { id: "system", label: "System" },
    { id: "security", label: "Security" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col gap-6"
    >
      <HeaderBanner
        title="Notifications"
        backHref="/dashboard"
        backTitle="Dashboard"
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Notifications" },
        ]}
        showCreateButton={false}
      />

      {/* Main Notifications Card Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100/80 flex flex-col gap-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#a31d38] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <FiCheck className="w-4 h-4 text-[#a31d38]" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
              <FiBell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1e1e1e]">No Notifications Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              You are all caught up! No notifications match your selected filter.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !notif.read
                    ? "border-[#a31d38]/30 bg-[#fffcf5] shadow-xs"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                {/* Left Icon & Text */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-gray-200/60">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[#1e1e1e]">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="bg-[#fbab2a] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Unread
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-medium">
                        • {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#a31d38] hover:text-white text-xs font-semibold text-gray-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Details</span>
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleRead(notif.id)}
                    title={notif.read ? "Mark as unread" : "Mark as read"}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                  >
                    <FiCheck className={`w-4 h-4 ${notif.read ? "text-gray-400" : "text-[#a31d38]"}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteNotification(notif.id)}
                    title="Delete notification"
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
