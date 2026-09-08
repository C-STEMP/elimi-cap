"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { useScheduleInterviewState } from "../hooks/useScheduleInterviewState";
import { ConfirmScheduleInterviewModal } from "./ConfirmScheduleInterviewModal";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (scheduledData?: any) => void;
  initialApplicationId?: string;
  initialCandidateName?: string;
  initialTradeName?: string;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ isOpen, onClose, ...props }) => {
  const s = useScheduleInterviewState({ isOpen, onClose, ...props });
  if (!isOpen && !s.isConfirmOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !s.isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto py-6 sm:py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 my-auto text-left max-h-[90vh] flex flex-col"
            >
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 bg-[#FCE8EC] hover:bg-[#FAD1D8] rounded-xl flex items-center justify-center text-[#A31D38] cursor-pointer absolute top-6 right-6 transition-colors z-10"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div className="text-center mb-4 pr-6 shrink-0">
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">Schedule Interview</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Schedule interview for selected candidates</p>
              </div>
              <form onSubmit={s.handleTriggerSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
                <Select
                  label="Select Interview"
                  placeholder={s.isLoadingInterviews ? "Loading interviews..." : "Select an Interview"}
                  value={s.selectedInterviewId}
                  onChange={(e) => s.setSelectedInterviewId(e.target.value)}
                  options={s.interviewOptions}
                />

                {s.selectedInterviewInfo && (
                  <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3.5 my-1 shrink-0">
                    {[
                      ["Interview", s.selectedInterviewInfo.title, "Assigned Panel", s.selectedInterviewInfo.panelName],
                      ["Mode", s.selectedInterviewInfo.mode, "Date & Time", s.selectedInterviewInfo.dateTime],
                      [s.selectedInterviewInfo.isOnline ? "Meeting Link" : "Location", s.selectedInterviewInfo.displayValue, "", ""],
                    ].map(([k1, v1, k2, v2], i) => (
                      <div key={i} className="grid grid-cols-2 gap-4">
                        {[[k1, v1], [k2, v2]].filter(([lbl]) => Boolean(lbl)).map(([label, value]) => (
                          <div key={String(label)} className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{label}</span>
                            <span className="text-xs font-bold text-gray-900 mt-0.5 truncate">{value}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {s.selectedInterviewInfo && (
                  <>
                    <Select
                      label="Filter by Trade"
                      placeholder="Filter by trade"
                      value={s.selectedTrade}
                      onChange={(e) => s.setSelectedTrade(e.target.value)}
                      options={s.tradeOptions.map((t) => ({ label: t, value: t }))}
                    />

                    <div className="flex flex-col gap-2.5">
                      <label className="text-xs font-semibold text-gray-700">
                        Select Candidates (in Interview Stage)
                      </label>
                      {s.candidateRows.length > 0 && (
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                          {s.candidateRows.map((cand) => (
                            <div key={cand.id} className="flex items-center gap-2 w-full">
                              <div className="flex-1 h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-xs sm:text-sm text-gray-900 font-medium flex items-center justify-between truncate">
                                <span className="truncate font-semibold">{cand.name}</span>
                                <span className="text-[11px] text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-md ml-2 shrink-0">{cand.tradeName}</span>
                              </div>
                              <input
                                type="time"
                                value={cand.time}
                                onChange={(e) => s.handleUpdateCandidateTime(cand.id, e.target.value)}
                                className="w-24 h-11 px-2 rounded-xl border border-gray-200 bg-[#F9FAFB] text-xs text-gray-800 outline-none text-center cursor-pointer font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => s.handleRemoveCandidate(cand.id)}
                                className="w-11 h-11 bg-[#FCE8EC] hover:bg-[#FAD1D8] text-[#A31D38] rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <FiX className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {s.unselectedCandidates.length > 0 ? (
                        <div className="flex items-center gap-2 w-full pt-1">
                          <div className="flex-1">
                            <Select
                              placeholder="Select candidate to add..."
                              value={s.candidatePickerId || ""}
                              onChange={(e) => s.handleSelectCandidate(e.target.value)}
                              options={s.unselectedCandidates.map((c) => ({ label: c.label, value: c.value }))}
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
                        <p className="text-[11px] text-gray-400 italic py-1">
                          {s.candidateRows.length > 0
                            ? "All eligible candidates in this trade have been added."
                            : "No eligible candidates in this trade."}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={!s.selectedInterviewId || s.candidateRows.length === 0 || s.isSubmitting}
                  className={`w-full font-bold text-sm sm:text-base h-12.5 rounded-xl mt-2 shrink-0 transition-all select-none ${
                    s.selectedInterviewId && s.candidateRows.length > 0
                      ? "bg-[#8B182E] hover:bg-[#701224] text-white cursor-pointer shadow-md shadow-red-900/20"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Schedule Interview
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmScheduleInterviewModal
        isOpen={s.isConfirmOpen}
        isSubmitting={s.isSubmitting}
        candidateCount={s.candidateRows.length}
        onConfirm={s.handleFinalConfirm}
        onCancel={() => s.setIsConfirmOpen(false)}
      />
    </>
  );
};
