"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import { FiCalendar, FiClock, FiX, FiCheck } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";

interface NsqRequestObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeName?: string;
  onRequestSubmitted?: (details: {
    units: string[];
    date: string;
    time: string;
    country: string;
    state: string;
    lga: string;
    address: string;
  }) => void;
}

const AVAILABLE_UNITS = [
  { id: "unit-1", label: "UNIT 1" },
  { id: "unit-2", label: "UNIT 2" },
  { id: "unit-3", label: "UNIT 3" },
  { id: "unit-4", label: "UNIT 4" },
];

export const NsqRequestObservationModal: React.FC<NsqRequestObservationModalProps> = ({
  isOpen,
  onClose,
  tradeName = "Masonry",
  onRequestSubmitted,
}) => {
  const { toast } = useToast();

  const [selectedUnits, setSelectedUnits] = useState<string[]>([
    "UNIT 1",
    "UNIT 2",
    "UNIT 3",
  ]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [stateOfResidence, setStateOfResidence] = useState("");
  const [lga, setLga] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { countries, states, cities } = useCountryStateCity(
    country,
    stateOfResidence,
  );

  const countryOptions: SelectOption[] = countries.map((c) => ({
    label: c.label,
    value: c.value,
  }));

  const stateOptions: SelectOption[] = states.map((s) => ({
    label: s.label,
    value: s.value,
  }));

  const lgaOptions: SelectOption[] = cities.map((c) => ({
    label: c.label,
    value: c.value,
  }));

  const removeUnit = (u: string) => {
    setSelectedUnits((prev) => prev.filter((item) => item !== u));
  };

  const addUnit = (u: string) => {
    if (!selectedUnits.includes(u)) {
      setSelectedUnits((prev) => [...prev, u]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUnits.length === 0) {
      toast({
        type: "error",
        title: "Units Required",
        description: "Please select at least one unit for direct observation.",
      });
      return;
    }

    if (!date) {
      toast({
        type: "error",
        title: "Date Required",
        description: "Please select a date for the observation.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        type: "success",
        title: "Observation Scheduled",
        description: `Direct observation request for ${tradeName} submitted to your assessor.`,
      });

      onRequestSubmitted?.({
        units: selectedUnits,
        date,
        time: time || "10:00",
        country,
        state: stateOfResidence,
        lga,
        address: streetAddress,
      });

      onClose();
    }, 600);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={isSubmitting ? () => {} : onClose}
      footer={null}
      centered
      closable={false}
      width={540}
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <div className="relative flex flex-col gap-6 p-2 sm:p-4">
        {/* Pink Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-0 right-0 w-8 h-8 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 flex items-center justify-center cursor-pointer transition-colors"
          title="Close modal"
        >
          <FiX className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Request Direct Observation
          </h3>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1 max-w-xs">
            Send a direct observation request to assessor
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Select Unit (Multi-tag input) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
              Select Unit<span className="text-primary-solid ml-0.5">*</span>
            </label>
            <div className="min-h-12 w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#f8f9fa] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedUnits.map((u) => (
                  <span
                    key={u}
                    className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md"
                  >
                    {u}
                    <button
                      type="button"
                      onClick={() => removeUnit(u)}
                      className="hover:text-pink-900 cursor-pointer"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Add Options */}
              <div className="flex items-center gap-1">
                {AVAILABLE_UNITS.filter((u) => !selectedUnits.includes(u.label)).map(
                  (u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => addUnit(u.label)}
                      className="text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 px-2 py-0.5 rounded cursor-pointer"
                    >
                      + {u.label}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                Date<span className="text-primary-solid ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs font-semibold text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#fbab2a]/30 focus:border-[#fbab2a] transition-all cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                Time<span className="text-primary-solid ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs font-semibold text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#fbab2a]/30 focus:border-[#fbab2a] transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Country & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={
                <span>
                  Country<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={countryOptions}
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setStateOfResidence("");
                setLga("");
              }}
            />

            <Select
              label={
                <span>
                  State of Residence<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={stateOptions}
              value={stateOfResidence}
              onChange={(e) => {
                setStateOfResidence(e.target.value);
                setLga("");
              }}
            />
          </div>

          {/* LGA & Street Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={
                <span>
                  Local Government Area<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={
                lgaOptions.length > 0
                  ? lgaOptions
                  : [{ label: "Select State first", value: "" }]
              }
              value={lga}
              onChange={(e) => setLga(e.target.value)}
            />

            <Input
              label={
                <span>
                  Street Address<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Street Address"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
          </div>

          {/* Schedule Interview Button */}
          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={isSubmitting}
            className="w-full h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md mt-3 cursor-pointer"
          >
            Schedule Interview
          </Button>
        </form>
      </div>
    </Modal>
  );
};
