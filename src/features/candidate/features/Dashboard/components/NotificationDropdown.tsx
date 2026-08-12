"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FiBell,
  FiFileText,
  FiCheckCircle,
  FiInfo,
  FiShield,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import {
  INITIAL_NOTIFICATIONS,
  NotificationItem,
} from "../data/notificationsData";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  maxItems?: number;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  maxItems = 3,
}) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );

  const previewNotifications = notifications.slice(0, maxItems);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleViewMore = () => {
    onClose();
    router.push("/dashboard/notifications");
  };

  const getCategoryIcon = (category: NotificationItem["category"]) => {
    switch (category) {
      case "application":
        return <FiFileText className="w-4 h-4 text-[#a31d38]" />;
      case "assessment":
        return <FiCheckCircle className="w-4 h-4 text-[#fbab2a]" />;
      case "security":
        return <FiShield className="w-4 h-4 text-emerald-600" />;
      case "system":
      default:
        return <FiInfo className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Click Detector */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dropdown Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-[#1e1e1e] select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#a31d38] text-white">
              <div className="flex items-center gap-2">
                <FiBell className="w-4 h-4" />
                <span className="font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-[#fbab2a] text-black text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  Mark read
                </button>
              )}
            </div>

            {/* Notification Preview List (Max Items) */}
            <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
              {previewNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.link) {
                      onClose();
                      router.push(notif.link);
                    }
                  }}
                  className={`p-4 flex gap-3 transition-colors cursor-pointer ${
                    !notif.read ? "bg-[#fffdf8]" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Category Icon Badge */}
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#1e1e1e] truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                      {notif.description}
                    </p>
                  </div>

                  {/* Unread Dot */}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-[#fbab2a] shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer View More Action */}
            <div className="p-3 bg-slate-50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleViewMore}
                className="w-full py-2.5 px-4 rounded-xl bg-[#a31d38] hover:bg-[#8d1830] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <span>View More Notifications ({notifications.length})</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
