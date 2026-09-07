"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { usePanelistModalState } from "../hooks/usePanelistModalState";

export interface ScheduledPanelistInfo {
  trade: string;
  leadAssessor: { id: string; name: string; avatar?: string; role?: string; tags?: string[]; isHighlighted?: boolean };
  panelMembers: { id: string; name: string; avatar?: string; role?: string; tags?: string[]; isHighlighted?: boolean }[];
  internalVerifier: { id: string; name: string; avatar?: string; role?: string; tags?: string[] };
  date: string;
  time: string;
  mode: "physical" | "virtual";
  location?: string;
  meetingLink?: string;
  useCompanyAddress?: boolean;
}

interface AssignPanelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  tradeName?: string;
  initialSchedule?: { scheduledAt?: string; mode?: string; location?: string; link?: string; useCentreAddress?: boolean } | null;
  initialPanel?: { members?: { assessorId: string; isLead: boolean; isObserver?: boolean; name?: string }[] } | null;
  onSuccess: (data: ScheduledPanelistInfo) => void;
}

export const AssignPanelistModal: React.FC<AssignPanelistModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const s = usePanelistModalState(props);

  if (!isOpen && !s.isSuccessOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !s.isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto py-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 my-auto text-left">
              <button type="button" onClick={onClose} className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer absolute top-6 right-6 transition-colors"><FiX className="w-5 h-5 stroke-[2.5]" /></button>
              <div className="text-center mb-6 pr-6">
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">Assign Panelist</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Assign panelist to this candidate</p>
              </div>
              <form onSubmit={s.handleSubmit} className="flex flex-col gap-4">
                <Select label="Trade" placeholder="Select" value={s.selectedTrade} onChange={(e) => s.setSelectedTrade(e.target.value)} options={[s.selectedTrade || props.tradeName, "Carpentry", "Masonry", "Plumbing", "Electrical Installation", "Painting & Decorating", "Welding & Fabrication"].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i) as string[]} />
                <Select label="Lead Panelist" placeholder={s.isLoadingAssessors ? "Loading..." : "Select"} value={s.leadPanelistId} onChange={(e) => s.setLeadPanelistId(e.target.value)} options={s.assessorOptions.map((a) => ({ label: a.label, value: a.value }))} />
                <Select label="Panel Member" placeholder={s.isLoadingAssessors ? "Loading..." : "Select"} value={s.panelMemberId} onChange={(e) => s.setPanelMemberId(e.target.value)} options={s.assessorOptions.filter((a) => a.value !== s.leadPanelistId).map((a) => ({ label: a.label, value: a.value }))} />
                <Select label="Internal Verifier" placeholder={s.isLoadingAssessors ? "Loading..." : "Select"} value={s.internalVerifierId} onChange={(e) => s.setInternalVerifierId(e.target.value)} options={s.assessorOptions.map((a) => ({ label: a.label, value: a.value }))} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-gray-700">Date</label><input type="date" value={s.date} onChange={(e) => s.setDate(e.target.value)} required className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm outline-none focus:border-[#fbab2a] transition-all cursor-pointer" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-gray-700">Time</label><input type="time" value={s.time} onChange={(e) => s.setTime(e.target.value)} required className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm outline-none focus:border-[#fbab2a] transition-all cursor-pointer" /></div>
                </div>
                <Select label="Interview Mode" value={s.interviewMode} onChange={(e) => s.setInterviewMode(e.target.value === "Virtual" ? "Virtual" : "Physical")} options={["Physical", "Virtual"]} />
                {s.interviewMode === "Physical" && (
                  <div className="flex flex-col gap-3 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none"><input type="checkbox" checked={s.sameAsCompanyAddress} onChange={(e) => s.setSameAsCompanyAddress(e.target.checked)} className="w-4.5 h-4.5 rounded accent-[#a31d38] cursor-pointer" /><span className="text-xs sm:text-sm font-medium text-gray-700">Same as company address</span></label>
                    {!s.sameAsCompanyAddress && (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Select label="Country" value={s.selectedCountry} onChange={(e) => s.setSelectedCountry(e.target.value)} options={s.countries.length > 0 ? s.countries.map((c) => ({ label: c.label, value: c.label })) : ["Nigeria"]} />
                          <Select label="State" value={s.selectedState} onChange={(e) => s.setSelectedState(e.target.value)} options={s.states.length > 0 ? s.states.map((st) => ({ label: st.label, value: st.label })) : ["Abuja (FCT)", "Lagos"]} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Select label="LGA" value={s.selectedLga} onChange={(e) => s.setSelectedLga(e.target.value)} options={s.lgas.length > 0 ? s.lgas.map((l) => ({ label: l.label, value: l.label })) : ["Abuja Municipal"]} />
                          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-gray-700">Street Address</label><input type="text" placeholder="Street Address" value={s.streetAddress} onChange={(e) => s.setStreetAddress(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm outline-none focus:border-[#fbab2a] transition-all" /></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {s.interviewMode === "Virtual" && (
                  <div className="flex flex-col gap-1.5 pt-1"><label className="text-xs font-semibold text-gray-700">Meeting Link</label><input type="text" value={s.meetingLink} onChange={(e) => s.setMeetingLink(e.target.value)} placeholder="www.meet.google.com" required className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm outline-none focus:border-[#fbab2a] transition-all" /></div>
                )}
                <Button type="submit" variant="secondary" size="md" disabled={s.isSubmitting} className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold h-12.5 rounded-xl mt-4 cursor-pointer">{s.isSubmitting ? "Scheduling Interview..." : "Schedule Interview"}</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.22 }} className="bg-white rounded-[28px] p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl border border-gray-100">
              <div className="relative mb-6"><div className="w-22 h-22 rounded-full bg-radial from-[#7CE05A] via-[#52B836] to-[#3B9B22] flex items-center justify-center shadow-lg shadow-green-600/30"><FiCheck className="w-11 h-11 text-white stroke-[3.5]" /></div></div>
              <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">Interview Scheduled Successfully</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-8 max-w-xs">You have successfully scheduled an interview for this candidate</p>
              <Button type="button" variant="secondary" size="md" onClick={s.handleContinue} className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold h-12.5 rounded-xl cursor-pointer">Continue</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
