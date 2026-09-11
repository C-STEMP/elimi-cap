"use client";

import React from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { downloadFormElement, printFormElement } from "@/src/lib/formPrintDownload";

interface FormHeaderActionsProps {
  formName?: string;
  elementId?: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const FormHeaderActions: React.FC<FormHeaderActionsProps> = ({
  formName = "Candidate_Application_Form",
  elementId = "printable-application-card",
  onDownload,
  onPrint,
}) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDownload) {
      onDownload();
    } else {
      downloadFormElement(elementId, formName);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      printFormElement(elementId, formName.replace(/_/g, " "));
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0 no-print">
      <a
        href="#"
        download={formName}
        onClick={handleDownload}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-neutral-primary font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl inline-flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
      >
        <span>Download</span>
        <FiDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
      </a>

      <button
        type="button"
        onClick={handlePrint}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-neutral-primary font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl inline-flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
      >
        <span>Print</span>
        <FiPrinter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
      </button>
    </div>
  );
};
