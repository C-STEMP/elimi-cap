"use client";

import React, { useEffect, useState } from "react";
import { IqamSignatureBlock } from "../common/IqamSignatureBlock";
import {
  useGetIqamAssessorOutcomes,
  usePatchIqamAssessorOutcomes,
  useSubmitIqamAssessorOutcomes,
} from "../../hooks/useIqam";
import type { ChecklistQuestionItem } from "../../types/iqam.types";
import type { IqamAssessorOutcomesData, IqamSignatureStub } from "../../api/types";

interface ObservationChecklistViewProps {
  applicationId: string;
  onBack: () => void;
  candidateName?: string;
  onUpdateHeader?: (config: {
    title: string;
    breadcrumb: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null) => void;
}

const DEFAULT_SECTION_A: ChecklistQuestionItem[] = [
  { id: "a-1", question: "Develop and agree an assessment plan with the candidate using appropriate assessment methods", answer: null, comments: "" },
  { id: "a-2", question: "Agree when assessment will take place with candidates and other people involved", answer: null, comments: "" },
  { id: "a-3", question: "Agree arrangements with candidate for reviewing progress against the assessment plan", answer: null, comments: "" },
  { id: "a-4", question: "Review and update assessment plans to take account of what the candidates has achieved", answer: null, comments: "" },
  { id: "a-5", question: "Give the candidate feedback at an appropriate time and pace", answer: null, comments: "" },
  { id: "a-6", question: "Give feedback in a constructive and encouraging way", answer: null, comments: "" },
  { id: "a-7", question: "Give feedback to the candidate which met his/her needs and was appropriate to his/her level of confidence", answer: null, comments: "" },
  { id: "a-8", question: "Clearly explain his/her candidate how to get advice on the assessment decisions and appeals", answer: null, comments: "" },
];

const DEFAULT_SECTION_B: ChecklistQuestionItem[] = [
  { id: "b-1", question: "How to operate the centre standardisation and internal quality assurance procedures?", answer: null, comments: "" },
  { id: "b-2", question: "How to access the centre appeals and access to fair assessment policy?", answer: null, comments: "" },
  { id: "b-3", question: "What information is made available by the awarding organization and Regulatory Body?", answer: null, comments: "" },
  { id: "b-4", question: "How to identify and gain resources to support candidates who have special assessment needs?", answer: null, comments: "" },
];

interface ChecklistFormData extends IqamAssessorOutcomesData {
  sectionA?: ChecklistQuestionItem[];
  sectionB?: ChecklistQuestionItem[];
  ivSignature?: IqamSignatureStub | null;
  secondLineIvSignature?: IqamSignatureStub | null;
}

export const ObservationChecklistView: React.FC<ObservationChecklistViewProps> = ({
  applicationId,
  onBack,
  candidateName,
  onUpdateHeader,
}) => {
  const { data: outcomes, isLoading } = useGetIqamAssessorOutcomes(applicationId);
  const patchOutcomes = usePatchIqamAssessorOutcomes(applicationId);
  const submitOutcomes = useSubmitIqamAssessorOutcomes(applicationId);

  const [formData, setFormData] = useState<ChecklistFormData>({ schemaVersion: 1 });
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (outcomes?.data && !hasHydrated) {
      setFormData(outcomes.data as ChecklistFormData);
      setHasHydrated(true);
    }
  }, [outcomes, hasHydrated]);

  const isSubmitted = Boolean(outcomes?.submittedAt);
  const sectionA = formData.sectionA?.length ? formData.sectionA : DEFAULT_SECTION_A;
  const sectionB = formData.sectionB?.length ? formData.sectionB : DEFAULT_SECTION_B;

  const handleSubmit = async () => {
    if (isSubmitted) return;
    try {
      await patchOutcomes.mutateAsync(formData);
      await submitOutcomes.mutateAsync();
    } catch {
      // Errors already surfaced via toast by the hooks.
    }
  };

  useEffect(() => {
    onUpdateHeader?.({
      title: "IV Observation & Questioning Checklist",
      breadcrumb: "IV Observation Checklist",
      actionLabel: isSubmitted ? undefined : "Submit",
      onAction: isSubmitted ? undefined : handleSubmit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUpdateHeader, formData, isSubmitted]);

  const toggleAnswer = (list: "A" | "B", id: string, ans: "yes" | "no") => {
    const key = list === "A" ? "sectionA" : "sectionB";
    const current = list === "A" ? sectionA : sectionB;
    setFormData((prev) => ({
      ...prev,
      [key]: current.map((q) => (q.id === id ? { ...q, answer: ans } : q)),
    }));
  };

  const updateComments = (list: "A" | "B", id: string, text: string) => {
    const key = list === "A" ? "sectionA" : "sectionB";
    const current = list === "A" ? sectionA : sectionB;
    setFormData((prev) => ({
      ...prev,
      [key]: current.map((q) => (q.id === id ? { ...q, comments: text } : q)),
    }));
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 select-text pb-12 animate-pulse">
        <div className="w-full max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Banner skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
                <div className="h-2.5 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-36 mt-2" />
              </div>
            ))}
          </div>

          {/* Section skeleton */}
          {Array.from({ length: 2 }).map((_, sectionIdx) => (
            <div
              key={sectionIdx}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5"
            >
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-6 bg-gray-200 rounded-lg w-20 shrink-0" />
                    </div>
                    <div className="h-10 bg-gray-100 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 select-text pb-12 animate-fadeIn">

      <div className="w-full max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {isSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs font-bold text-emerald-800">
            This checklist was submitted on {new Date(outcomes!.submittedAt!).toLocaleDateString("en-GB")}. It is now read-only.
          </div>
        )}

        {/* Banner */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">REF: CON/05/IQAM</span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1">
                IV Observation & Questioning Checklist
              </h4>
            </div>
            <div className="bg-[#f8f9fa] border border-gray-100/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CANDIDATE NAME</span>
              <h4 className="text-xs sm:text-sm font-black text-neutral-primary mt-1 truncate">
                {outcomes?.candidate.name || candidateName || "—"}
              </h4>
            </div>
          </div>
        </div>

        {/* Section A: Did the Assessor? */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Did the Assessor?</h3>
          <div className="flex flex-col gap-4">
            {sectionA.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-semibold text-neutral-primary leading-snug">{item.question}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" disabled={isSubmitted} onClick={() => toggleAnswer("A", item.id, "yes")} className={`px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-60 ${item.answer === "yes" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>Yes</button>
                    <button type="button" disabled={isSubmitted} onClick={() => toggleAnswer("A", item.id, "no")} className={`px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-60 ${item.answer === "no" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>No</button>
                  </div>
                </div>
                <textarea rows={2} placeholder="Type Comments Here" value={item.comments} onChange={(e) => updateComments("A", item.id, e.target.value)} disabled={isSubmitted} className="w-full p-3 bg-white rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none disabled:opacity-70" />
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Can the Assessor explain? */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Can the Assessor explain?</h3>
          <div className="flex flex-col gap-4">
            {sectionB.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-semibold text-neutral-primary leading-snug">{item.question}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" disabled={isSubmitted} onClick={() => toggleAnswer("B", item.id, "yes")} className={`px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-60 ${item.answer === "yes" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>Yes</button>
                    <button type="button" disabled={isSubmitted} onClick={() => toggleAnswer("B", item.id, "no")} className={`px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-60 ${item.answer === "no" ? "bg-[#a31d38] text-white" : "bg-gray-200 text-gray-700"}`}>No</button>
                  </div>
                </div>
                <textarea rows={2} placeholder="Type Comments Here" value={item.comments} onChange={(e) => updateComments("B", item.id, e.target.value)} disabled={isSubmitted} className="w-full p-3 bg-white rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none disabled:opacity-70" />
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">Signature & Date</h3>
          <IqamSignatureBlock
            label="IV Signature"
            signed={formData.ivSignature?.status === "appended"}
            dateValue={formData.ivSignature?.signedAt || ""}
            readOnly={isSubmitted}
            onSign={() =>
              setFormData((prev) => ({
                ...prev,
                ivSignature: { status: "appended", signedAt: new Date().toISOString(), signatureMode: "typed" },
              }))
            }
          />
          <IqamSignatureBlock
            label="Second line IV signature"
            signed={formData.secondLineIvSignature?.status === "appended"}
            dateValue={formData.secondLineIvSignature?.signedAt || ""}
            readOnly={isSubmitted}
            onSign={() =>
              setFormData((prev) => ({
                ...prev,
                secondLineIvSignature: { status: "appended", signedAt: new Date().toISOString(), signatureMode: "typed" },
              }))
            }
          />
        </div>
      </div>
    </div>
  );
};
