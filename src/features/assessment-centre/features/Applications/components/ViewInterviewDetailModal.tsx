"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCalendar, FiClock, FiMapPin, FiVideo, FiUser } from "react-icons/fi";

export interface InterviewRowData {
  id: string;
  title: string;
  leadPanelist: string;
  panelMember: string;
  internalVerifier: string;
  mode: "Physical" | "Online" | string;
  createdAt: string;
  scheduledAt?: string;
  location?: string;
  link?: string;
}

interface ViewInterviewDetailModalProps {
  isOpen: boolean;
  interview: InterviewRowData | null;
  onClose: () => void;
}

export const ViewInterviewDetailModal: React.FC<ViewInterviewDetailModalProps> = ({
  isOpen,
  interview,
  onClose,
}) => {
  if (!isOpen || !interview) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 text-left"
        >
          {/* Close button with light pink pill and maroon cross */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 bg-[#FCE8EC] hover:bg-[#FAD1D8] rounded-xl flex items-center justify-center text-[#A31D38] cursor-pointer absolute top-6 right-6 transition-colors select-none"
          >
            <FiX className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="mb-6 pr-6">
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Interview Template
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-2">
              {interview.title}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Created on {interview.createdAt}
            </p>
          </div>

          <div className="flex flex-col gap-4 divide-y divide-gray-100">
            {/* Panel Members List */}
            <div className="flex flex-col gap-3 pt-1">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Panel Composition
              </h4>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Lead Panelist</span>
                    <span className="text-sm font-bold text-gray-900">
                      {interview.leadPanelist}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-amber-500/10 text-amber-700 px-2.5 py-0.5 rounded-full">
                  Lead
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Panel Member</span>
                    <span className="text-sm font-bold text-gray-900">
                      {interview.panelMember}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-blue-500/10 text-blue-700 px-2.5 py-0.5 rounded-full">
                  Member
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">
                      Internal Verifier (IV)
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {interview.internalVerifier}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 rounded-full">
                  Observer
                </span>
              </div>
            </div>

            {/* Schedule & Mode Information */}
            <div className="flex flex-col gap-3 pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Sitting Details
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400">Date</span>
                    <span className="text-xs font-bold text-gray-800">
                      {interview.scheduledAt
                        ? new Date(interview.scheduledAt).toLocaleDateString("en-GB")
                        : interview.createdAt}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400">Time</span>
                    <span className="text-xs font-bold text-gray-800">
                      {interview.scheduledAt
                        ? new Date(interview.scheduledAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "10:00 AM"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                {interview.mode.toLowerCase() === "online" ? (
                  <>
                    <FiVideo className="w-4 h-4 text-[#A31D38] mt-0.5 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] text-gray-400">Mode: Online</span>
                      <a
                        href={interview.link || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#A31D38] hover:underline truncate"
                      >
                        {interview.link || "Meeting link provided"}
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <FiMapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400">Mode: Physical</span>
                      <span className="text-xs font-bold text-gray-800">
                        {interview.location || "Cstemp Centre Address"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
