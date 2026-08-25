"use client";

import React, { useState } from "react";
import { AssessorAssessmentFormLayout } from "./AssessorAssessmentFormLayout";
import { useToast } from "@/src/components/ui/toast";

interface UnitMappingItem {
  id: string;
  occupationalUnit: string;
  performanceCriteria: string;
  typeOfEvidence: string;
  description: string;
  status: "Satisfied" | "Not Satisfied";
}

const DEFAULT_UNITS: UnitMappingItem[] = [
  {
    id: "unit-1",
    occupationalUnit: "Carpentry & Joinery Preparation",
    performanceCriteria: "Accurate measurement, cutting, and tooling per standard blueprints",
    typeOfEvidence: "Direct Observation & Practical Portfolio",
    description: "Evaluated joint fitment and bevel angles on physical wooden specimen.",
    status: "Satisfied",
  },
  {
    id: "unit-2",
    occupationalUnit: "Surface Finishing & Polish",
    performanceCriteria: "Application of primer, POP coating, and protective varnish",
    typeOfEvidence: "Third Party Report & Photo Log",
    description: "Verified smooth finish with zero shrinkage cracks.",
    status: "Satisfied",
  },
];

interface AssessmentMappingFormProps {
  candidateName: string;
  onBack: () => void;
  onSubmit: () => void;
}

export const AssessmentMappingForm: React.FC<
  AssessmentMappingFormProps
> = ({ candidateName, onBack, onSubmit }) => {
  const { toast } = useToast();
  const [units, setUnits] = useState<UnitMappingItem[]>(DEFAULT_UNITS);
  const [assessorSigned, setAssessorSigned] = useState(false);

  const handleAddUnit = () => {
    const newId = `unit-${Date.now()}`;
    setUnits((prev) => [
      ...prev,
      {
        id: newId,
        occupationalUnit: "",
        performanceCriteria: "",
        typeOfEvidence: "",
        description: "",
        status: "Satisfied",
      },
    ]);
  };

  const updateUnitField = (
    id: string,
    field: keyof UnitMappingItem,
    value: string,
  ) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)),
    );
  };

  const handleAppendSignature = () => {
    setAssessorSigned(true);
    toast({
      type: "success",
      title: "Signature Appended",
      description: "Assessor signature has been recorded.",
    });
  };

  return (
    <AssessorAssessmentFormLayout
      title="RPL Assessment Grid / Mapping Form"
      subtitle="Matrix linking candidate evidence artifacts to National Occupational Standards and Performance Criteria."
      onBack={onBack}
      onSubmit={onSubmit}
      submitLabel="Continue →"
    >
      {/* 1. Personal Details */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Personal Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Candidate Full Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              defaultValue={candidateName}
              placeholder="Type Here"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Assessors Full Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              defaultValue="Ngozi Eze"
              placeholder="Type Here"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Unit Title & Code
            </label>
            <select className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]">
              <option>Select</option>
              <option value="CRP-301">CRP-301: Advanced Joinery & Surface Prep</option>
              <option value="CRP-302">CRP-302: Finishing & Structural Framework</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Date Collected<span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              defaultValue="2026-07-23"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-primary">
            Workplace/Context<span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Type Here"
            defaultValue="Cstemp Technical Training Centre, Abuja"
            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
          />
        </div>
      </div>

      {/* 2. Trade Units */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Trade
        </h3>

        <div className="flex flex-col gap-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-6 border border-gray-100 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-primary">
                  Occupational Unit<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={unit.occupationalUnit}
                  onChange={(e) =>
                    updateUnitField(unit.id, "occupationalUnit", e.target.value)
                  }
                  placeholder="Type Here"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-primary">
                  Performance Criteria
                </label>
                <input
                  type="text"
                  value={unit.performanceCriteria}
                  onChange={(e) =>
                    updateUnitField(unit.id, "performanceCriteria", e.target.value)
                  }
                  placeholder="Type Here"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-primary">
                  Type of Evidence
                </label>
                <input
                  type="text"
                  value={unit.typeOfEvidence}
                  onChange={(e) =>
                    updateUnitField(unit.id, "typeOfEvidence", e.target.value)
                  }
                  placeholder="Type Here"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-primary">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={unit.description}
                  onChange={(e) =>
                    updateUnitField(unit.id, "description", e.target.value)
                  }
                  placeholder="Type Here"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-xs font-semibold text-neutral-primary">
                  Status
                </span>

                <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 bg-white p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      updateUnitField(unit.id, "status", "Satisfied")
                    }
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      unit.status === "Satisfied"
                        ? "bg-[#8A1538] text-white"
                        : "text-neutral-secondary hover:text-neutral-primary"
                    }`}
                  >
                    Satisfied
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateUnitField(unit.id, "status", "Not Satisfied")
                    }
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      unit.status === "Not Satisfied"
                        ? "bg-[#8A1538] text-white"
                        : "text-neutral-secondary hover:text-neutral-primary"
                    }`}
                  >
                    Not Satisfied
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddUnit}
            className="self-start text-[#A31D38] hover:text-[#8A1538] font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 mt-1"
          >
            + Add Another Unit
          </button>
        </div>
      </div>

      {/* 3. Signature Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-bold text-neutral-primary">
          Signature
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Assessor Signature<span className="text-rose-500">*</span>
            </label>
            {assessorSigned ? (
              <div className="h-11 bg-[#E6F4EA] border border-[#1E7F4C]/30 text-[#1E7F4C] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 select-none shadow-2xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#1E7F4C]"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Signed
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAppendSignature}
                className="h-11 bg-[#FFF8EB] border border-[#FBAB2A] hover:bg-[#FDEED5] text-[#FBAB2A] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#FBAB2A]"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Append Signature
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-primary">
              Candidate Signature<span className="text-rose-500">*</span>
            </label>
            <div className="h-11 bg-[#FFF8EB] border border-[#FBAB2A]/60 text-[#FBAB2A] font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 select-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-[#FBAB2A]"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Awaiting Signature
            </div>
          </div>
        </div>
      </div>
    </AssessorAssessmentFormLayout>
  );
};
