"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { useCreateInterviewState } from "../hooks/useCreateInterviewState";
import { CreatePanelAddressFields } from "./CreatePanelAddressFields";
import { ConfirmCreatePanelModal } from "./ConfirmCreatePanelModal";
import { CreatePanelSuccessModal } from "./CreatePanelSuccessModal";

interface CreateInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenCreatePanel?: () => void;
}

export const CreateInterviewModal: React.FC<CreateInterviewModalProps> = (props) => {
  const { isOpen, onClose, onOpenCreatePanel } = props;
  const s = useCreateInterviewState(props);

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
                  Create Interview
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Set interview title, schedule, mode, and assigned panel
                </p>
              </div>

              <form onSubmit={s.handleTriggerCreate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Interview Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mechanical Assessment Sitting A"
                    value={s.name}
                    onChange={(e) => s.setName(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">
                      Select Panel <span className="text-red-500">*</span>
                    </label>
                    {onOpenCreatePanel && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCreatePanel();
                        }}
                        className="text-xs text-[#A31D38] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <FiPlus className="w-3 h-3" />
                        Create New Panel
                      </button>
                    )}
                  </div>
                  <Select
                    placeholder={s.isLoadingPanels ? "Loading Panels..." : "Select a Panel"}
                    value={s.selectedPanelId}
                    onChange={(e) => s.setSelectedPanelId(e.target.value)}
                    options={s.panelOptions}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Date <span className="text-red-500">*</span>
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
                      Start Time <span className="text-red-500">*</span>
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
                  onChange={(e) => s.setInterviewMode(e.target.value === "Online" ? "Online" : "Physical")}
                  options={["Physical", "Online"]}
                />

                <CreatePanelAddressFields
                  interviewMode={s.interviewMode}
                  sameAsCentreAddress={s.sameAsCentreAddress}
                  setSameAsCentreAddress={s.setSameAsCentreAddress}
                  selectedCountry={s.selectedCountry}
                  setSelectedCountry={s.setSelectedCountry}
                  selectedState={s.selectedState}
                  setSelectedState={s.setSelectedState}
                  selectedLga={s.selectedLga}
                  setSelectedLga={s.setSelectedLga}
                  streetAddress={s.streetAddress}
                  setStreetAddress={s.setStreetAddress}
                  meetingLink={s.meetingLink}
                  setMeetingLink={s.setMeetingLink}
                  countries={s.countries}
                  states={s.states}
                  lgas={s.lgas}
                />

                <button
                  type="submit"
                  className="w-full bg-[#A31D38] hover:bg-[#8B182E] active:scale-[0.99] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-3 cursor-pointer transition-all shadow-md shadow-red-900/20 select-none"
                >
                  Create Interview
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmCreatePanelModal
        isOpen={s.isConfirmOpen}
        isSubmitting={s.isSubmitting}
        title="Create Interview?"
        description="Confirm you want to create this interview sitting template."
        onConfirm={s.handleFinalSubmit}
        onCancel={() => s.setIsConfirmOpen(false)}
      />

      <CreatePanelSuccessModal
        isOpen={s.isSuccessOpen}
        onContinue={s.handleContinueSuccess}
      />
    </>
  );
};
