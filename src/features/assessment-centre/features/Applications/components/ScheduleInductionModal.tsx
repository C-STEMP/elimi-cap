"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { useScheduleInductionState } from "../hooks/useScheduleInductionState";
import { ConfirmCreatePanelModal } from "./ConfirmCreatePanelModal";
import { CreatePanelSuccessModal } from "./CreatePanelSuccessModal";

interface ScheduleInductionModalProps {
  isOpen: boolean;
  modalKey?: string;
  onClose: () => void;
  onSuccess?: () => void;
  initialApplicationId?: string;
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
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 my-auto text-left max-h-[90vh] flex flex-col"
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 bg-[#FCE8EC] hover:bg-[#FAD1D8] rounded-xl flex items-center justify-center text-[#A31D38] cursor-pointer absolute top-6 right-6 transition-colors select-none z-10"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="text-center mb-6 pr-6 shrink-0">
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">
                  Schedule Induction
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Schedule induction session for paid RPL candidates (shared start time)
                </p>
              </div>

              <form onSubmit={s.handleTriggerSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
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
                      Start Time (Shared)
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

                <div className="flex flex-col gap-2 pt-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Candidates (Paid RPL Applications)
                  </label>
                  {s.selectedCandidates.length > 0 && (
                    <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                      {s.selectedCandidates.map((cand) => (
                        <div
                          key={cand.applicationId}
                          className="flex items-center gap-2 w-full"
                        >
                          <div className="flex-1 h-10 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-xs sm:text-sm text-gray-900 font-medium flex items-center justify-between truncate">
                            <span className="truncate font-semibold">{cand.name}</span>
                            <span className="text-[11px] text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-md ml-2 shrink-0">
                              {cand.tradeName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => s.handleRemoveCandidate(cand.applicationId)}
                            className="w-10 h-10 bg-[#FCE8EC] hover:bg-[#FAD1D8] text-[#A31D38] rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0"
                          >
                            <FiX className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {s.unselectedCandidates.length > 0 ? (
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1">
                        <Select
                          placeholder="Select paid RPL candidate to add..."
                          value={s.candidatePickerId}
                          onChange={(e) => s.handleSelectCandidate(e.target.value)}
                          options={s.unselectedCandidates.map((c) => ({
                            label: c.label,
                            value: c.value,
                          }))}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={s.handleAddCandidate}
                        disabled={!s.candidatePickerId}
                        className="w-11 h-11 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-xs transition-all shrink-0"
                      >
                        <FiPlus className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">
                      {s.selectedCandidates.length > 0
                        ? "All eligible paid RPL candidates have been selected."
                        : "No unassigned paid RPL candidates available right now."}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={s.isSubmitting}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.99] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-3 cursor-pointer transition-all shadow-md shadow-amber-500/20 select-none disabled:opacity-50 shrink-0"
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

