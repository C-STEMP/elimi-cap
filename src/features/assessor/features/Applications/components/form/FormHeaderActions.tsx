"use client";

import React from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";

interface FormHeaderActionsProps {
  onDownload?: () => void;
  onPrint?: () => void;
}

export const FormHeaderActions: React.FC<FormHeaderActionsProps> = ({
  onDownload = () => window.print(),
  onPrint = () => window.print(),
}) => {
  return (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onDownload}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-neutral-primary font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
      >
        <span>Download</span>
        <FiDownload className="w-4 h-4 text-gray-500" />
      </button>

      <button
        type="button"
        onClick={onPrint}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-neutral-primary font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
      >
        <span>Print</span>
        <FiPrinter className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};
