"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { NotificationsListContent } from "@/src/features/shared/notifications/components/NotificationsListContent";

export default function NotificationsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col min-h-screen"
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

      <NotificationsListContent />
    </motion.div>
  );
}
