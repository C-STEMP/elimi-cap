"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import type { ApplicationDetail } from "@/src/features/shared/applications/api/types";

interface ProfileInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application?: ApplicationDetail | null;
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-gray-800 wrap-break-word">{value || "—"}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

const formatDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-GB");
};

/** The candidate's personal information, as captured on the onboarding form. */
export const ProfileInformationModal: React.FC<ProfileInformationModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  if (!isOpen) return null;

  const details = application?.personalInformation?.personalDetails;
  const contact = application?.personalInformation?.contactInformation;
  const address = application?.personalInformation?.residentialAddress;
  const occupation = application?.currentOccupation;

  const fullName =
    [details?.firstName, details?.middleName, details?.lastName].filter(Boolean).join(" ") ||
    application?.candidate?.name;
  const phone = contact?.phoneNumber?.number
    ? `${contact.phoneNumber.countryCode || ""} ${contact.phoneNumber.number}`.trim()
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-text">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              Candidate Profile
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Profile Information</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          <Group title="Personal Details">
            <Field label="Full Name" value={fullName} />
            <Field label="Date of Birth" value={formatDate(details?.dob)} />
            <Field label="Gender" value={details?.gender} />
            <Field label="Nationality" value={details?.nationality} />
          </Group>

          <Group title="Contact Information">
            <Field label="Email Address" value={contact?.emailAddress} />
            <Field label="Phone Number" value={phone} />
          </Group>

          <Group title="Residential Address">
            <Field label="Country" value={address?.country} />
            <Field label="State" value={address?.state} />
            <Field label="LGA" value={address?.lga} />
            <Field label="Address" value={address?.address} />
          </Group>

          {occupation && (
            <Group title="Current Occupation">
              <Field label="Occupation" value={occupation.occupation} />
              <Field
                label="Years of Experience"
                value={
                  typeof occupation.yearsOfExperience === "number"
                    ? String(occupation.yearsOfExperience)
                    : ""
                }
              />
            </Group>
          )}
        </div>
      </div>
    </div>
  );
};
