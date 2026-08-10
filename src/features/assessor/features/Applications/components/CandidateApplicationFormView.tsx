"use client";

import React, { useState } from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { ApplicationFeedbackPanel } from "./ApplicationFeedbackPanel";

interface CandidateApplicationFormViewProps {
  candidateName: string;
  trade: string;
}

export const CandidateApplicationFormView: React.FC<
  CandidateApplicationFormViewProps
> = ({ candidateName, trade }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start select-text">
      {/* Main Candidate Form Content */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Top Toolbar */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-xs gap-1.5 cursor-pointer">
            <FiDownload className="w-3.5 h-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-xs gap-1.5 cursor-pointer">
            <FiPrinter className="w-3.5 h-3.5" /> Print
          </Button>
        </div>

        {/* Application Document Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col gap-6 text-xs sm:text-sm">
          <div className="text-center font-extrabold text-sm sm:text-base text-neutral-primary leading-snug">
            NBTE/RPL/ 01 NSQ/RPL/QCF ASSESSMENT CENTRE<br />CANDIDATE APPLICATION FORM
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm text-neutral-primary">Personal Details</h4>
            <div className="flex flex-col gap-2 text-gray-700">
              <div className="border-b border-gray-200 pb-1 flex justify-between">
                <span>Full Name:</span> <span className="font-semibold">{candidateName}</span>
              </div>
              <div className="border-b border-gray-200 pb-1">Date of Birth: -----</div>
              <div className="border-b border-gray-200 pb-1">Address: -----</div>
              <div className="border-b border-gray-200 pb-1">Phone Number: -----</div>
              <div className="border-b border-gray-200 pb-1">Email Address: -----</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm text-neutral-primary">Qualification / Unit(s) Being Applied For</h4>
            <div className="flex flex-col gap-2 text-gray-700">
              <div className="border-b border-gray-200 pb-1">Qualification Title: {trade}</div>
              <div className="border-b border-gray-200 pb-1">Qualification Code: NOS-ELI-L3</div>
              <div className="border-b border-gray-200 pb-1">Individual Units: -----</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-sm text-neutral-primary">Evidence Summary</h4>
            {[
              "Resume / CV",
              "Work Samples",
              "Certificates / Statements of Attainment",
              "References / Third-Party Reports",
              "Job Descriptions",
              "Photos / Videos of Work",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Experience & Declaration Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col gap-6 text-xs sm:text-sm">
          <h4 className="font-bold text-sm text-neutral-primary">Current and Previous Work Experience</h4>
          <div className="flex flex-col gap-3 text-gray-700">
            <div className="border-b border-gray-200 pb-1">Current Occupation: {trade} Specialist</div>
            <div className="border-b border-gray-200 pb-1">Employer (if applicable): -----</div>
          </div>

          <h4 className="font-bold text-sm text-neutral-primary mt-2">Assessment Declaration</h4>
          <div className="flex flex-col gap-2.5 text-gray-700">
            {[
              "I confirm that the information provided is true and accurate.",
              "I understand that submitting this application does not guarantee certification.",
              "I understand that I must provide sufficient evidence to demonstrate my competence.",
              "I agree to the ELIMI Terms & Conditions and Privacy Policy.",
            ].map((dec) => (
              <div key={dec} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>{dec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Feedback & Comments Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <ApplicationFeedbackPanel />
      </div>
    </div>
  );
};
