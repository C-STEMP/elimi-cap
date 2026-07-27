"use client";

import React from "react";
import { ProfileFormData } from "../types/settings.types";

interface NotificationPrefSectionProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
}

export const NotificationPrefSection: React.FC<
  NotificationPrefSectionProps
> = ({ formData, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg lg:text-xl font-bold text-[#1e1e1e]">
        Notification Preference
      </h2>
      <div className="flex flex-col gap-3">
        {/* Email Notifications Toggle */}
        <div className="bg-[#f5f6fa] rounded-xl p-4 flex items-center justify-between transition-colors">
          <div className="flex flex-col">
            <span className="font-bold text-[#1e1e1e] text-sm">
              Email Notifications
            </span>
            <span className="text-xs text-[#7a6b6e] mt-0.5">
              Receive notification via email
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.emailNotifications}
            onClick={() =>
              onChange("emailNotifications", !formData.emailNotifications)
            }
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.emailNotifications ? "bg-[#a31d38]" : "bg-[#eac2cb]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                formData.emailNotifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Session Reminders Toggle */}
        <div className="bg-[#f5f6fa] rounded-xl p-4 flex items-center justify-between transition-colors">
          <div className="flex flex-col">
            <span className="font-bold text-[#1e1e1e] text-sm">
              Session Reminders
            </span>
            <span className="text-xs text-[#7a6b6e] mt-0.5">
              24h and 1h before sessions
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.sessionReminders}
            onClick={() =>
              onChange("sessionReminders", !formData.sessionReminders)
            }
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.sessionReminders ? "bg-[#a31d38]" : "bg-[#eac2cb]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                formData.sessionReminders ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
