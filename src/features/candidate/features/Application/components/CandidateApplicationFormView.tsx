"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiDownload, FiPrinter, FiCheck } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { useGetApplicationById } from "@/src/features/candidate/features/Application/hooks";
import { useAppSelector } from "@/src/store/hooks";
import { Loader } from "@/src/components/ui/loader";
import { downloadFormElement, printFormElement } from "@/src/lib/formPrintDownload";

interface CandidateApplicationFormViewProps {
  applicationId: string;
}

export const CandidateApplicationFormView: React.FC<
  CandidateApplicationFormViewProps
> = ({ applicationId }) => {
  const router = useRouter();
  const { data: apiApp, isLoading } = useGetApplicationById(applicationId);
  const savedPersonalInfo = useAppSelector(
    (state) => state.onboarding.personalInfo,
  );
  const savedExperience = useAppSelector(
    (state) => state.onboarding.rplExperienceTrade,
  );
  const authUser = useAppSelector((state) => state.auth.user);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader fullscreen={false} tip="Loading application form..." />
      </div>
    );
  }

  const appData = (apiApp as any)?.data || (apiApp as any) || {};
  const personalInfo =
    appData?.personalInformation?.personalDetails ||
    appData?.personalDetails ||
    savedPersonalInfo ||
    {};
  const contactInfo =
    appData?.personalInformation?.contactInformation ||
    appData?.contactInformation ||
    {};
  const residentialAddress =
    appData?.personalInformation?.residentialAddress ||
    appData?.residentialAddress ||
    {};
  const currentOccupation =
    appData?.currentOccupation ||
    appData?.experienceAndTrade?.currentOccupation ||
    {};
  const evidenceCandidateCanProvide =
    appData?.evidenceCandidateCanProvide ||
    appData?.experienceAndTrade?.evidenceCandidateCanProvide ||
    {};
  const reasonForSeekingRPL =
    appData?.reasonForSeekingRPL ||
    appData?.experienceAndTrade?.reasonForSeekingRPL ||
    "";

  const candidateFullName =
    [personalInfo.firstName, personalInfo.middleName, personalInfo.lastName]
      .filter(Boolean)
      .join(" ") ||
    (apiApp as any)?.candidate?.name ||
    authUser?.fullName ||
    "Applicant";

  const formattedDob = personalInfo.dob || savedPersonalInfo.dob || "------";

  const formattedAddress =
    [
      residentialAddress.address || savedPersonalInfo.streetAddress,
      residentialAddress.lga || savedPersonalInfo.lga,
      residentialAddress.state || savedPersonalInfo.state,
      residentialAddress.country || savedPersonalInfo.country || "Nigeria",
    ]
      .filter(Boolean)
      .join(", ") || "------";

  const formattedPhone =
    contactInfo.phoneNumber?.number ||
    (typeof contactInfo.phoneNumber === "string"
      ? contactInfo.phoneNumber
      : savedPersonalInfo.phoneNumber) ||
    "------";

  const formattedEmail =
    contactInfo.emailAddress ||
    savedPersonalInfo.email ||
    authUser?.email ||
    "------";

  const savedStartApp = useAppSelector(
    (state) => state.onboarding.startApplication,
  );
  const savedCentreInfo = useAppSelector(
    (state) => state.onboarding.centreInformation,
  );

  const isRawId = (str?: string) => {
    if (!str) return false;
    if (/^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str))
      return true;
    return false;
  };

  const rawTrade =
    (apiApp as any)?.trade?.name ||
    (apiApp as any)?.tradeName ||
    savedStartApp?.tradeName ||
    savedExperience.qualificationTitle;

  const tradeName =
    rawTrade && !isRawId(rawTrade)
      ? rawTrade
      : savedStartApp?.tradeName || "Cosmetology (RPL)";

  const tradeCode =
    (apiApp as any)?.trade?.slug ||
    savedExperience.qualificationCode ||
    "NOS-ELI-L3";

  const passportUrl =
    savedPersonalInfo.passportUrl ||
    (authUser as any)?.avatar ||
    (authUser as any)?.avatarUrl ||
    "";

  const centreName =
    (apiApp as any)?.centre?.name ||
    (apiApp as any)?.centreName ||
    (apiApp as any)?.assessmentCentreName ||
    savedStartApp.assessmentCenter ||
    savedCentreInfo.centerName ||
    "Lagos State Skills Assessment Centre";

  const centreRegNo =
    (apiApp as any)?.centre?.registrationNo ||
    (apiApp as any)?.centre?.regNo ||
    savedCentreInfo.regNo ||
    "AC-NBTE-0042";

  const centreAddress =
    (apiApp as any)?.centre?.formattedAddress ||
    (typeof (apiApp as any)?.centre?.address === "object"
      ? [
          (apiApp as any)?.centre?.address?.address,
          (apiApp as any)?.centre?.address?.lga,
          (apiApp as any)?.centre?.address?.state,
          (apiApp as any)?.centre?.address?.country,
        ]
          .filter(Boolean)
          .join(", ")
      : (apiApp as any)?.centre?.address) ||
    savedCentreInfo.streetAddress ||
    "Plot 12 Commercial Avenue, Ikeja, Lagos State";

  const applicantName = candidateFullName;
  const formDownloadName = `Application_Form_${applicantName.replace(/\s+/g, "_")}`;
  const formTitle = `Candidate Application Form - ${applicantName}`;

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#F8F9FA] select-text">
      {/* Header Banner */}
      <HeaderBanner
        backHref={`/dashboard/applications/${applicationId}`}
        backTitle="Application Form"
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          {
            label: tradeName,
            href: `/dashboard/applications/${applicationId}`,
          },
          { label: "Application Form" },
        ]}
        showCreateButton={false}
      />

      <div className="max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
        {/* Action Buttons (Download & Print) */}
        <div className="flex items-center justify-between gap-3 no-print">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/applications/${applicationId}`)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-secondary hover:text-text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Application
          </button>

          <div className="flex items-center gap-3">
            <a
              href="#"
              download={formDownloadName}
              onClick={(e) => {
                e.preventDefault();
                downloadFormElement("printable-application-card", formDownloadName);
              }}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <span>Download</span>
              <FiDownload className="w-4 h-4 text-gray-500" />
            </a>

            <button
              type="button"
              onClick={() => printFormElement("printable-application-card", formTitle)}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <span>Print</span>
              <FiPrinter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Printable Application Card Wrapper */}
        <div id="printable-application-card" className="printable-application-card flex flex-col gap-6 w-full">
          {/* Card 1: Main Application Header & Personal Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-200/80 shadow-xs flex flex-col gap-8">
            {/* Header with Logo & Passport */}
            <div className="flex flex-col items-center text-center gap-3 border-b border-gray-100 pb-8 relative">
              <div className="flex justify-center mb-1">
                <Image
                  src={ASSETS_URL.logoIcon2}
                  alt="ELIMI Logo"
                  width={100}
                  height={40}
                  className="w-auto h-8 object-contain"
                />
              </div>

            <h1 className="text-base sm:text-lg font-extrabold text-black tracking-tight max-w-lg leading-tight uppercase">
              NBTE/RPL/ 01 NSQ/RPL/QCF ASSESSMENT CENTRE CANDIDATE APPLICATION
              FORM
            </h1>

            {/* Passport Photograph */}
            <div className="sm:absolute sm:top-0 sm:right-0 mt-4 sm:mt-0">
              <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl border-2 border-dashed border-primary/20 bg-[#fdf2f5] overflow-hidden flex flex-col items-center justify-center p-1 relative shadow-2xs">
                {passportUrl ? (
                  <img
                    src={passportUrl}
                    alt="Passport"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center p-2">
                    <span className="text-primary text-xs font-bold leading-tight">
                      Passport
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      Attached
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-extrabold text-black uppercase tracking-wide">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Full Name:
                </span>
                <span className="text-gray-800 font-medium">
                  {candidateFullName}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Date of Birth:
                </span>
                <span className="text-gray-700 font-medium">
                  {formattedDob}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Address:
                </span>
                <span className="text-gray-700 font-medium">
                  {formattedAddress}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Phone Number:
                </span>
                <span className="text-gray-700 font-medium">
                  {formattedPhone}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Email Address:
                </span>
                <span className="text-gray-700 font-medium">
                  {formattedEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Qualification / Unit(s) Being Applied For */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-extrabold text-black uppercase tracking-wide">
              Qualification / Unit(s) Being Applied For
            </h2>
            <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Qualification Title:
                </span>
                <span className="text-gray-800 font-medium">{tradeName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Individual Units:
                </span>
                <span className="text-gray-700 font-medium">
                  All Mandatory and Elective Units
                </span>
              </div>
            </div>
          </div>

          {/* Assessment Centre Details */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-extrabold text-black uppercase tracking-wide">
              Assessment Centre Details
            </h2>
            <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Centre Name:
                </span>
                <span className="text-gray-800 font-medium">{centreName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Registration No:
                </span>
                <span className="text-gray-700 font-medium">{centreRegNo}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-36">
                  Centre Address:
                </span>
                <span className="text-gray-700 font-medium">
                  {centreAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Evidence Summary */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-extrabold text-black uppercase tracking-wide">
              Evidence Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-gray-700">
              {[
                {
                  key: "resume",
                  label: "Resume / CV",
                  checked: Boolean(evidenceCandidateCanProvide?.resume ?? true),
                },
                {
                  key: "workSamples",
                  label: "Work Samples",
                  checked: Boolean(evidenceCandidateCanProvide?.workSamples ?? true),
                },
                {
                  key: "certificates",
                  label: "Certificates / Statements of Attainment",
                  checked: Boolean(evidenceCandidateCanProvide?.certificates ?? true),
                },
                {
                  key: "thirdPartyReports",
                  label: "References / Third-Party Reports",
                  checked: Boolean(evidenceCandidateCanProvide?.thirdPartyReports ?? true),
                },
                {
                  key: "jobDescriptions",
                  label: "Job Descriptions",
                  checked: Boolean(evidenceCandidateCanProvide?.jobDescriptions ?? true),
                },
                {
                  key: "photosVideos",
                  label: "Photos / Videos of Work",
                  checked: Boolean(evidenceCandidateCanProvide?.photosVideos ?? true),
                },
                {
                  key: "other",
                  label: "Other Supporting Evidence",
                  checked: Boolean(evidenceCandidateCanProvide?.other ?? false),
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                      item.checked
                        ? "bg-primary border-primary text-white"
                        : "bg-gray-100 border-gray-300 text-transparent"
                    }`}
                  >
                    {item.checked && <FiCheck className="w-3 h-3 stroke-3" />}
                  </div>
                  <span
                    className={`font-medium ${
                      item.checked ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Work Experience, Reason & Declarations */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-200/80 shadow-xs flex flex-col gap-8">
          {/* Current and Previous Work Experience */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-extrabold text-black uppercase tracking-wide">
              Current and Previous Work Experience
            </h2>
            <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-44">
                  Current Occupation:
                </span>
                <span className="text-gray-800 font-medium">
                  {currentOccupation?.occupation ||
                    savedExperience.occupation ||
                    tradeName}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0 w-44">
                  Employer (if applicable):
                </span>
                <span className="text-gray-700 font-medium">
                  {currentOccupation?.employmentHistory?.[0]?.company ||
                    savedExperience.employments?.[0]?.companyName ||
                    "Self-Employed / Independent Contractor"}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-gray-200/70 pb-2">
                <span className="font-semibold text-black">
                  Previous Relevant Experience (summarize your duties, roles,
                  responsibilities, and how they relate to this qualification):
                </span>
                <p className="text-gray-700 font-normal leading-relaxed mt-1">
                  {currentOccupation?.employmentHistory?.[0]
                    ?.keyResponsibilities ||
                    savedExperience.employments?.[0]?.responsibilities ||
                    "Experienced practitioner in skilled trades, carrying out routine assignments, maintaining safety protocols, ensuring quality standards, and demonstrating practical execution across core industry competencies."}
                </p>
              </div>
            </div>
          </div>

          {/* Why are you applying for RPL? */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-extrabold text-black uppercase tracking-wide">
              Why are you applying for RPL?
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
              {reasonForSeekingRPL ||
                "I declare that the information provided in this application is true and correct, and that the evidence submitted is a true representation of my skills, knowledge, and experience."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0">
                  Signature:
                </span>
                <span className="font-serif italic text-primary font-bold">
                  {candidateFullName}
                </span>
              </div>
              <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                <span className="font-semibold text-black shrink-0">
                  Date:
                </span>
                <span className="text-gray-700 font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Assessment Declaration */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-extrabold text-black uppercase tracking-wide">
              Assessment Declaration
            </h2>
            <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm text-gray-700">
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded bg-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                  <FiCheck className="w-3 h-3 stroke-3" />
                </div>
                <span className="font-medium">
                  I confirm that the information provided is true and accurate.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded bg-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                  <FiCheck className="w-3 h-3 stroke-3" />
                </div>
                <span className="font-medium">
                  I understand that submitting this application does not guarantee
                  certification.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded bg-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                  <FiCheck className="w-3 h-3 stroke-3" />
                </div>
                <span className="font-medium">
                  I understand that I must provide sufficient evidence to
                  demonstrate my competence.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded bg-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                  <FiCheck className="w-3 h-3 stroke-3" />
                </div>
                <span className="font-medium">
                  I agree to the ELIMI{" "}
                  <span className="text-primary font-semibold">
                    Terms &amp; Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-primary font-semibold">
                    Privacy Policy
                  </span>
                  .
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* End Printable Application Card Wrapper */}
        </div>
      </div>
    </div>
  );
};
