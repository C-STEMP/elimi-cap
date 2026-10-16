"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { useScheduleInductionState } from "../hooks/useScheduleInductionState";
import { ConfirmCreatePanelModal } from "./ConfirmCreatePanelModal";
import { CreatePanelSuccessModal } from "./CreatePanelSuccessModal";

interface ScheduleInductionModalProps {
  isOpen: boolean;
  modalKey?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ScheduleInductionModal: React.FC<ScheduleInductionModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const s = useScheduleInductionState(props);

  if (!isOpen && !s.isConfirmOpen && !s.isSuccessOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !s.isConfirmOpen && !s.isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 my-auto text-left"
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 bg-[#FCE8EC] hover:bg-[#FAD1D8] rounded-xl flex items-center justify-center text-[#A31D38] cursor-pointer absolute top-6 right-6 transition-colors select-none"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="text-center mb-6 pr-6">
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">
                  Schedule Induction
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Schedule induction session for candidates
                </p>
              </div>

              <form onSubmit={s.handleTriggerSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    value={s.title}
                    onChange={(e) => s.setTitle(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    value={s.description}
                    onChange={(e) => s.setDescription(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      value={s.date}
                      onChange={(e) => s.setDate(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Time
                    </label>
                    <input
                      type="time"
                      value={s.time}
                      onChange={(e) => s.setTime(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium cursor-pointer"
                    />
                  </div>
                </div>

                <Select
                  label="Interview Mode"
                  value={s.interviewMode}
                  onChange={(e) =>
                    s.setInterviewMode(e.target.value === "Physical" ? "Physical" : "Virtual")
                  }
                  options={["Virtual", "Physical"]}
                />

                {s.interviewMode === "Virtual" ? (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Meeting Link
                    </label>
                    <input
                      type="text"
                      value={s.meetingLink}
                      onChange={(e) => s.setMeetingLink(e.target.value)}
                      placeholder="www.meet.google.com"
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={s.sameAsCompanyAddress}
                        onChange={(e) => s.setSameAsCompanyAddress(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-[#A31D38] accent-[#A31D38] border-gray-300 focus:ring-[#A31D38] cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-medium text-gray-800">
                        Same as company address
                      </span>
                    </label>

                    <div className="flex flex-col gap-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                          label="Country"
                          placeholder="Select"
                          value={s.selectedCountry}
                          onChange={(e) => {
                            s.setSameAsCompanyAddress(false);
                            s.setSelectedCountry(e.target.value);
                          }}
                          options={
                            s.countries.length > 0
                              ? s.countries.map((c) => ({ label: c.label, value: c.label }))
                              : ["Nigeria"]
                          }
                        />
                        <Select
                          label="State of Residence"
                          placeholder="Select"
                          value={s.selectedState}
                          onChange={(e) => {
                            s.setSameAsCompanyAddress(false);
                            s.setSelectedState(e.target.value);
                          }}
                          options={s.states.map((st) => ({ label: st.label, value: st.label }))}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                          label="Local Government Area"
                          placeholder="Select"
                          value={s.selectedLga}
                          onChange={(e) => {
                            s.setSameAsCompanyAddress(false);
                            s.setSelectedLga(e.target.value);
                          }}
                          options={
                            s.lgas.length > 0
                              ? s.lgas.map((l) => ({ label: l.label, value: l.label }))
                              : ["Abuja Municipal"]
                          }
                        />
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-700">
                            Street Address
                          </label>
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={s.streetAddress}
                            onChange={(e) => {
                              s.setSameAsCompanyAddress(false);
                              s.setStreetAddress(e.target.value);
                            }}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={s.isSubmitting}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.99] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-3 cursor-pointer transition-all shadow-md shadow-amber-500/20 select-none disabled:opacity-50"
                >
                  {s.isSubmitting ? "Scheduling Induction..." : "Schedule Induction"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmCreatePanelModal
        isOpen={s.isConfirmOpen}
        isSubmitting={s.isSubmitting}
        title="Schedule Induction?"
        description="Confirm you want to schedule this induction session."
        confirmText="Yes, Schedule"
        submittingText="Scheduling..."
        onConfirm={s.handleFinalSubmit}
        onCancel={() => s.setIsConfirmOpen(false)}
      />

      <CreatePanelSuccessModal
        isOpen={s.isSuccessOpen}
        description="You have successfully scheduled an induction"
        onContinue={s.handleContinueSuccess}
      />
    </>
  );
};
