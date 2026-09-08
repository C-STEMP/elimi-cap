"use client";

import React from "react";

interface ObservationFormHeaderCardProps {
  activeTab: "arf02a" | "arf04a";
  candidateName: string;
  registrationNo?: string;
  unitsAssessed?: string;
}

export const ObservationFormHeaderCard: React.FC<
  ObservationFormHeaderCardProps
> = ({
  activeTab,
  candidateName,
  registrationNo = "APP-2026-0894",
  unitsAssessed = "UNIT 1/UNIT 2/UNIT 3",
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4 select-text">
      <div>
        <span className="text-xs font-semibold text-neutral-secondary block">
          National Skills Qualification (NSQ)
        </span>
        <h2 className="text-base sm:text-lg font-extrabold text-neutral-primary mt-0.5">
          {activeTab === "arf02a"
            ? "Assessors And Candidates Performance Evidence Record Form"
            : "Oral Question And Answer Form"}
        </h2>
        <p className="text-xs text-neutral-secondary mt-0.5">
          {activeTab === "arf02a"
            ? "Official evidence log linking real-time workplace activities to qualification Learning Outcomes & Criteria"
            : "Direct oral questioning protocol and standardized against NOS and Performance Criteria"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            CANDIDATE NAME
          </span>
          <span className="text-xs sm:text-sm font-bold text-neutral-primary mt-0.5 block">
            {candidateName}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            REGISTRATION NO.
          </span>
          <span className="text-xs sm:text-sm font-bold text-neutral-primary mt-0.5 block">
            {registrationNo}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            UNITS ASSESSED
          </span>
          <span className="text-xs sm:text-sm font-bold text-neutral-primary mt-0.5 block">
            {unitsAssessed}
          </span>
        </div>
      </div>
    </div>
  );
};
