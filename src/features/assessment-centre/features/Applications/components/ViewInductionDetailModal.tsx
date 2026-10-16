"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCalendar, FiClock, FiMapPin, FiVideo, FiFileText } from "react-icons/fi";

export interface InductionRowData {
  id: string;
  title: string;
  description: string;
  mode: "Physical" | "Virtual" | "Online" | string;
  createdAt: string;
  scheduledAt?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  country?: string;
  state?: string;
  lga?: string;
  streetAddress?: string;
  link?: string;
}

interface ViewInductionDetailModalProps {
  isOpen: boolean;
  induction: InductionRowData | null;
  onClose: () => void;
}

export const ViewInductionDetailModal: React.FC<ViewInductionDetailModalProps> = ({
  isOpen,
  induction,
  onClose,
}) => {
  if (!isOpen || !induction) return null;

  const isVirtual =
    induction.mode.toLowerCase() === "virtual" ||
    induction.mode.toLowerCase() === "online";

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
              Induction Session
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-2">
              {induction.title}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Created on {induction.createdAt}
            </p>
          </div>

          <div className="flex flex-col gap-4 divide-y divide-gray-100">
            {induction.description && induction.description !== "—" && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-700">
                <FiFileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{induction.description}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Schedule Details
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400">Date</span>
                    <span className="text-xs font-bold text-gray-800">
                      {induction.scheduledDate ||
                        (induction.scheduledAt
                          ? new Date(induction.scheduledAt).toLocaleDateString("en-GB")
                          : induction.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400">Time</span>
                    <span className="text-xs font-bold text-gray-800">
                      {induction.scheduledTime ||
                        (induction.scheduledAt
                          ? new Date(induction.scheduledAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                {isVirtual ? (
                  <>
                    <FiVideo className="w-4 h-4 text-[#A31D38] mt-0.5 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] text-gray-400">Mode: Virtual</span>
                      <a
                        href={induction.link || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#A31D38] hover:underline truncate"
                      >
                        {induction.link || "Meeting link provided"}
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <FiMapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400">Mode: Physical</span>
                      <span className="text-xs font-bold text-gray-800">
                        {induction.location || "Centre Address"}
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
