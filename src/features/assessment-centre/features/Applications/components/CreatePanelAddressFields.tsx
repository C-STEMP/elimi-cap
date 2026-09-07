"use client";

import React from "react";
import { Select } from "@/src/components/ui/select";

interface Props {
  interviewMode: "Physical" | "Online";
  sameAsCentreAddress: boolean;
  setSameAsCentreAddress: (val: boolean) => void;
  selectedCountry: string;
  setSelectedCountry: (val: string) => void;
  selectedState: string;
  setSelectedState: (val: string) => void;
  selectedLga: string;
  setSelectedLga: (val: string) => void;
  streetAddress: string;
  setStreetAddress: (val: string) => void;
  meetingLink: string;
  setMeetingLink: (val: string) => void;
  countries: any[];
  states: any[];
  lgas: any[];
}

export const CreatePanelAddressFields: React.FC<Props> = ({
  interviewMode,
  sameAsCentreAddress,
  setSameAsCentreAddress,
  selectedCountry,
  setSelectedCountry,
  selectedState,
  setSelectedState,
  selectedLga,
  setSelectedLga,
  streetAddress,
  setStreetAddress,
  meetingLink,
  setMeetingLink,
  countries,
  states,
  lgas,
}) => {
  if (interviewMode === "Online") {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        <label className="text-xs font-semibold text-gray-700">Meeting Link</label>
        <input
          type="text"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          placeholder="https://meet.google.com/abc-defg-hij"
          required
          className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-1">
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={sameAsCentreAddress}
          onChange={(e) => setSameAsCentreAddress(e.target.checked)}
          className="w-4.5 h-4.5 rounded text-[#A31D38] accent-[#A31D38] border-gray-300 focus:ring-[#A31D38] cursor-pointer"
        />
        <span className="text-xs sm:text-sm font-medium text-gray-700">Same as centre address</span>
      </label>

      {!sameAsCentreAddress && (
        <div className="flex flex-col gap-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              options={countries.length > 0 ? countries.map((c) => ({ label: c.label, value: c.label })) : ["Nigeria"]}
            />
            <Select
              label="State of Residence"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              options={states.length > 0 ? states.map((s) => ({ label: s.label, value: s.label })) : ["Abuja (FCT)", "Lagos"]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Local Government Area"
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
              options={lgas.length > 0 ? lgas.map((l) => ({ label: l.label, value: l.label })) : ["Abuja Municipal"]}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Street Address</label>
              <input
                type="text"
                placeholder="Street Address"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
