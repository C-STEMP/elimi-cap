"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import { FiCalendar, FiClock, FiMapPin, FiX } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";

interface NsqRequestObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeName?: string;
  onRequestSubmitted?: (details: { date: string; time: string; mode: string; notes: string }) => void;
}

export const NsqRequestObservationModal: React.FC<NsqRequestObservationModalProps> = ({
  isOpen,
  onClose,
  tradeName = "Trade",
  onRequestSubmitted,
}) => {
  const { toast } = useToast();
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("10:00 AM");
  const [mode, setMode] = useState("physical");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!preferredDate) {
      toast({
        type: "error",
        title: "Date Required",
        description: "Please pick a preferred observation date.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        type: "success",
        title: "Observation Requested",
        description: `Your observation request for ${tradeName} has been sent to your assessor.`,
      });
      onRequestSubmitted?.({
        date: preferredDate,
        time: preferredTime,
        mode,
        notes,
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
      width={480}
      styles={{
        body: {
          padding: 16,
        },
      }}
    >
      <div className="relative flex flex-col gap-5 p-2 sm:p-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-0 right-0 w-8 h-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors"
          title="Close modal"
        >
          <FiX className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
            <FiCalendar className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Request Observation
          </h3>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1 max-w-xs">
            Schedule a practical direct observation assessment with your assigned assessor.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
              Preferred Date<span className="text-primary-solid ml-0.5">*</span>
            </label>
            <input
              type="date"
              value={preferredDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs font-semibold text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#fbab2a]/30 focus:border-[#fbab2a] transition-all cursor-pointer"
            />
          </div>

          <Select
            label={
              <span>
                Preferred Time Slot<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select Time"
            options={[
              { label: "Morning (09:00 AM - 12:00 PM)", value: "09:00 AM - 12:00 PM" },
              { label: "Afternoon (01:00 PM - 04:00 PM)", value: "01:00 PM - 04:00 PM" },
              { label: "Late Afternoon (04:00 PM - 06:00 PM)", value: "04:00 PM - 06:00 PM" },
            ]}
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
          />

          <Select
            label={
              <span>
                Observation Location Mode<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select Mode"
            options={[
              { label: "Physical (At Assessment Centre)", value: "physical" },
              { label: "Candidate Workplace / Site Observation", value: "site" },
              { label: "Online Live Stream Observation", value: "online" },
            ]}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
              Candidate Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide any additional details or specific units/tasks to demonstrate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs font-medium text-neutral-primary focus:outline-none focus:ring-2 focus:ring-[#fbab2a]/30 focus:border-[#fbab2a] transition-all resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={isSubmitting}
            className="w-full h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md mt-2 cursor-pointer"
          >
            Submit Request
          </Button>
        </form>
      </div>
    </Modal>
  );
};
