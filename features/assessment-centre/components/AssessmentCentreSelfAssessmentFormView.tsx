"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";
import { Button } from "@/src/components/ui/button";
import { PassportUpload } from "@/src/components/ui/passport-upload";
import { MOCK_COMPETENCY_TASKS } from "../utils/constants";

interface SelfAssessmentFormViewProps {
  candidateName?: string;
  onBack: () => void;
}

export const AssessmentCentreSelfAssessmentFormView: React.FC<
  SelfAssessmentFormViewProps
> = ({ candidateName = "Oguntade James", onBack }) => {
  const [feedback, setFeedback] = useState("");
  const [pastComments, setPastComments] = useState<string[]>([]);
  const [isFeedbackSuccessOpen, setIsFeedbackSuccessOpen] = useState(false);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setPastComments((prev) => [feedback.trim(), ...prev]);
    setFeedback("");
    setIsFeedbackSuccessOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>Download</span>
          <FiDownload className="w-4 h-4 text-gray-500" />
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>Print</span>
          <FiPrinter className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col gap-8">
            <div className="flex flex-col items-center text-center gap-3 border-b border-gray-100 pb-6 relative">
              <div className="flex justify-center mb-1">
                <Image
                  src={ASSETS_URL.logoIcon2}
                  alt="ELIMI Logo"
                  width={100}
                  height={40}
                  className="w-auto h-8 object-contain"
                />
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-black tracking-tight max-w-lg leading-tight uppercase">
                Ref: NBTE/RPL/ 02 NSQ/RPL/QCF ASSESSMENT CENTRE SELF-ASSESSMENT
                OF COMPETENCY FORM
              </h2>

              <div className="absolute top-0 right-0 hidden sm:block">
                <PassportUpload required={false} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Full Name:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {candidateName}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Date of Birth:
                  </span>
                  <span className="text-gray-400">------</span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Address:
                  </span>
                  <span className="text-gray-400">------</span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Phone Number:
                  </span>
                  <span className="text-gray-400">------</span>
                </div>
                <div className="flex items-center gap-2 border-b border-gray-200/70 pb-1.5">
                  <span className="font-semibold text-black shrink-0 w-32">
                    Email Address:
                  </span>
                  <span className="text-gray-400">------</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                  Instructions:
                </h3>
                <p className="text-xs text-gray-500 font-normal">
                  For each skill or task, tick (✓) the column that best
                  describes your confidence in performing it, and provide brief
                  examples where possible.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {MOCK_COMPETENCY_TASKS.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 border-b border-gray-100 pb-4"
                  >
                    <span className="text-xs sm:text-sm font-bold text-black">
                      {task}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-gray-700">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                      />
                      <span className="font-medium">I Can Do This Well</span>
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-gray-400 font-semibold shrink-0">
                        Comment
                      </span>
                      <div className="flex-1 border-b border-dashed border-gray-300 py-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Reflection Questions
              </h3>
              <div className="flex flex-col gap-3 text-xs sm:text-sm">
                <span className="font-semibold text-black">
                  A. What tasks am I most confident performing?
                </span>
                <div className="border-b border-dashed border-gray-300 py-1" />
                <div className="border-b border-dashed border-gray-300 py-1" />
              </div>
              <div className="flex flex-col gap-3 text-xs sm:text-sm">
                <span className="font-semibold text-black">
                  B. Which tasks would I like to improve on?
                </span>
                <div className="border-b border-dashed border-gray-300 py-1" />
                <div className="border-b border-dashed border-gray-300 py-1" />
              </div>
              <div className="flex flex-col gap-3 text-xs sm:text-sm">
                <span className="font-semibold text-black">
                  C. What evidence can I provide to support my experience and
                  skills?
                </span>
                <div className="border-b border-dashed border-gray-300 py-1" />
                <div className="border-b border-dashed border-gray-300 py-1" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wide">
                Assessment Declaration
              </h3>
              <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-gray-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span className="font-medium">
                    I confirm that the information provided is true and
                    accurate.
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span className="font-medium">
                    I understand that submitting this application does not
                    guarantee certification.
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span className="font-medium">
                    I agree to the ELIMI Terms &amp; Conditions and Privacy
                    Policy.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-black tracking-tight">
              Send Feedback
            </h3>
            <form onSubmit={handleSendFeedback} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Comment
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Type Here"
                  className="w-full bg-[#F4F5F7] border border-gray-200 rounded-2xl p-3 text-xs sm:text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a31d38]/20 transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="amber"
                fullWidth
                className="bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm py-3 rounded-xl shadow-md cursor-pointer mt-1"
              >
                Send Feedback
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-black tracking-tight">
              Past Comments
            </h3>
            {pastComments.length > 0 ? (
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto no-scrollbar">
                {pastComments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-3.5 text-xs text-gray-700 leading-relaxed"
                  >
                    {comment}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4 font-normal">
                No feedback sent yet
              </p>
            )}
          </div>
        </div>
      </div>

      {isFeedbackSuccessOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-text">
            <div className="w-24 h-24 mb-4 flex items-center justify-center">
              <Image
                src={ASSETS_URL.successCheckmarkImg}
                alt="Success"
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">
              Feedback Sent Successfully
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mb-6">
              Your feedback to candidate was sent successfully
            </p>
            <Button
              type="button"
              onClick={() => setIsFeedbackSuccessOpen(false)}
              variant="amber"
              fullWidth
              className="h-12 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-base rounded-xl shadow-md cursor-pointer"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
