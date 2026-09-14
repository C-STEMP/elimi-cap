"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { useGetApplicationById } from "@/src/features/candidate/features/Application/hooks";
import { useAppSelector } from "@/src/store/hooks";
import { downloadFormElement, printFormElement } from "@/src/lib/formPrintDownload";
import { CandidateFormCard } from "@/src/features/assessment-centre/features/Applications/components/CandidateFormCard";

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
  const savedStartApp = useAppSelector(
    (state) => state.onboarding.startApplication,
  );
  const authUser = useAppSelector((state) => state.auth.user);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col min-h-screen bg-[#F8F9FA]">
        <HeaderBanner
          backHref={`/dashboard/applications/${applicationId}`}
          backTitle="Application Form"
          breadcrumbs={[
            { label: "My Applications", href: "/dashboard/applications" },
            { label: "Application Form" },
          ]}
          showCreateButton={false}
        />
        <div className="max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col gap-8 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-gray-100 pb-6 w-full">
              <div className="hidden sm:block w-28 sm:w-32 shrink-0" />
              <div className="flex flex-col items-center gap-3 flex-1 max-w-lg mx-auto w-full">
                <div className="h-8 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
              </div>
              <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl bg-gray-200 shrink-0" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded w-full max-w-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const appData = (apiApp as any)?.data || (apiApp as any) || {};

  const candidateFullName =
    [
      appData?.personalInformation?.personalDetails?.firstName || savedPersonalInfo?.firstName,
      appData?.personalInformation?.personalDetails?.middleName || savedPersonalInfo?.middleName,
      appData?.personalInformation?.personalDetails?.lastName || savedPersonalInfo?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    (apiApp as any)?.candidate?.name ||
    authUser?.fullName ||
    "Applicant";

  const rawTrade =
    (apiApp as any)?.trade?.name ||
    (apiApp as any)?.tradeName ||
    savedStartApp?.tradeName ||
    savedExperience?.qualificationTitle;

  const tradeName = rawTrade || "Trade Qualification";
  const formDownloadName = `Application_Form_${candidateFullName.replace(/\s+/g, "_")}`;
  const formTitle = `Candidate Application Form - ${candidateFullName}`;

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

        {/* Unified Application Document */}
        <CandidateFormCard
          appDetail={appData}
          formCandidateName={candidateFullName}
          className="w-full flex flex-col gap-6 printable-application-card"
        />
      </div>
    </div>
  );
};
