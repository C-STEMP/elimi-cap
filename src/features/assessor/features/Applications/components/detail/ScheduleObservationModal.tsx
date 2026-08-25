"use client";

import React, { useState } from "react";
import { FiX, FiCalendar, FiClock } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

interface ScheduleObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (data: { date: string; time: string; location: string }) => void;
}

export const ScheduleObservationModal: React.FC<
  ScheduleObservationModalProps
> = ({ isOpen, onClose, onSchedule }) => {
  const [date, setDate] = useState("2026-03-22");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState("Cstemp Centre");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule({
      date: date || "22/03/2026",
      time: time || "12:00PM",
      location: location || "Cstemp Centre",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 select-text">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="flex flex-col text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Schedule Observation
          </h3>
          <p className="text-xs sm:text-sm text-neutral-secondary font-normal mt-1">
            Choose a day for physical observation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-primary">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] focus:border-[#FBAB2A] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-primary">
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] focus:border-[#FBAB2A] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-primary">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Type address here"
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-neutral-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FBAB2A] focus:border-[#FBAB2A] transition-all"
            />
          </div>

          <Button
            type="submit"
            variant="amber"
            fullWidth
            className="h-12 bg-[#FBAB2A] hover:bg-[#E89B1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md cursor-pointer transition-all mt-2"
          >
            Schedule Observation
          </Button>
        </form>
      </div>
    </div>
  );
};
