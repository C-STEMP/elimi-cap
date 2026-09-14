"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiDownload, FiPrinter } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { useGetApplicationById } from "@/src/features/candidate/features/Application/hooks";
import { downloadFormElement, printFormElement } from "@/src/lib/formPrintDownload";
import { CandidateFormCard } from "@/src/features/assessment-centre/features/Applications/components/CandidateFormCard";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  applicationId,
}) => {
  const { data: apiApp, isLoading } = useGetApplicationById(applicationId);

  if (!isOpen) return null;

  const appData = (apiApp as any)?.data || (apiApp as any) || {};
  const formDownloadName = `Application_Form_${(appData?.candidate?.name || "Candidate").replace(/\s+/g, "_")}`;
  const formTitle = `Application Form - ${appData?.candidate?.name || "Candidate"}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-[#F8F9FA] rounded-[28px] max-w-5xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200/80 bg-white shrink-0">
            <h3 className="text-base sm:text-lg font-bold text-black">
              Candidate Application Form
            </h3>

            <div className="flex items-center gap-3">
              <a
                href="#"
                download={formDownloadName}
                onClick={(e) => {
                  e.preventDefault();
                  downloadFormElement("printable-application-card", formDownloadName);
                }}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span>Download</span>
                <FiDownload className="w-3.5 h-3.5 text-gray-500" />
              </a>

              <button
                type="button"
                onClick={() => printFormElement("printable-application-card", formTitle)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span>Print</span>
                <FiPrinter className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                size="icon"
                rounded="full"
                aria-label="Close"
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black cursor-pointer"
                leftIcon={<FiX className="w-4 h-4 stroke-[2.5]" />}
              />
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {isLoading ? (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col gap-8 animate-pulse">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-gray-100 pb-6 w-full">
                  <div className="hidden sm:block w-28 sm:w-32 shrink-0" />
                  <div className="flex flex-col items-center gap-3 flex-1 max-w-lg mx-auto w-full">
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>
                  <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl bg-gray-200 shrink-0" />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="h-4 w-48 bg-gray-200 rounded" />
                    <div className="flex flex-col gap-2.5">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="h-3 bg-gray-100 rounded w-full max-w-md" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CandidateFormCard
                appDetail={appData}
                className="w-full flex flex-col gap-6 printable-application-card"
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
