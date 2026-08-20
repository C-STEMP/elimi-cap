"use client";

import React from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { ApplicationFeedbackPanel } from "./ApplicationFeedbackPanel";
import type { ApplicationDetail } from "@/src/features/shared/applications/api";

interface CandidateApplicationFormViewProps {
  candidateName: string;
  trade: string;
  applicationId?: string;
  applicationDetail?: ApplicationDetail | null;
}

export const CandidateApplicationFormView: React.FC<
  CandidateApplicationFormViewProps
> = ({ candidateName, trade, applicationId, applicationDetail }) => {
  const pDetails = applicationDetail?.personalInformation?.personalDetails;
  const cInfo = applicationDetail?.personalInformation?.contactInformation;
  const rAddr = applicationDetail?.personalInformation?.residentialAddress;
  const occupation = applicationDetail?.currentOccupation;
  const evidence = applicationDetail?.evidenceCandidateCanProvide;
  const declarations = applicationDetail?.assessmentDeclaration;

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
  const qualTitle = applicationDetail?.trade?.name || trade;
  const currentJob = occupation?.occupation || "—";
  const company = occupation?.employmentHistory?.[0]?.company || "—";

  const evidenceItems = [
    { key: "resume", label: "Resume / CV", checked: !!evidence?.resume },
    { key: "workSamples", label: "Work Samples", checked: !!evidence?.workSamples },
    {
      key: "certificates",
      label: "Certificates / Statements of Attainment",
      checked: !!evidence?.certificates || !!evidence?.statementsOfAttainment,
    },
    {
      key: "thirdPartyReportsOrReferences",
      label: "References / Third-Party Reports",
      checked: !!evidence?.thirdPartyReportsOrReferences,
    },
    {
      key: "jobDescriptions",
      label: "Job Descriptions",
      checked: !!evidence?.jobDescriptions,
    },
    {
      key: "photosOrVideosOfWork",
      label: "Photos / Videos of Work",
      checked: !!evidence?.photosOrVideosOfWork,
    },
    {
      key: "employmentLetter",
      label: "Employment Letter",
      checked: !!evidence?.employmentLetter,
    },
  ];

  const declarationList = [
    {
      text: "I confirm that the information provided is true and accurate.",
      checked: declarations?.infoProvidedIsAccurate ?? true,
    },
    {
      text: "I understand that submitting this application does not guarantee certification.",
      checked: declarations?.understandsDoesNotGuaranteeCertification ?? true,
    },
    {
      text: "I understand that I must provide sufficient evidence to demonstrate my competence.",
      checked:
        declarations?.understandsThatNeedsToProvideSufficientEvidenceToDemonstrateCompetence ??
        true,
    },
    {
      text: "I agree to the ELIMI Terms & Conditions and Privacy Policy.",
      checked: declarations?.agreesToTermsAndPrivacyPolicy ?? true,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start select-text">
      {/* Main Candidate Form Content */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Top Toolbar */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-9 px-4 rounded-xl text-xs gap-1.5 cursor-pointer"
          >
            <FiDownload className="w-3.5 h-3.5" /> Download / Print
          </Button>
        </div>

        {/* Application Document Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col gap-6 text-xs sm:text-sm">
          <div className="text-center font-extrabold text-sm sm:text-base text-neutral-primary leading-snug">
            NBTE/RPL/ 01 NSQ/RPL/QCF ASSESSMENT CENTRE
            <br />
            CANDIDATE APPLICATION FORM
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm text-neutral-primary">
              Personal Details
            </h4>
            <div className="flex flex-col gap-2 text-gray-700">
              <div className="border-b border-gray-100 pb-2 flex justify-between">
                <span className="text-gray-500">Full Name:</span>{" "}
                <span className="font-semibold text-neutral-primary">{fullName}</span>
              </div>
              <div className="border-b border-gray-100 pb-2 flex justify-between">
                <span className="text-gray-500">Date of Birth:</span>{" "}
                <span className="font-semibold text-neutral-primary">{dob}</span>
              </div>
              <div className="border-b border-gray-100 pb-2 flex justify-between">
                <span className="text-gray-500">Address:</span>{" "}
                <span className="font-semibold text-neutral-primary">{address}</span>
              </div>
              <div className="border-b border-gray-100 pb-2 flex justify-between">
                <span className="text-gray-500">Phone Number:</span>{" "}
                <span className="font-semibold text-neutral-primary">{phone}</span>
              </div>
              <div className="border-b border-gray-100 pb-2 flex justify-between">
                <span className="text-gray-500">Email Address:</span>{" "}
                <span className="font-semibold text-neutral-primary">{email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm text-neutral-primary">
              Qualification / Unit(s) Being Applied For
            </h4>
            <div className="flex flex-col gap-2 text-gray-700">
              <div className="border-b border-gray-100 pb-2 flex justify-between">
                <span className="text-gray-500">Qualification Title:</span>{" "}
                <span className="font-semibold text-neutral-primary">{qualTitle}</span>
              </div>
              <div className="border-b border-gray-100 pb-2 flex justify-between">
                <span className="text-gray-500">Assessment Type:</span>{" "}
                <span className="font-semibold text-neutral-primary">
                  {applicationDetail?.type ?? "RPL"}
                </span>
              </div>
              {applicationDetail?.reasonForSeekingRPL && (
                <div className="border-b border-gray-100 pb-2 flex justify-between">
                  <span className="text-gray-500">Reason for RPL:</span>{" "}
                  <span className="font-semibold text-neutral-primary">
                    {applicationDetail.reasonForSeekingRPL}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-sm text-neutral-primary">
              Evidence Summary
            </h4>
            {evidenceItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-gray-700">
                <span
                  className={`font-bold ${
                    item.checked ? "text-emerald-600" : "text-gray-300"
                  }`}
                >
                  {item.checked ? "✓" : "○"}
                </span>
                <span className={item.checked ? "text-neutral-primary font-medium" : "text-gray-400"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Experience & Declaration Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col gap-6 text-xs sm:text-sm">
          <h4 className="font-bold text-sm text-neutral-primary">
            Current and Previous Work Experience
          </h4>
          <div className="flex flex-col gap-3 text-gray-700">
            <div className="border-b border-gray-100 pb-2 flex justify-between">
              <span className="text-gray-500">Current Occupation:</span>{" "}
              <span className="font-semibold text-neutral-primary">{currentJob}</span>
            </div>
            <div className="border-b border-gray-100 pb-2 flex justify-between">
              <span className="text-gray-500">Employer / Company:</span>{" "}
              <span className="font-semibold text-neutral-primary">{company}</span>
            </div>
            {occupation?.yearsOfExperience !== undefined && (
              <div className="border-b border-gray-100 pb-2 flex justify-between">
                <span className="text-gray-500">Years of Experience:</span>{" "}
                <span className="font-semibold text-neutral-primary">
                  {occupation.yearsOfExperience} Year(s)
                </span>
              </div>
            )}
          </div>

          <h4 className="font-bold text-sm text-neutral-primary mt-2">
            Assessment Declaration
          </h4>
          <div className="flex flex-col gap-2.5 text-gray-700">
            {declarationList.map((dec, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span className="text-neutral-primary">{dec.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Feedback & Comments Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <ApplicationFeedbackPanel applicationId={applicationId} />
      </div>
    </div>
  );
};

