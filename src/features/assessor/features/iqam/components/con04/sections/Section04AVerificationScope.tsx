"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";

interface Section04AVerificationScopeProps {
  candidateName?: string;
  qualificationTitle?: string;
}

export const Section04AVerificationScope: React.FC<Section04AVerificationScopeProps> = ({
  candidateName = "Samson David",
  qualificationTitle = "Masonry Level 2",
}) => {
  return (
    <div className="flex flex-col gap-5 select-text">
      {/* Scope Disclaimer Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 text-xs sm:text-sm text-neutral-primary leading-relaxed">
        It Is The Responsibility Of Internal Quality Assurer To Complete This Form, Make Copies, Send The Original To The Quality Assurance Coordinator (Lead IQA) And Ensure A Copy Is Given To The Assessor. Where A Positive Unit Or Award Verification Has Taken Place, The IQA Must Complete Either The Unit Or Units And Award Summary Sheet, Ensuring The Administrator Or The Quality Assurance Coordinator (Lead IQA) Receive The Original.
      </div>

      {/* Row 1: 4 Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            REF: CON/04A/IQAM
          </span>
          <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">
            Verification Scope & Sampled Units
          </h4>
        </div>

        <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Candidate Name
          </span>
          <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
            {candidateName}
          </h4>
        </div>

        <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            DATE OF VERIFICATION
          </span>
          <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">
            12/07/2027
          </h4>
        </div>

        <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            QUALIFICATION
          </span>
          <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">
            {qualificationTitle}
          </h4>
        </div>
      </div>

      {/* Row 2: 4 Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            INTERNAL VERIFIER
          </span>
          <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
            Ogunsakin Jacob
          </h4>
        </div>

        <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            NAME OF COUNTERSIGNING IV
          </span>
          <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">
            -
          </h4>
        </div>

        <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            NAME OF ASSESSOR
          </span>
          <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
            Samson John
          </h4>
        </div>

        <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            COUNTERSIGNING ASSESSOR
          </span>
          <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">
            -
          </h4>
        </div>
      </div>

      {/* Internal Verification Sequence Inputs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-primary">
          Internal verification
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {["1st", "2nd", "3rd", "4th", "Final"].map((seq) => (
            <div key={seq} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-primary">
                {seq}
              </label>
              <input
                type="text"
                placeholder="Type here"
                className="h-11 px-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none focus:border-[#900B27] transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Unit/s LO's & Criterion Sampled */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-primary">
          Unit/s LO&apos;s & Criterion Sampled and Reference numbers of evidence sampled
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((box) => (
            <textarea
              key={box}
              rows={5}
              placeholder="Type here"
              className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all"
            />
          ))}
        </div>
      </div>

      {/* Standardization unit */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-primary">
          Standardization unit and any issues of standardization identified
        </h4>
        <textarea
          rows={5}
          placeholder="Type here"
          className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all"
        />
      </div>
    </div>
  );
};
