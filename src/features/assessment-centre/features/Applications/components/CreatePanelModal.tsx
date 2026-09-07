"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { useCreatePanelState } from "../hooks/useCreatePanelState";
import { ConfirmCreatePanelModal } from "./ConfirmCreatePanelModal";
import { CreatePanelSuccessModal } from "./CreatePanelSuccessModal";

interface CreatePanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePanelModal: React.FC<CreatePanelModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const s = useCreatePanelState(props);

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
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">Create Panel</h3>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">Select lead panelist, panel member and internal verifier</p>
              </div>

              <form onSubmit={s.handleTriggerCreate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Panel Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Electrical Assessment Panel A"
                    value={s.title}
                    onChange={(e) => s.setTitle(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Brief note or description"
                    value={s.description}
                    onChange={(e) => s.setDescription(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
                  />
                </div>

                <Select
                  label="Lead Panelist *"
                  placeholder={s.isLoadingAssessors ? "Loading Assessors..." : "Select Lead Panelist"}
                  value={s.leadPanelistId}
                  onChange={(e) => s.setLeadPanelistId(e.target.value)}
                  options={s.assessorOptions
                    .filter((a) => a.value !== s.panelMemberId && a.value !== s.internalVerifierId)
                    .map((a) => ({ label: `${a.label} ${a.qualifications.length ? `(${a.qualifications.join(", ")})` : ""}`, value: a.value }))}
                />

                <Select
                  label="Panel Member *"
                  placeholder={s.isLoadingAssessors ? "Loading Assessors..." : "Select Panel Member"}
                  value={s.panelMemberId}
                  onChange={(e) => s.setPanelMemberId(e.target.value)}
                  options={s.assessorOptions
                    .filter((a) => a.value !== s.leadPanelistId && a.value !== s.internalVerifierId)
                    .map((a) => ({ label: `${a.label} ${a.qualifications.length ? `(${a.qualifications.join(", ")})` : ""}`, value: a.value }))}
                />

                <Select
                  label="Internal Verifier *"
                  placeholder={s.isLoadingAssessors ? "Loading Assessors..." : "Select Internal Verifier"}
                  value={s.internalVerifierId}
                  onChange={(e) => s.setInternalVerifierId(e.target.value)}
                  options={s.assessorOptions
                    .filter((a) => a.value !== s.leadPanelistId && a.value !== s.panelMemberId)
                    .map((a) => ({ label: `${a.label} ${a.qualifications.length ? `(${a.qualifications.join(", ")})` : ""}`, value: a.value }))}
                />

                <button
                  type="submit"
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.99] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-3 cursor-pointer transition-all shadow-md shadow-amber-500/20 select-none"
                >
                  Create Panel
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmCreatePanelModal
        isOpen={s.isConfirmOpen}
        isSubmitting={s.isSubmitting}
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
