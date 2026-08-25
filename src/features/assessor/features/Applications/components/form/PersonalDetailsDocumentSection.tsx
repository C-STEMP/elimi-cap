"use client";

import React from "react";
import Image from "next/image";
import { FiCheck, FiUpload } from "react-icons/fi";
import { ASSETS_URL } from "@/src/assets";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";

interface PersonalDetailsDocumentSectionProps {
  candidateName: string;
  trade: string;
  applicationDetail?: ApplicationDetail | null;
}

export const PersonalDetailsDocumentSection: React.FC<
  PersonalDetailsDocumentSectionProps
> = ({ candidateName, trade, applicationDetail }) => {
  const pDetails = applicationDetail?.personalInformation?.personalDetails;
  const cInfo = applicationDetail?.personalInformation?.contactInformation;
  const rAddr = applicationDetail?.personalInformation?.residentialAddress;
  const evidence = applicationDetail?.evidenceCandidateCanProvide;

  const fullName =
    applicationDetail?.candidate?.name ||
    (pDetails?.firstName
      ? `${pDetails.firstName} ${pDetails.lastName || ""}`.trim()
      : candidateName);

  const dob = pDetails?.dob || "—";
  const address = rAddr
    ? [rAddr.address, rAddr.state, rAddr.country].filter(Boolean).join(", ")
    : "—";
  const phone = cInfo?.phoneNumber?.number
    ? `${cInfo.phoneNumber.countryCode || "+234"} ${cInfo.phoneNumber.number}`
    : "—";
  const email = cInfo?.emailAddress || "—";
  const qualTitle = applicationDetail?.trade?.name || trade || "—";

  const evidenceItems = [
    { key: "resume", label: "Resume / CV", checked: true },
    { key: "workSamples", label: "Work Samples", checked: true },
    {
      key: "certificates",
      label: "Certificates / Statements of Attainment",
      checked: true,
    },
    {
      key: "thirdPartyReports",
      label: "References / Third-Party Reports",
      checked: true,
    },
    { key: "jobDescriptions", label: "Job Descriptions", checked: true },
    {
      key: "photosVideos",
      label: "Photos / Videos of Work",
      checked: true,
    },
    { key: "other", label: "Other (please specify):", checked: false },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs flex flex-col gap-8 w-full">
      {/* Header with Logo, Title & Upload Box */}
      <div className="flex flex-col items-center text-center gap-4 relative border-b border-gray-100 pb-6">
        <div className="flex justify-center mb-1">
          <Image
            src={ASSETS_URL.logoIcon2}
            alt="ELIMI Logo"
            width={110}
            height={44}
            className="w-auto h-8 object-contain"
          />
        </div>

        <h2 className="text-base sm:text-lg font-extrabold text-neutral-primary tracking-tight max-w-xl leading-snug uppercase">
          NBTE/RPL/ 01 NSQ/RPL/QCF ASSESSMENT CENTRE CANDIDATE APPLICATION FORM
        </h2>

        {/* Upload Logo Box */}
        <div className="hidden sm:flex absolute right-0 top-0 w-24 h-24 rounded-2xl border-2 border-dashed border-rose-200 bg-[#FFF5F6] flex-col items-center justify-center p-2 text-center text-[#A31D38]">
          <FiUpload className="w-4 h-4 mb-1" />
          <span className="text-[10px] font-bold leading-tight">Upload Logo</span>
          <span className="text-[8px] text-gray-400 mt-0.5">5mb image max size</span>
        </div>
      </div>

      {/* Section 1: Personal Details */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold text-neutral-primary uppercase tracking-wide">
          Personal Details
        </h3>
        <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-32">
              Full Name:
            </span>
            <span className="text-neutral-primary font-medium">{fullName}</span>
          </div>

          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-32">
              Date of Birth:
            </span>
            <span className="text-neutral-secondary">{dob}</span>
          </div>

          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-32">
              Address:
            </span>
            <span className="text-neutral-secondary">{address}</span>
          </div>

          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-32">
              Phone Number:
            </span>
            <span className="text-neutral-secondary">{phone}</span>
          </div>

          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-32">
              Email Address:
            </span>
            <span className="text-neutral-secondary">{email}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Qualification / Unit(s) Being Applied For */}
      <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-extrabold text-neutral-primary uppercase tracking-wide">
          Qualification / Unit(s) Being Applied For
        </h3>
        <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-36">
              Qualification Title:
            </span>
            <span className="text-neutral-secondary">{qualTitle}</span>
          </div>

          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-36">
              Qualification Code:
            </span>
            <span className="text-neutral-secondary">-----</span>
          </div>

          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-36">
              Individual Units:
            </span>
            <span className="text-neutral-secondary">-----</span>
          </div>
        </div>
      </div>

      {/* Section 3: Evidence Summary */}
      <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-extrabold text-neutral-primary uppercase tracking-wide">
          Evidence Summary
        </h3>
        <div className="flex flex-col gap-2 text-xs sm:text-sm">
          {evidenceItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                  item.checked
                    ? "bg-[#D97706] border-[#D97706] text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {item.checked && <FiCheck className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-neutral-primary font-normal">
                {item.label}
              </span>
              {item.key === "other" && (
                <span className="border-b border-dashed border-gray-300 flex-1 ml-2 text-gray-400">
                  -----
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
