"use client";

import React from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { Avatar } from "@/src/components/ui/avatar";

export interface CandidateFormCardProps {
  appDetail?: any;
  formCandidateName?: string;
  resolvedFullName?: string;
  resolvedPassportUrl?: string;
  personalDetails?: any;
  residentialAddress?: any;
  contactInfo?: any;
  evidenceCandidate?: any;
  declaration?: any;
  className?: string;
}

export const CandidateFormCard: React.FC<CandidateFormCardProps> = ({
  appDetail,
  formCandidateName,
  resolvedFullName,
  resolvedPassportUrl,
  personalDetails,
  residentialAddress,
  contactInfo,
  evidenceCandidate,
  declaration,
  className = "lg:col-span-8 xl:col-span-9 flex flex-col gap-6 printable-application-card",
}) => {
  const detail = appDetail || {};
  const pDetails =
    personalDetails ||
    detail?.personalInformation?.personalDetails ||
    detail?.personalDetails ||
    {};
  const rAddr =
    residentialAddress ||
    detail?.personalInformation?.residentialAddress ||
    detail?.residentialAddress ||
    {};
  const cInfo =
    contactInfo ||
    detail?.personalInformation?.contactInformation ||
    detail?.contactInformation ||
    {};
  const evCandidate =
    evidenceCandidate ||
    detail?.evidenceCandidateCanProvide ||
    detail?.experienceAndTrade?.evidenceCandidateCanProvide ||
    {};

  const name =
    resolvedFullName ||
    [pDetails?.firstName, pDetails?.middleName, pDetails?.lastName]
      .filter(Boolean)
      .join(" ") ||
    formCandidateName ||
    detail?.candidate?.name ||
    detail?.candidateName ||
    "Candidate";

  const passport =
    resolvedPassportUrl ||
    detail?.candidate?.photo?.url ||
    detail?.candidate?.photoAssetId ||
    detail?.candidate?.avatar ||
    pDetails?.photoUrl ||
    pDetails?.passportUrl ||
    detail?.candidatePhotoUrl ||
    "";

  return (
    <div id="printable-application-card" className={className}>
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-gray-100 pb-6 w-full">
          <div className="hidden sm:block w-28 sm:w-32 shrink-0" aria-hidden="true" />
          <div className="flex flex-col items-center text-center gap-2 flex-1 max-w-lg mx-auto">
            <div className="flex justify-center mb-0.5">
              <Image src={ASSETS_URL.logoIcon2} alt="ELIMI Logo" width={100} height={40} className="w-auto h-8 object-contain" style={{ width: "auto", height: "32px" }} />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-black tracking-tight leading-tight uppercase">
              NBTE/RPL/ 01 NSQ/RPL/QCF ASSESSMENT CENTRE CANDIDATE APPLICATION FORM
            </h2>
          </div>
          <div className="w-28 sm:w-32 shrink-0 flex justify-center sm:justify-end">
            <Avatar src={passport} name={name} shape="rounded" className="w-28 sm:w-32 h-28 sm:h-32 border-2 border-dashed border-[#a31d38]/20 bg-[#fdf2f5] p-1 shadow-2xs shrink-0" style={{ width: "112px", height: "112px", maxWidth: "112px", maxHeight: "112px" }} alt="Candidate Passport" />
          </div>
        </div>

        {/* Personal Details */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Personal Details</h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
            {[
              ["Full Name:", name],
              ["Date of Birth:", pDetails?.dob ? new Date(pDetails.dob).toLocaleDateString("en-GB") : "------"],
              ["Address:", rAddr?.address || [rAddr?.lga, rAddr?.state, rAddr?.country].filter(Boolean).join(", ") || "------"],
              ["Phone Number:", cInfo?.phoneNumber?.number ? `${cInfo.phoneNumber.countryCode || "+234"} ${cInfo.phoneNumber.number}` : typeof cInfo?.phoneNumber === "string" ? cInfo.phoneNumber : "------"],
              ["Email Address:", cInfo?.emailAddress || "------"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-32">{label}</span>
                <span className="text-gray-800 font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Qualification / Unit(s) */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Qualification / Unit(s) Being Applied For</h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
              <span className="font-semibold text-black shrink-0 w-36">Qualification Title:</span>
              <span className="text-gray-800 font-medium">{detail?.trade?.name || detail?.trade || detail?.sector?.name || `${detail?.type || "RPL"} Trade Qualification`}</span>
            </div>
            <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
              <span className="font-semibold text-black shrink-0 w-36">Individual Units:</span>
              <span className="text-gray-700 font-medium">{detail?.unitIds && detail.unitIds.length > 0 ? `${detail.unitIds.length} Specified Qualification Unit(s)` : "All Mandatory and Elective Units"}</span>
            </div>
          </div>
        </div>

        {/* Centre Details */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Assessment Centre Details</h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
              <span className="font-semibold text-black shrink-0 w-36">Centre Name:</span>
              <span className="text-gray-800 font-medium">{detail?.centre?.name || "Elimi Assessment Centre"}</span>
            </div>
            <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
              <span className="font-semibold text-black shrink-0 w-36">Registration No:</span>
              <span className="text-gray-600 font-medium">{detail?.centre?.registrationNo || detail?.centre?.slug || "AC-NBTE-0042"}</span>
            </div>
            <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
              <span className="font-semibold text-black shrink-0 w-36">Centre Address:</span>
              <span className="text-gray-600 font-medium">
                {typeof detail?.centre?.address === "object"
                  ? [detail.centre.address.address, detail.centre.address.state].filter(Boolean).join(", ")
                  : (detail?.centre as any)?.address || "Approved TVET Assessment Facility"}
              </span>
            </div>
          </div>
        </div>

        {/* Evidence Summary */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Evidence Summary</h3>
          <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-gray-700">
            {[
              ["Resume / CV", Boolean(evCandidate?.resume)],
              ["Work Samples", Boolean(evCandidate?.workSamples)],
              ["Certificates / Statements of Attainment", Boolean(evCandidate?.certificates || evCandidate?.statementsOfAttainment)],
              ["References / Third-Party Reports", Boolean(evCandidate?.thirdPartyReportsOrReferences || evCandidate?.thirdPartyReports)],
              ["Job Descriptions", Boolean(evCandidate?.jobDescriptions)],
              ["Photos / Videos of Work", Boolean(evCandidate?.photosOrVideosOfWork || evCandidate?.photosVideos)],
            ].map(([title, checked]) => (
              <label key={String(title)} className="flex items-center gap-2.5 cursor-default">
                <input type="checkbox" checked={Boolean(checked)} readOnly className="w-4 h-4 accent-[#a31d38] rounded cursor-default" />
                <span className={`font-medium ${checked ? "text-gray-900 font-semibold" : "text-gray-400"}`}>{title}</span>
              </label>
            ))}
            <div className="flex items-center gap-2.5">
              <input type="checkbox" checked={Boolean(evCandidate?.other)} readOnly className="w-4 h-4 accent-[#a31d38] rounded cursor-default" />
              <span className={`font-medium shrink-0 ${Boolean(evCandidate?.other) ? "text-gray-900 font-semibold" : "text-gray-400"}`}>Other (please specify):</span>
              <div className="flex-1 border-b border-dashed border-gray-300 py-1 text-xs text-gray-700">
                {(evCandidate as any)?.otherText || (evCandidate as any)?.otherDescription || "------"}
              </div>
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Current and Previous Work Experience</h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
              <span className="font-semibold text-black shrink-0 w-36">Current Occupation:</span>
              <span className="text-gray-700">{detail?.currentOccupation?.occupation || "------"}</span>
            </div>
            <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
              <span className="font-semibold text-black shrink-0 w-36">Employer (if applicable):</span>
              <span className="text-gray-700">{detail?.currentOccupation?.employmentHistory?.[0]?.company || "------"}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-gray-200/70 pb-2">
              <span className="font-semibold text-black">Previous Relevant Experience:</span>
              <p className="text-gray-700 leading-relaxed text-xs sm:text-sm mt-1">{detail?.currentOccupation?.employmentHistory?.[0]?.keyResponsibilities || "------"}</p>
            </div>
          </div>
        </div>

        {/* Reason for RPL */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Why are you applying for RPL?</h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
            {detail?.reasonForSeekingRPL || "I declare that the information provided in this application is true and correct, and that the evidence submitted is a true representation of my skills, knowledge, and experience."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 border-b border-dashed border-gray-300 pb-1 text-xs sm:text-sm">
              <span className="font-semibold text-black shrink-0">Signature:</span>
              <span className="text-gray-700 italic">Signature Verified</span>
            </div>
            <div className="flex items-center gap-2 border-b border-dashed border-gray-300 pb-1 text-xs sm:text-sm">
              <span className="font-semibold text-black shrink-0">Date:</span>
              <span className="text-gray-700">{detail?.submittedAt ? new Date(detail.submittedAt).toLocaleDateString("en-GB") : detail?.createdAt ? new Date(detail.createdAt).toLocaleDateString("en-GB") : "------"}</span>
            </div>
          </div>
        </div>

        {/* Declarations */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Assessment Declaration</h3>
          <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-gray-700">
            {[
              "I confirm that the information provided is true and accurate.",
              "I understand that submitting this application does not guarantee certification.",
              "I understand that I must provide sufficient evidence to demonstrate my competence.",
            ].map((text) => (
              <label key={text} className="flex items-center gap-2.5 cursor-default">
                <input type="checkbox" checked readOnly className="w-4 h-4 accent-[#a31d38] rounded" />
                <span className="font-medium">{text}</span>
              </label>
            ))}
            <label className="flex items-center gap-2.5 cursor-default">
              <input type="checkbox" checked readOnly className="w-4 h-4 accent-[#a31d38] rounded" />
              <span className="font-medium">I agree to the ELIMI <span className="text-[#a31d38] font-bold">Terms &amp; Conditions</span> and <span className="text-[#a31d38] font-bold">Privacy Policy</span>.</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
