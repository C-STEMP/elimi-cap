"use client";

import React from "react";
import { ApplicationFormState, PaymentStatus } from "../types";

interface ApplicationDemoToolbarProps {
  formState: ApplicationFormState;
  paymentStatus: PaymentStatus;
  showCountdown: boolean;
  onSelectState: (state: ApplicationFormState, paymentStatus: PaymentStatus) => void;
  onToggleCountdown: () => void;
}

export const ApplicationDemoToolbar: React.FC<ApplicationDemoToolbarProps> = ({
  formState,
  paymentStatus,
  showCountdown,
  onSelectState,
  onToggleCountdown,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-2 mb-2">
      <div className="flex items-center gap-2 bg-gray-200/60 p-1.5 rounded-xl text-xs flex-wrap">
        <span className="text-gray-500 font-semibold px-2">
          Folder Arrangement State:
        </span>
        <button
          type="button"
          onClick={() => onSelectState("vault_3days", "completed")}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            formState === "vault_3days"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          3 Days Left (Image 1)
        </button>
        <button
          type="button"
          onClick={() => onSelectState("vault_ongoing", "completed")}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            formState === "vault_ongoing"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Ongoing (Image 4)
        </button>
        <button
          type="button"
          onClick={() => onSelectState("vault_delayed", "completed")}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            formState === "vault_delayed"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          23 Days Gone (Image 5)
        </button>
        <button
          type="button"
          onClick={() => onSelectState("approved", "not_started")}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            formState === "approved" && paymentStatus === "not_started"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Approved & Pay Fee
        </button>
      </div>

      <div className="flex items-center gap-1.5 bg-gray-200/60 p-1.5 rounded-xl text-xs flex-wrap">
        <span className="text-gray-500 font-semibold px-2">
          Facilitator Card:
        </span>
        <button
          type="button"
          onClick={onToggleCountdown}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            showCountdown
              ? "bg-white text-amber-700 font-bold shadow-2xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {showCountdown
            ? "Show Request Call Button"
            : "Show Countdown Timer 01:30:20 (Image 1)"}
        </button>
      </div>
    </div>
  );
};
