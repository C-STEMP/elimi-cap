"use client";

import React from "react";
import { IqamSignatureBlock } from "../../common/IqamSignatureBlock";
import { useAssessorProfileSignature } from "@/src/features/shared/assessor/hooks";
import type { IqamIvReportData, IqamSignatureStub } from "../../../api/types";

type Section04CData = NonNullable<IqamIvReportData["con04c"]>;

interface Section04CUnitOutcomesProps {
  units: Array<{ id: string; referenceNumber: string; title: string }>;
  data?: Section04CData;
  readOnly?: boolean;
  onChange: (data: Section04CData) => void;
}

export const Section04CUnitOutcomes: React.FC<Section04CUnitOutcomesProps> = ({
  units,
  data,
  readOnly = false,
  onChange,
}) => {
  const { data: profileSig } = useAssessorProfileSignature();
  const verifiedUnitIds = data?.verifiedUnitIds || [];
  const signatures = data?.signatures || {};

  const appendedSignature = (): IqamSignatureStub => ({
    status: "appended",
    signedAt: new Date().toISOString(),
    signatureMode: profileSig?.assetId ? "upload" : "typed",
    signatureAssetId: profileSig?.assetId || null,
  });

  const update = (patch: Partial<Section04CData>) => {
    onChange({ ...data, ...patch });
  };

  const toggleUnit = (unitId: string) => {
    const next = verifiedUnitIds.includes(unitId)
      ? verifiedUnitIds.filter((id) => id !== unitId)
      : [...verifiedUnitIds, unitId];
    update({ verifiedUnitIds: next });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Units Achieved & Verified Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Units Achieved & Verified:</h4>
        {units.length === 0 ? (
          <p className="text-xs text-gray-400">No units on this application&apos;s trade.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {units.map((unit) => (
              <label
                key={unit.id}
                className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-neutral-primary cursor-pointer hover:bg-gray-100/70"
                title={unit.title}
              >
                <span className="font-bold text-gray-700 truncate pr-2">{unit.referenceNumber}</span>
                <input
                  type="checkbox"
                  checked={verifiedUnitIds.includes(unit.id)}
                  onChange={() => toggleUnit(unit.id)}
                  disabled={readOnly}
                  className="w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-[#a31d38] disabled:opacity-60 shrink-0"
                />
              </label>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1.5 pt-2">
          <label className="text-xs font-bold text-neutral-primary">Date if full qualification achieved</label>
          <input
            type="date"
            value={data?.fullQualificationAchievedAt || ""}
            onChange={(e) => update({ fullQualificationAchievedAt: e.target.value || null })}
            disabled={readOnly}
            className="h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none disabled:opacity-70"
          />
        </div>
      </div>

      {/* Details of Problems */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Details of any problems regarding candidate access to the assessment process</h4>
        <textarea
          rows={3}
          placeholder="Type here"
          value={data?.accessProblems || ""}
          onChange={(e) => update({ accessProblems: e.target.value })}
          disabled={readOnly}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none disabled:opacity-70"
        />
      </div>

      {/* Details of Disagreements */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Details of any disagreements / Appeals and outcome of action taken</h4>
        <textarea
          rows={3}
          placeholder="Type here"
          value={data?.appealsAndOutcomes || ""}
          onChange={(e) => update({ appealsAndOutcomes: e.target.value })}
          disabled={readOnly}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none disabled:opacity-70"
        />
      </div>

      {/* Second Line IV Feedback */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Second Line Internal Verifier Feedback on IQA Process Used and Any Necessary Action Required:</h4>
          <span className="text-[11px] text-gray-500 font-medium">To be completed and signed by the Second Line Internal Verifier (distinct from the primary IV).</span>
        </div>
        <textarea
          rows={3}
          placeholder="Type here"
          value={data?.secondLineFeedback || ""}
          onChange={(e) => update({ secondLineFeedback: e.target.value })}
          disabled={readOnly}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-neutral-primary outline-none resize-none disabled:opacity-70"
        />
        <IqamSignatureBlock
          label="Second Line IQA Signature"
          required={false}
          helperText="Distinct sign-off reserved for Second Line Internal Verifier"
          signed={signatures.secondLineIqa?.status === "appended"}
          dateValue={signatures.secondLineIqa?.signedAt || ""}
          readOnly={readOnly}
          signedText="Signed by Second Line IQA"
          onSign={() => update({ signatures: { ...signatures, secondLineIqa: appendedSignature() } })}
        />
      </div>

      {/* 4-Party Signatures */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-primary">Signature & Date</h4>
        <IqamSignatureBlock
          label="Internal Verifier (IV) Signature"
          required={true}
          helperText="Primary signature of the assigned Internal Verifier"
          signed={signatures.iv?.status === "appended"}
          dateValue={signatures.iv?.signedAt || ""}
          readOnly={readOnly}
          signedText="Signed by Assigned IV"
          onSign={() => update({ signatures: { ...signatures, iv: appendedSignature() } })}
        />
        <IqamSignatureBlock
          label="Countersigning IQA (Lead Verifier)"
          required={false}
          helperText="Distinct countersignature reserved for Lead IQA"
          signed={signatures.countersigningIqa?.status === "appended"}
          dateValue={signatures.countersigningIqa?.signedAt || ""}
          readOnly={readOnly}
          signedText="Signed by Lead IQA"
          onSign={() => update({ signatures: { ...signatures, countersigningIqa: appendedSignature() } })}
        />
      </div>
    </div>
  );
};
