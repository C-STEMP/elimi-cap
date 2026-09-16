"use client";

import React from "react";
import type { IqamIvReportData } from "../../../api/types";

type Section04AData = NonNullable<IqamIvReportData["con04a"]>;

interface Section04AVerificationScopeProps {
  candidateName?: string;
  qualificationTitle?: string;
  internalVerifierName?: string;
  unitAssessorName?: string;
  data?: Section04AData;
  readOnly?: boolean;
  onChange: (data: Section04AData) => void;
}

const VISIT_KEYS = ["first", "second", "third", "fourth", "final"] as const;

export const Section04AVerificationScope: React.FC<Section04AVerificationScopeProps> = ({
  candidateName = "—",
  qualificationTitle = "—",
  internalVerifierName = "—",
  unitAssessorName = "—",
  data,
  readOnly = false,
  onChange,
}) => {
  const visits = data?.visits || {};
  const sampledLoEvidence = data?.sampledLoEvidence || ["", "", ""];

  const update = (patch: Partial<Section04AData>) => {
    onChange({ ...data, ...patch });
  };

  return (
    <div className="flex flex-col gap-5 select-text">
      {/* Scope Disclaimer Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 text-xs sm:text-sm text-neutral-primary leading-relaxed">
        It Is The Responsibility Of Internal Quality Assurer To Complete This Form, Make Copies, Send The Original To The Quality Assurance Coordinator (Lead IQA) And Ensure A Copy Is Given To The Assessor. Where A Positive Unit Or Award Verification Has Taken Place, The IQA Must Complete Either The Unit Or Units And Award Summary Sheet, Ensuring The Administrator Or The Quality Assurance Coordinator (Lead IQA) Receive The Original.
      </div>

      {/* Row 1: 4 Metadata Cards */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100">
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
            <input
              type="date"
              value={data?.dateOfVerification || ""}
              onChange={(e) => update({ dateOfVerification: e.target.value || null })}
              disabled={readOnly}
              className="text-xs sm:text-sm font-black text-neutral-primary mt-1 bg-transparent outline-none disabled:opacity-70"
            />
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
      </div>

      {/* Row 2: 4 Metadata Cards */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              INTERNAL VERIFIER
            </span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
              {internalVerifierName}
            </h4>
          </div>

          <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              NAME OF COUNTERSIGNING IV
            </span>
            <input
              type="text"
              placeholder="Type here"
              value={data?.countersigningIvName || ""}
              onChange={(e) => update({ countersigningIvName: e.target.value })}
              disabled={readOnly}
              className="text-xs sm:text-sm font-black text-neutral-primary mt-1 bg-transparent outline-none disabled:opacity-70 placeholder:font-normal placeholder:text-gray-400"
            />
          </div>

          <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              NAME OF ASSESSOR
            </span>
            <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
              {unitAssessorName}
            </h4>
          </div>

          <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              COUNTERSIGNING ASSESSOR
            </span>
            <input
              type="text"
              placeholder="Type here"
              value={data?.countersigningAssessorName || ""}
              onChange={(e) => update({ countersigningAssessorName: e.target.value })}
              disabled={readOnly}
              className="text-xs sm:text-sm font-black text-neutral-primary mt-1 bg-transparent outline-none disabled:opacity-70 placeholder:font-normal placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Internal Verification Sequence Inputs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-primary">
          Internal verification
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {VISIT_KEYS.map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-primary capitalize">
                {key}
              </label>
              <input
                type="date"
                value={visits[key] || ""}
                onChange={(e) => update({ visits: { ...visits, [key]: e.target.value || null } })}
                disabled={readOnly}
                className="h-11 px-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none focus:border-[#900B27] transition-all disabled:opacity-70"
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
          {[0, 1, 2].map((idx) => (
            <textarea
              key={idx}
              rows={5}
              placeholder="Type here"
              value={sampledLoEvidence[idx] || ""}
              onChange={(e) => {
                const next = [...sampledLoEvidence];
                next[idx] = e.target.value;
                update({ sampledLoEvidence: next });
              }}
              disabled={readOnly}
              className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all disabled:opacity-70"
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
          value={data?.standardizationNotes || ""}
          onChange={(e) => update({ standardizationNotes: e.target.value })}
          disabled={readOnly}
          className="w-full p-3.5 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-neutral-primary outline-none resize-none focus:border-[#900B27] transition-all disabled:opacity-70"
        />
      </div>
    </div>
  );
};
