"use client";

import React from "react";
import { FiCheck } from "react-icons/fi";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";

interface WorkExperienceDocumentSectionProps {
  applicationDetail?: ApplicationDetail | null;
}

export const WorkExperienceDocumentSection: React.FC<
  WorkExperienceDocumentSectionProps
> = ({ applicationDetail }) => {
  const occupation = applicationDetail?.currentOccupation?.occupation || "—";
  const employer =
    applicationDetail?.currentOccupation?.employmentHistory?.[0]?.company || "—";

  const declarations = [
    {
      id: "accurate",
      text: "I confirm that the information provided is true and accurate.",
      checked: true,
    },
    {
      id: "guarantee",
      text: "I understand that submitting this application does not guarantee certification.",
      checked: true,
    },
    {
      id: "evidence",
      text: "I understand that I must provide sufficient evidence to demonstrate my competence.",
      checked: true,
    },
    {
      id: "terms",
      text: "I agree to the ELIMI Terms & Conditions and Privacy Policy.",
      checked: true,
      hasLinks: true,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs flex flex-col gap-8 w-full">
      {/* Current and Previous Work Experience */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold text-neutral-primary uppercase tracking-wide">
          Current and Previous Work Experience
        </h3>
        <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-44">
              Current Occupation:
            </span>
            <span className="text-neutral-secondary">{occupation}</span>
          </div>

          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-44">
              Employer (if applicable):
            </span>
            <span className="text-neutral-secondary">{employer}</span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <span className="font-semibold text-neutral-primary leading-relaxed">
              Previous Relevant Experience (summarize your duties, roles, responsibilities, and how they relate to this qualification):
            </span>
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="border-b border-dashed border-gray-300 w-full h-4" />
              <div className="border-b border-dashed border-gray-300 w-full h-4" />
              <div className="border-b border-dashed border-gray-300 w-full h-4" />
              <div className="border-b border-dashed border-gray-300 w-full h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Why are you applying for RPL? */}
      <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-extrabold text-neutral-primary uppercase tracking-wide">
          Why are you applying for RPL?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-secondary leading-relaxed">
          I declare that the information provided in this application is true and correct, and that the evidence submitted is a true representation of my skills, knowledge, and experience.
        </p>

        <div className="flex flex-col gap-2.5 pt-2 text-xs sm:text-sm">
          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-24">
              Signature:
            </span>
            <span className="text-neutral-secondary">-----</span>
          </div>

          <div className="flex items-baseline gap-2 border-b border-dashed border-gray-300 pb-1">
            <span className="font-semibold text-neutral-primary shrink-0 w-24">
              Signature:
            </span>
            <span className="text-neutral-secondary">-----</span>
          </div>
        </div>
      </div>

      {/* Assessment Declaration */}
      <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-extrabold text-neutral-primary uppercase tracking-wide">
          Assessment Declaration
        </h3>
        <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
          {declarations.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5">
              <div
                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                  item.checked
                    ? "bg-[#D97706] border-[#D97706] text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {item.checked && <FiCheck className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-neutral-primary font-normal leading-relaxed">
                {item.hasLinks ? (
                  <>
                    I agree to the ELIMI{" "}
                    <span className="text-[#A31D38] font-semibold cursor-pointer hover:underline">
                      Terms &amp; Conditions
                    </span>{" "}
                    and{" "}
                    <span className="text-[#A31D38] font-semibold cursor-pointer hover:underline">
                      Privacy Policy
                    </span>
                    .
                  </>
                ) : (
                  item.text
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
