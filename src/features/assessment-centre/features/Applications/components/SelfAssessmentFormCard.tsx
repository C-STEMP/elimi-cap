"use client";

import React from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { Avatar } from "@/src/components/ui/avatar";

interface Props {
  resolvedPassportUrl: string;
  formCandidateName: string;
  resolvedFullName: string;
  personalDetails: any;
  residentialAddress: any;
  contactInfo: any;
  rawCompetencies: any[];
  reflectionData: any;
  declarationData: any;
}

export const SelfAssessmentFormCard: React.FC<Props> = ({
  resolvedPassportUrl,
  formCandidateName,
  resolvedFullName,
  personalDetails,
  residentialAddress,
  contactInfo,
  rawCompetencies,
  reflectionData,
  declarationData,
}) => {
  return (
    <div id="printable-application-card" className="w-full max-w-5xl flex flex-col gap-6 printable-application-card">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-3 border-b border-gray-100 pb-6 relative">
          <div className="flex justify-center mb-1">
            <Image src={ASSETS_URL.logoIcon2} alt="ELIMI Logo" width={100} height={40} className="w-auto h-8 object-contain" style={{ width: "auto", height: "auto" }} />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-black tracking-tight max-w-lg leading-tight uppercase">
            Ref: NBTE/RPL/ 02 NSQ/RPL/QCF ASSESSMENT CENTRE SELF-ASSESSMENT OF COMPETENCY FORM
          </h2>
          <div className="sm:absolute sm:top-0 sm:right-0 mt-4 sm:mt-0">
            <Avatar src={resolvedPassportUrl} name={formCandidateName} shape="rounded" className="w-28 sm:w-32 h-28 sm:h-32 border-2 border-dashed border-[#a31d38]/20 bg-[#fdf2f5] p-1 shadow-2xs" alt="Candidate Passport" />
          </div>
        </div>

        {/* Personal Details */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Personal Details</h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
            {[
              ["Full Name:", resolvedFullName],
              ["Date of Birth:", personalDetails?.dob ? new Date(personalDetails.dob).toLocaleDateString("en-GB") : "------"],
              ["Address:", residentialAddress?.address || [residentialAddress?.lga, residentialAddress?.state, residentialAddress?.country].filter(Boolean).join(", ") || "------"],
              ["Phone Number:", contactInfo?.phoneNumber?.number ? `${contactInfo.phoneNumber.countryCode || "+234"} ${contactInfo.phoneNumber.number}` : "------"],
              ["Email Address:", contactInfo?.emailAddress || "------"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-32">{label}</span>
                <span className="text-gray-800 font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competencies */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Instructions:</h3>
            <p className="text-xs text-gray-500 font-normal">
              For each skill or task, tick (✓) the column that best describes your confidence in performing it, and provide brief examples where possible.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            {rawCompetencies.map((comp: any, idx: number) => {
              const isChecked = comp.confidence === "high" || comp.evidence === "yes" || Boolean(comp.confidence);
              const label = comp.confidence === "high" ? "I Can Do This Well" : comp.confidence === "moderate" ? "Moderately Confident" : "Developing Skill";
              return (
                <div key={idx} className="flex flex-col gap-2 border-b border-gray-100 pb-4">
                  <span className="text-xs sm:text-sm font-bold text-black">{comp.title || comp.name || `Competency ${idx + 1}`}</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" checked={Boolean(isChecked)} readOnly className="w-4 h-4 accent-primary rounded cursor-pointer" />
                    <span className="font-medium">{label}</span>
                  </label>
                  {comp.experience ? (
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-xs text-gray-400 font-semibold shrink-0">Comment</span>
                      <p className="text-xs sm:text-sm text-gray-800 bg-[#F9FAFB] p-2.5 rounded-xl border border-gray-100">{comp.experience}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-gray-400 font-semibold shrink-0">Comment</span>
                      <div className="flex-1 border-b border-dashed border-gray-300 py-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reflection Questions */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Reflection Questions</h3>
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-black">A. What tasks am I most confident performing?</span>
            {reflectionData.tasks ? <p className="text-gray-800 bg-[#F9FAFB] p-2.5 rounded-xl border border-gray-100">{reflectionData.tasks}</p> : <div className="border-b border-dashed border-gray-300 py-1" />}
          </div>
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-black">B. Which tasks would I like to improve on?</span>
            {reflectionData.skills ? <p className="text-gray-800 bg-[#F9FAFB] p-2.5 rounded-xl border border-gray-100">{reflectionData.skills}</p> : <div className="border-b border-dashed border-gray-300 py-1" />}
          </div>
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-black">C. What evidence can I provide to support my experience and skills?</span>
            {reflectionData.selectedEvidences && reflectionData.selectedEvidences.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {reflectionData.selectedEvidences.map((ev: string, i: number) => (
                  <span key={i} className="bg-[#FFF4E5] text-[#B45309] text-xs font-semibold px-3 py-1 rounded-full border border-[#FDE6B0]">{ev}</span>
                ))}
                {reflectionData.otherEvidenceText && <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{reflectionData.otherEvidenceText}</span>}
              </div>
            ) : <div className="border-b border-dashed border-gray-300 py-1" />}
          </div>
        </div>

        {/* Declarations */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">Assessment Declaration</h3>
          <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-gray-700">
            {[
              ["1", "I confirm that the information provided is true and accurate."],
              ["2", "I understand that submitting this application does not guarantee certification."],
              ["3", "I understand that I must provide sufficient evidence to demonstrate my competence."],
              ["4", "I agree to the ELIMI Terms & Conditions and Privacy Policy."],
            ].map(([num, text]) => (
              <label key={num} className="flex items-center gap-2.5">
                <input type="checkbox" checked={Boolean(declarationData.declarations?.[num] ?? declarationData.allConfirmed ?? true)} readOnly className="w-4 h-4 accent-primary rounded" />
                <span className="font-medium">{text}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
