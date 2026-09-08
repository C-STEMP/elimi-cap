"use client";

import React, { useState } from "react";
import { FiX, FiTrash2, FiPlus, FiEdit3, FiCheck } from "react-icons/fi";

export interface ObservationRequestDetails {
  units: string[];
  date: string;
  time: string;
  country: string;
  state: string;
  lga: string;
  address: string;
  status: "pending" | "confirmed" | "rejected";
  requirements?: string[];
  isSigned?: boolean;
  rejectionReason?: string;
}

interface NsqAssessorObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: ObservationRequestDetails;
  onAccept: (updated: { requirements: string[]; isSigned: boolean }) => void;
  onReject: () => void;
}

export const NsqAssessorObservationModal: React.FC<
  NsqAssessorObservationModalProps
> = ({ isOpen, onClose, details, onAccept, onReject }) => {
  const [requirements, setRequirements] = useState<string[]>(
    details.requirements && details.requirements.length > 0
      ? details.requirements
      : ["Candidate must be equipped with complete safety gear (PPE)."],
  );
  const [newRequirement, setNewRequirement] = useState("");
  const [isSigned, setIsSigned] = useState(details.isSigned ?? false);

  if (!isOpen) return null;

  const handleAddRequirement = () => {
    if (!newRequirement.trim()) return;
    setRequirements((prev) => [...prev, newRequirement.trim()]);
    setNewRequirement("");
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAppendSignature = () => {
    setIsSigned(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 select-text">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Observation Request
          </h3>
          <p className="text-xs sm:text-sm text-neutral-secondary font-normal mt-1">
            Review the candidate&apos;s request details below
          </p>
        </div>

        {/* Units For Assessment */}
        <div className="flex flex-col gap-1.5 mb-4">
          <span className="text-xs font-semibold text-neutral-primary">
            Units For Assessment
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {details.units.map((unit, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-rose-50 border border-rose-100 text-[#a31d38] font-bold text-[11px] rounded-lg"
              >
                {unit}
              </span>
            ))}
          </div>
        </div>

        {/* Observation Details Box */}
        <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 mb-5 text-xs">
          <div>
            <span className="px-2.5 py-0.5 bg-amber-50 text-[#fbab2a] font-bold text-[10px] rounded-md border border-amber-100">
              Pending
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                TIME
              </span>
              <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                {details.time || "12:00PM"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                DATE
              </span>
              <span className="font-bold text-neutral-primary text-xs mt-0.5 block">
                {details.date || "22/03/2026"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                COUNTRY
              </span>
              <span className="font-bold text-neutral-primary text-xs mt-0.5 block truncate">
                {details.country || "Nigeria"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                STATE
              </span>
              <span className="font-bold text-neutral-primary text-xs mt-0.5 block truncate">
                {details.state || "Abuja"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                LGA
              </span>
              <span className="font-bold text-neutral-primary text-xs mt-0.5 block truncate">
                {details.lga || "Bwari"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              ADDRESS
            </span>
            <span className="font-medium text-neutral-primary text-xs mt-0.5 block">
              {details.address || "3 Abbey Street, Kubwa Expressway"}
            </span>
          </div>
        </div>

        {/* Observation Requirements */}
        <div className="flex flex-col gap-2 mb-5">
          <label className="text-xs font-semibold text-neutral-primary">
            Observation Requirement<span className="text-rose-500">*</span>
          </label>

          {requirements.map((req, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-neutral-primary"
            >
              <span className="truncate pr-2">{req}</span>
              <button
                type="button"
                onClick={() => handleRemoveRequirement(idx)}
                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer transition-colors"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddRequirement();
                }
              }}
              placeholder="Type Here"
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBAB2A]/40"
            />
            <button
              type="button"
              onClick={handleAddRequirement}
              className="w-10 h-10 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl flex items-center justify-center cursor-pointer transition-all shrink-0"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Signature */}
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-xs font-semibold text-neutral-primary">
            Signature<span className="text-rose-500">*</span>
          </label>

          {isSigned ? (
            <div className="w-full h-11 border-2 border-emerald-500 bg-emerald-50/60 rounded-xl flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs select-none">
              <FiCheck className="w-4 h-4" />
              <span>Signed</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAppendSignature}
              className="w-full h-11 border border-[#FBAB2A] bg-amber-50/40 text-[#FBAB2A] hover:bg-amber-50 rounded-xl flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-colors"
            >
              <FiEdit3 className="w-4 h-4" />
              <span>Append Signature</span>
            </button>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onReject}
            className="h-11 border border-rose-500 text-rose-500 hover:bg-rose-50 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => onAccept({ requirements, isSigned })}
            disabled={!isSigned}
            className="h-11 bg-[#FBAB2A] hover:bg-[#E89B1F] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
