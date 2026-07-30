"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiChevronRight,
  FiChevronLeft,
  FiFolder,
  FiPlus,
} from "react-icons/fi";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import { Button } from "@/components/ui/button";

export interface ApplicationRecord {
  id: string;
  title: string;
  subtitle: string;
  status:
    | "Not Started"
    | "Evidence Upload"
    | "Completed"
    | "Archived"
    | "Draft";
  borderColor: string;
  statusBg: string;
  statusText: string;
  category: "Ongoing" | "Completed" | "Draft" | "Archived";
  submittedDate?: string;
  hasAttention?: boolean;
}

const MOCK_APPLICATIONS: ApplicationRecord[] = [
  {
    id: "carpentry-1",
    title: "Carpentry",
    subtitle: "Recognition Of Prior Learning",
    status: "Not Started",
    borderColor: "#F9A825",
    statusBg: "bg-[#F9A8251A]",
    statusText: "text-[#F9A825]",
    category: "Ongoing",
    submittedDate: "7/21/2026",
  },
  {
    id: "carpentry-2",
    title: "Carpentry",
    subtitle: "Recognition Of Prior Learning",
    status: "Evidence Upload",
    borderColor: "primary",
    statusBg: "bg-[#AA1D3F1A]",
    statusText: "text-primary",
    category: "Ongoing",
    submittedDate: "7/21/2026",
    hasAttention: true,
  },
  {
    id: "carpentry-3",
    title: "Carpentry",
    subtitle: "Recognition Of Prior Learning",
    status: "Completed",
    borderColor: "#1E7F4C",
    statusBg: "bg-[#1E7F4C1A]",
    statusText: "text-[#1E7F4C]",
    category: "Completed",
    submittedDate: "6/15/2026",
  },
  {
    id: "carpentry-4",
    title: "Carpentry",
    subtitle: "Recognition Of Prior Learning",
    status: "Completed",
    borderColor: "#1E7F4C",
    statusBg: "bg-[#1E7F4C1A]",
    statusText: "text-[#1E7F4C]",
    category: "Completed",
    submittedDate: "5/10/2026",
  },
  {
    id: "carpentry-5",
    title: "Carpentry",
    subtitle: "Recognition Of Prior Learning",
    status: "Archived",
    borderColor: "#241014",
    statusBg: "bg-[#00000033]",
    statusText: "text-black",
    category: "Archived",
    submittedDate: "3/01/2026",
  },
];

type FilterTab = "All" | "Ongoing" | "Completed" | "Draft" | "Archived";

export const MyApplicationsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateParam = searchParams?.get("state");

  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [demoState, setDemoState] = useState<"populated" | "empty">(
    stateParam === "empty" ? "empty" : "populated",
  );

  const isPopulated = demoState === "populated";

  const filteredApplications = MOCK_APPLICATIONS.filter((app) => {
    if (activeTab === "All") return true;
    if (activeTab === "Ongoing")
      return app.status === "Not Started" || app.status === "Evidence Upload";
    if (activeTab === "Completed") return app.status === "Completed";
    if (activeTab === "Draft") return app.status === "Draft";
    if (activeTab === "Archived") return app.status === "Archived";
    return true;
  });

  const handleCreateApplication = () => {
    router.push("/onboarding/assessment-type?from=dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col gap-2"
    >
      <HeaderBanner
        title="My Applications"
        showCreateButton={isPopulated}
        createButtonText="Create Application"
      />

      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2 bg-gray-200/60 p-1 rounded-lg text-xs">
          <span className="text-gray-500 font-semibold px-2">
            Preview Mode:
          </span>
          <button
            type="button"
            onClick={() => setDemoState("populated")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              demoState === "populated"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Populated State (Image 3)
          </button>
          <button
            type="button"
            onClick={() => setDemoState("empty")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              demoState === "empty"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Empty State (Image 1)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[22px] p-4 shadow-sm border border-[#F7F4EF] min-h-135 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-gray-100/60">
          <h2 className="text-black font-medium text-xl tracking-tight">
            My Applications
          </h2>

          <div className="flex items-center gap-1 sm:gap-2 text-xs font-medium bg-input-bg p-1 rounded-full overflow-x-auto shrink-0">
            {(
              [
                "All",
                "Ongoing",
                "Completed",
                "Draft",
                "Archived",
              ] as FilterTab[]
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-[#191913] font-medium shadow-xs"
                    : "text-[#191913] hover:bg-white/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {!isPopulated || filteredApplications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center my-auto">
            <div className="w-30 h-30 rounded-full bg-input-bg flex items-center justify-center mb-5">
              <FiFolder className="w-12 h-12 text-primary/12" />
            </div>

            <h3 className="text-[#191918] font-semibold text-xl mb-2">
              No applications yet
            </h3>
            <p className="text-[#19191880] text-xs sm:text-sm leading-relaxed max-w-sm mb-8 text-center px-4">
              Click &quot;Create Application&quot; in the top header to get
              started with your Recognition of Prior Learning journey.
            </p>

            <Button
              variant="secondary"
              onClick={handleCreateApplication}
              rightIcon={<FiPlus className="w-4 h-4 stroke-[2.5]" />}
              className="px-7 py-3 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              Create Application
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between py-4">
            <div className="flex flex-col gap-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() =>
                    router.push(`/dashboard/applications/${app.id}`)
                  }
                  className="bg-[#F7F4EF] rounded-2xl p-5 flex items-center justify-between hover:bg-[#eef0f6] transition-all cursor-pointer group shadow-2xs relative overflow-hidden"
                  style={{ borderLeft: `5px solid ${app.borderColor}` }}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[#191918] font-medium text-lg lg:text-2xl">
                        {app.title}
                      </span>
                      <span
                        className={`${app.statusBg} ${app.statusText} text-xs font-semibold px-3 py-1 rounded-full shadow-2xs`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <span className="text-[#191918]/50 text-xs sm:text-sm lg:text-base font-normal">
                      {app.subtitle}
                    </span>
                  </div>

                  <FiChevronRight className="w-5 h-5 text-[#141B34] group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="text-gray-400 hover:text-gray-800 transition-colors p-1 cursor-pointer disabled:opacity-40"
                disabled={currentPage === 1}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center cursor-pointer transition-all ${
                  currentPage === 1
                    ? "bg-[#FCE7F3] text-[#a31d38] shadow-2xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                1
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center cursor-pointer transition-all ${
                  currentPage === 2
                    ? "bg-[#FCE7F3] text-[#a31d38] shadow-2xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                2
              </button>

              <button
                type="button"
                aria-label="Next page"
                onClick={() => setCurrentPage((p) => Math.min(2, p + 1))}
                className="text-gray-400 hover:text-gray-800 transition-colors p-1 cursor-pointer"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
