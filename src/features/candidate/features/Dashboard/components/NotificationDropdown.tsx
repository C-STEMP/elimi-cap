"use client";

import React from "react";
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
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/src/features/shared/notifications/hooks";
import { NotificationItem } from "@/src/features/shared/notifications/api";

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
  const { data: remoteNotifications = [], isLoading } = useGetNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = remoteNotifications;
  const previewNotifications = notifications.slice(0, maxItems);
  const unreadCount = notifications.filter((n) => !n.read && n.isUnread !== false).length;

  const markAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) {
      markReadMutation.mutate(notif.id);
    }
    if (notif.link || notif.actionUrl) {
      onClose();
      router.push(notif.link || notif.actionUrl || "/dashboard/notifications");
    }
  };

  const handleViewMore = () => {
    onClose();
    router.push("/dashboard/notifications");
  };

  const getCategoryIcon = (category?: string) => {
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
            className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dropdown Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-3 right-3 top-18 sm:absolute sm:left-auto sm:right-0 sm:top-12 z-50 w-auto sm:w-96 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-[#1e1e1e] select-none"
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
              {isLoading ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Loading notifications...
                </div>
              ) : previewNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No notifications yet.
                </div>
              ) : (
                previewNotifications.map((notif) => {
                  const isUnread = !notif.read && notif.isUnread !== false;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 flex gap-3 transition-colors cursor-pointer ${
                        isUnread ? "bg-[#fffdf8]" : "hover:bg-gray-50"
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
                            {notif.timestamp || notif.time || (notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : "")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                          {notif.description}
                        </p>
                      </div>

                      {/* Unread Dot */}
                      {isUnread && (
                        <div className="w-2 h-2 rounded-full bg-[#fbab2a] shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })
              )}
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
