"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiChevronRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiUser,
} from "react-icons/fi";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { Button } from "@/src/components/ui/button";
import { ASSETS_URL } from "@/assets";
import { NsqUnitDetailView } from "./NsqUnitDetailView";
import { NsqRequestObservationModal } from "./NsqRequestObservationModal";

interface NsqUnitItem {
  id: string;
  unitNo: string;
  title: string;
  status: "Not Started" | "In Progress" | "Completed";
}

interface NsqApplicationDetailViewProps {
  application: any;
}

export const NsqApplicationDetailView: React.FC<NsqApplicationDetailViewProps> = ({
  application,
}) => {
  const router = useRouter();

  const [selectedUnit, setSelectedUnit] = useState<NsqUnitItem | null>(null);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [scheduledObservation, setScheduledObservation] = useState<{
    date: string;
    time: string;
    mode: string;
    notes: string;
  } | null>(null);

  const tradeName =
    application?.trade?.name ||
    (typeof application?.trade === "string" ? application?.trade : "") ||
    "Masonry";

  const sectorName =
    application?.sector?.name ||
    (typeof application?.sector === "string" ? application?.sector : "") ||
    "Construction";

  const levelName = application?.level || "Level 3";

  // Units list
  const unitsList: NsqUnitItem[] = [
    {
      id: "unit-01",
      unitNo: "UNIT 1",
      title: "Maintain personal health, hygiene, and safe workplace environments",
      status: "Not Started",
    },
    {
      id: "unit-02",
      unitNo: "UNIT 2",
      title: "Core trade fundamentals, material measurement, and mortar preparation",
      status: "Not Started",
    },
    {
      id: "unit-03",
      unitNo: "UNIT 3",
      title: "Structural block-laying, alignment checks, and joint finishing",
      status: "Not Started",
    },
    {
      id: "unit-04",
      unitNo: "UNIT 4",
      title: "Quality inspection, structural durability testing, and site clean-up",
      status: "Not Started",
    },
  ];

  // If a unit is selected, show the Unit Detail View (Image 1)
  if (selectedUnit) {
    return (
      <NsqUnitDetailView
        unitNumber={selectedUnit.unitNo}
        unitTitle={selectedUnit.title}
        tradeName={tradeName}
        onBack={() => setSelectedUnit(null)}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center bg-[#f8f9fa] min-h-screen pb-12">
      {/* Edge to edge header banner */}
      <HeaderBanner
        title={tradeName}
        backTitle={tradeName}
        backHref="/dashboard/applications"
        rightAction={
          <Button
            type="button"
            variant="amber"
            size="md"
            rightIcon={<FiCalendar className="w-4 h-4 ml-1" />}
            onClick={() => setIsObservationModalOpen(true)}
            className="px-5 h-10 text-white font-bold text-xs sm:text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md cursor-pointer shrink-0"
          >
            Request Observation
          </Button>
        }
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: tradeName },
        ]}
      />

      {/* Main Container */}
      <div className="w-full max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Main Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Assessment Progress Timeline Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
              <h3 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight">
                Assessment Progress
              </h3>

              {/* Steps Progress */}
              <div className="relative flex items-center justify-between w-full px-2 sm:px-6">
                {/* Horizontal Background Line */}
                <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200 -z-0" />
                <div className="absolute left-6 right-3/4 top-4 h-0.5 bg-emerald-500 -z-0" />

                {/* Step 1: Induction Form */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20">
                    <FiCheck className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 text-center">
                    Induction Form
                  </span>
                </div>

                {/* Step 2: QAA */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-[#fbab2a] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  </div>
                  <span className="text-[11px] font-bold text-[#fbab2a] text-center">
                    QAA
                  </span>
                </div>

                {/* Step 3: IQA */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center" />
                  <span className="text-[11px] font-medium text-gray-400 text-center">
                    IQA
                  </span>
                </div>

                {/* Step 4: Awarding Body */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center" />
                  <span className="text-[11px] font-medium text-gray-400 text-center">
                    Awarding Body
                  </span>
                </div>

                {/* Step 5: Certification */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center" />
                  <span className="text-[11px] font-medium text-gray-400 text-center">
                    Certification
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Card: NOS Details */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="self-start px-2.5 py-0.5 rounded-md bg-pink-50 text-pink-700 font-bold text-[11px] uppercase tracking-wide">
                    Mandatory
                  </span>
                  <h4 className="text-base font-extrabold text-neutral-primary tracking-tight">
                    {tradeName} National Occupational Standard
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      Qualification Code
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-primary">
                      CON/MS001/L1
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      Evidence Type
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-primary">
                      DO/QA/WT/WP/ASS
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Card: Metrics */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm grid grid-cols-2 gap-4 items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Sector
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-neutral-primary truncate">
                    {sectorName}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Mandatory Unit Score
                  </span>
                  <span className="text-base sm:text-lg font-black text-neutral-primary">
                    0
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Level
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-neutral-primary">
                    {levelName}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Optional Unit Score
                  </span>
                  <span className="text-base sm:text-lg font-black text-neutral-primary">
                    0
                  </span>
                </div>
              </div>
            </div>

            {/* Units List */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <h3 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight">
                {tradeName} {levelName}
              </h3>

              <div className="flex flex-col gap-3">
                {unitsList.map((unit) => (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-[#f8f9fa] hover:bg-white flex items-center justify-between gap-4 cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-neutral-primary uppercase shrink-0">
                        {unit.unitNo}:
                      </span>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">
                        {unit.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-gray-200/70 text-gray-600">
                        {unit.status}
                      </span>
                      <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Calendar */}
            <CalendarWidget />

            {/* Observation Request Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
              <h4 className="text-sm font-extrabold text-neutral-primary tracking-tight">
                Observation Request
              </h4>

              {scheduledObservation ? (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <FiCalendar className="w-3.5 h-3.5" /> {scheduledObservation.date}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                      Requested
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-medium">
                    Time: {scheduledObservation.time} · {scheduledObservation.mode}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <FiCalendar className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-neutral-primary">
                    No request
                  </span>
                  <p className="text-[11px] text-gray-400 font-medium max-w-[200px]">
                    Your scheduled events will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Assessor Profile Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center overflow-hidden shrink-0 font-bold text-sm">
                <Image
                  src={ASSETS_URL.userAvatar}
                  alt="Assessor"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-extrabold text-sm text-neutral-primary truncate">
                  Ngozi Eze
                </span>
                <span className="text-[11px] text-gray-500 font-medium truncate">
                  Assessor · {tradeName} ({levelName})
                </span>

                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[10px] font-bold">
                    {tradeName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[10px] font-bold">
                    RPL Coordinator
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observation Request Modal */}
      <NsqRequestObservationModal
        isOpen={isObservationModalOpen}
        onClose={() => setIsObservationModalOpen(false)}
        tradeName={tradeName}
        onRequestSubmitted={(details) => setScheduledObservation(details)}
      />
    </div>
  );
};
