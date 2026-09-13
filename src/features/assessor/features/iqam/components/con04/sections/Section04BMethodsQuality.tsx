"use client";

import React from "react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { IqamSignatureBlock } from "../../common/IqamSignatureBlock";
import type { IqamIvReportData, IqamIvReportAction } from "../../../api/types";

type Section04BData = NonNullable<IqamIvReportData["con04b"]>;

interface Section04BMethodsQualityProps {
  availableMethods: string[];
  data?: Section04BData;
  readOnly?: boolean;
  onChange: (data: Section04BData) => void;
}

const METHOD_LABELS: Record<string, string> = {
  DO: "Direct Observation",
  WT: "Witness Testimony",
  QA: "Questions / Discussion",
  WP: "Work Products",
  PS: "Practical / Simulation",
  ASS: "Assignment / Case Study",
  RPL: "APL / Prior Learning",
  PD: "Professional Discussion",
  other: "Other",
};

const VACSR_KEYS = ["valid", "sufficient", "current", "authentic"] as const;
const PROCESS_KEYS = ["planning", "reviewing", "recording", "judgement"] as const;
const PROCESS_LABELS: Record<(typeof PROCESS_KEYS)[number], string> = {
  planning: "Planning",
  reviewing: "Reviewing / Feedback",
  recording: "Recording",
  judgement: "Judgement",
};

export const Section04BMethodsQuality: React.FC<Section04BMethodsQualityProps> = ({
  availableMethods,
  data,
  readOnly = false,
  onChange,
}) => {
  const methodsSampled = data?.methodsSampled || [];
  const vacsr = data?.vacsr || {};
  const processChecked = data?.processChecked || {};
  const actions = data?.actions || [];
  const methodOptions = availableMethods.length > 0 ? [...availableMethods, "other"] : Object.keys(METHOD_LABELS);

  const update = (patch: Partial<Section04BData>) => {
    onChange({ ...data, ...patch });
  };

  const toggleMethod = (code: string) => {
    const next = methodsSampled.includes(code)
      ? methodsSampled.filter((m) => m !== code)
      : [...methodsSampled, code];
    update({ methodsSampled: next });
  };

  const addAction = () => {
    const newAction: IqamIvReportAction = {
      id: `action-${Date.now()}`,
      actionRequired: "",
      byWho: "",
      timeline: "",
      achieved: false,
    };
    update({ actions: [...actions, newAction] });
  };

  const updateAction = (id: string, patch: Partial<IqamIvReportAction>) => {
    update({ actions: actions.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  };

  const removeAction = (id: string) => {
    update({ actions: actions.filter((a) => a.id !== id) });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Methods Sampled */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">
          Methods of Assessment & Evidence Sources Sampled (please tick):
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {methodOptions.map((code) => (
            <label
              key={code}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-neutral-primary cursor-pointer hover:bg-gray-100/70"
            >
              <span className="truncate pr-2 font-medium">{METHOD_LABELS[code] || code}</span>
              <input
                type="checkbox"
                checked={methodsSampled.includes(code)}
                onChange={() => toggleMethod(code)}
                disabled={readOnly}
                className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38] disabled:opacity-60"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Evidence Quality (VACSR Verification) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Evidence Quality (VACSR Verification):</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VACSR_KEYS.map((key) => (
            <label
              key={key}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-neutral-primary cursor-pointer hover:bg-gray-100/70"
            >
              <span className="font-medium capitalize">{key}</span>
              <input
                type="checkbox"
                checked={Boolean(vacsr[key])}
                onChange={() => update({ vacsr: { ...vacsr, [key]: !vacsr[key] } })}
                disabled={readOnly}
                className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38] disabled:opacity-60"
              />
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-neutral-primary">Is there evidence of consistent practice?</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => update({ consistentPractice: true })}
              className={`px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-60 ${data?.consistentPractice === true ? "bg-[#a31d38] text-white" : "bg-gray-100 text-gray-700"}`}
            >
              Yes
            </button>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => update({ consistentPractice: false })}
              className={`px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-60 ${data?.consistentPractice === false ? "bg-[#a31d38] text-white" : "bg-gray-100 text-gray-700"}`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* Part of Assessment Process Checked */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Part of Assessment Process Checked (tick √):</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PROCESS_KEYS.map((key) => (
            <label
              key={key}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-neutral-primary cursor-pointer hover:bg-gray-100/70"
            >
              <span className="font-medium">{PROCESS_LABELS[key]}</span>
              <input
                type="checkbox"
                checked={Boolean(processChecked[key])}
                onChange={() => update({ processChecked: { ...processChecked, [key]: !processChecked[key] } })}
                disabled={readOnly}
                className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38] disabled:opacity-60"
              />
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-neutral-primary">Checked and countersigned by qualified assessor (where necessary):</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => update({ countersignedByQualifiedAssessor: true })}
              className={`px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-60 ${data?.countersignedByQualifiedAssessor === true ? "bg-[#a31d38] text-white" : "bg-gray-100 text-gray-700"}`}
            >
              Yes
            </button>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => update({ countersignedByQualifiedAssessor: false })}
              className={`px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-60 ${data?.countersignedByQualifiedAssessor === false ? "bg-[#a31d38] text-white" : "bg-gray-100 text-gray-700"}`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* IV Detailed Summary */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">IV Detailed Summary & Assessor Feedback</h4>
        <textarea
          rows={4}
          placeholder="Type here"
          value={data?.ivSummary || ""}
          onChange={(e) => update({ ivSummary: e.target.value })}
          disabled={readOnly}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none disabled:opacity-70"
        />
      </div>

      {/* Agreed Action Plan */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Agreed Action Plan & Deadlines:</h4>
          {!readOnly && (
            <button
              type="button"
              onClick={addAction}
              className="h-8 px-3.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Add Action</span>
            </button>
          )}
        </div>

        {actions.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">No agreed actions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-160">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-bold text-[11px]">
                  <th className="py-2.5 px-2">Action Required</th>
                  <th className="py-2.5 px-2">By Who</th>
                  <th className="py-2.5 px-2">Timeline</th>
                  <th className="py-2.5 px-2">Achieved</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {actions.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={act.actionRequired}
                        onChange={(e) => updateAction(act.id, { actionRequired: e.target.value })}
                        disabled={readOnly}
                        className="w-full bg-transparent outline-none text-xs font-medium text-neutral-primary disabled:opacity-70"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={act.byWho}
                        onChange={(e) => updateAction(act.id, { byWho: e.target.value })}
                        disabled={readOnly}
                        className="w-full bg-transparent outline-none text-xs text-gray-600 disabled:opacity-70"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={act.timeline || ""}
                        onChange={(e) => updateAction(act.id, { timeline: e.target.value })}
                        disabled={readOnly}
                        className="w-full bg-transparent outline-none text-xs text-gray-600 disabled:opacity-70"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => updateAction(act.id, { achieved: !act.achieved })}
                        className={`text-xs font-bold capitalize px-2 py-0.5 rounded-full disabled:opacity-70 ${act.achieved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {act.achieved ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="py-2 px-2 text-right">
                      {!readOnly && (
                        <button type="button" onClick={() => removeAction(act.id)} className="text-rose-500 hover:text-rose-700 p-1">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation of Identified Action */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Confirmation of Identified Action Being Achieved:</h4>
        <textarea
          rows={3}
          placeholder="Type here"
          value={data?.actionConfirmation || ""}
          onChange={(e) => update({ actionConfirmation: e.target.value })}
          disabled={readOnly}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none disabled:opacity-70"
        />
      </div>

      {/* IV Signature */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">IV Signature & Date</h4>
        <IqamSignatureBlock
          label="IV Signature"
          signed={data?.ivSignature?.status === "appended"}
          dateValue={data?.ivSignature?.signedAt || ""}
          readOnly={readOnly}
          onSign={() =>
            update({
              ivSignature: { status: "appended", signedAt: new Date().toISOString(), signatureMode: "typed" },
            })
          }
        />
      </div>
    </div>
  );
};
