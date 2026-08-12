"use client";

import React from "react";
import Image from "next/image";
import { fileGreenIcon, fileIcon } from "@/assets";

interface StatsCardsProps {
  activeCount?: number;
  completedCount?: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  activeCount = 0,
  completedCount = 0,
}) => {
  return (
    <div className="flex flex-col gap-4 h-full justify-between">
      {/* Active Applications Card */}
      <div className="bg-white rounded-[22px] p-5 lg:p-6 flex items-start justify-between shadow-lg border border-gray-100/80 flex-1">
        <div className="flex flex-col gap-1 justify-center">
          <h3 className="text-black font-semibold text-base lg:text-xl tracking-tight">
            Active Applications
          </h3>
          <div className="text-black text-sm lg:text-base font-normal mt-1">
            <span className="font-extrabold text-lg lg:text-2xl text-black mr-1.5">
              {activeCount}
            </span>
            {activeCount === 1 ? "application" : "applications"}
          </div>
        </div>
        <div className="shrink-0">
          <Image
            src={fileIcon}
            alt="Active applications"
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      </div>

      {/* Completed Applications Card */}
      <div className="bg-white rounded-[22px] p-5 lg:p-6 flex items-start justify-between shadow-lg border border-gray-100/80 flex-1">
        <div className="flex flex-col gap-1 justify-center">
          <h3 className="text-black font-semibold text-base lg:text-xl tracking-tight">
            Completed
          </h3>
          <div className="text-black text-sm lg:text-base font-normal mt-1">
            <span className="font-extrabold text-lg lg:text-2xl text-black mr-1.5">
              {completedCount}
            </span>
            {completedCount === 1 ? "application" : "applications"}
          </div>
        </div>
        <div className="shrink-0">
          <Image
            src={fileGreenIcon}
            alt="Completed applications"
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      </div>
    </div>
  );
};
