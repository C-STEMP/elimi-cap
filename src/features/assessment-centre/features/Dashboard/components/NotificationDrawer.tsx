"use client";

import React from "react";
import { FiX, FiBell } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetNotifications,
  useMarkNotificationRead,
} from "@/src/features/shared/notifications/hooks";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: notifications = [], isLoading } = useGetNotifications();
  const markReadMutation = useMarkNotificationRead();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end select-none transition-opacity duration-300"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-sm sm:max-w-md h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
        >
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
                  Notifications
                </h3>
                {notifications.filter((n) => !n.read && n.isUnread !== false).length > 0 && (
                  <span className="bg-[#fbab2a] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {notifications.filter((n) => !n.read && n.isUnread !== false).length}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
                aria-label="Close notification"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                    <FiBell className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    No new notifications
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const isUnread = !item.read && item.isUnread !== false;
                  const itemMessage =
                    item.description ||
                    (item as any).payload?.message ||
                    (item as any).message ||
                    item.title ||
                    "Notification received";
                  const itemTitle =
                    item.title && item.title !== item.description
                      ? item.title
                      : (item as any).payload?.title || "Notification";

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isUnread) markReadMutation.mutate(item.id);
                      }}
                      className={`p-4 rounded-2xl transition-colors border flex items-start gap-3.5 relative group cursor-pointer ${
                        isUnread
                          ? "bg-[#FFFBF5] border-amber-200/80 hover:bg-amber-50/50"
                          : "bg-[#F8F9FA] hover:bg-[#F3F4F6] border-gray-100"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-neutral-primary shrink-0 shadow-2xs">
                        <FiBell className="w-5 h-5" />
                      </div>

                      <div className="flex flex-col flex-1 pr-4">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs sm:text-sm text-neutral-primary">
                            {itemTitle}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 font-normal mt-1 leading-relaxed line-clamp-2">
                          {itemMessage}
                        </p>

                        <span className="text-[11px] text-gray-400 font-medium italic mt-2">
                          {item.time ||
                            item.timestamp ||
                            (item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "")}
                        </span>
                      </div>

                      {isUnread && (
                        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#fbab2a]" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
