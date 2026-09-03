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
    <div className="flex items-center justify-end gap-3 w-full no-print">
      <a
        href="#"
        download={formName}
        onClick={handleDownload}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-neutral-primary font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
      >
        <span>Download</span>
        <FiDownload className="w-4 h-4 text-gray-500" />
      </a>

      <button
        type="button"
        onClick={handlePrint}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-neutral-primary font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
      >
        <span>Print</span>
        <FiPrinter className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};
