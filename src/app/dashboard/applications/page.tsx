"use client";

import React, { Suspense } from "react";
import { MyApplicationsPage } from "@/features/candidate/features/Application/pages/MyApplicationsPage";

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <MyApplicationsPage />
    </Suspense>
  );
}
