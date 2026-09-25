"use client";

import React from "react";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { NotificationsListContent } from "@/src/features/shared/notifications/components/NotificationsListContent";
import { useAppSelector } from "@/src/store/hooks";

export default function NotificationsPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const firstName =
    authUser?.fullName?.split(" ")[0] ||
    authUser?.email?.split("@")[0] ||
    "User";

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] flex flex-col select-text">
      <HeaderBanner userName={firstName} />

      <NotificationsListContent />
    </div>
  );
}
