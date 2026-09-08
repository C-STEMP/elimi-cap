"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";

export const Section04AVerificationScope: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Scope Disclaimer Box */}
      <div className="p-4 bg-gray-50/70 border border-gray-100 rounded-2xl text-[11px] sm:text-xs text-neutral-secondary leading-relaxed">
        It Is The Responsibility Of Internal Quality Assurer To Complete This Form, Make Copies, Send The Original To The Quality Assurance Coordinator (Lead IQA) And Ensure A Copy Is Given To The Assessor. Where A Positive Unit Or Award Verification Has Taken Place, The IQA Must Complete Either The Unit Or Units And Award Summary Sheet, Ensuring The Administrator Or The Quality Assurance Coordinator (Lead IQA) Receive The Original.
      </div>

      {/* Main Metadata Inputs Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-primary">Internal Verifier (IQA)<span className="text-rose-500">*</span></label>
          <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-primary">Countersigning IV Name<span className="text-rose-500">*</span></label>
          <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-primary">Date of Verification<span className="text-rose-500">*</span></label>
          <div className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-neutral-primary">
            <input type="text" placeholder="Select" className="w-full bg-transparent outline-none" />
            <FiCalendar className="w-4 h-4 text-gray-400 shrink-0 ml-1.5" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-primary">Name of Assessor<span className="text-rose-500">*</span></label>
          <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-primary">Name of countersigning Assessor<span className="text-rose-500">*</span></label>
          <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-primary">Name of Candidate<span className="text-rose-500">*</span></label>
          <input type="text" placeholder="Type here" defaultValue="Samson David" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-primary">Awarding Body Enrolment No<span className="text-rose-500">*</span></label>
          <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-primary">Title & Level of Qualification<span className="text-rose-500">*</span></label>
          <input type="text" placeholder="Type here" className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
        </div>
      </div>

      {/* Internal Verification Sequence Inputs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Internal verification</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {["1st", "2nd", "3rd", "4th", "Final"].map((seq) => (
            <div key={seq} className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-neutral-primary">{seq}</label>
              <input type="text" placeholder="Type here" className="h-10 px-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Unit/s LO's & Criterion Sampled */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">
          Unit/s LO&apos;s & Criterion Sampled and Reference numbers of evidence sampled
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((box) => (
            <textarea
              key={box}
              rows={4}
              placeholder="Type here"
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none"
            />
          ))}
        </div>
      </div>

      {/* Standardization unit */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">
          Standardization unit and any issues of standardization identified
        </h4>
        <textarea
          rows={4}
          placeholder="Type here"
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none"
        />
      </div>
    </div>
  );
};
