"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { ObservationFormHeaderCard } from "./components/observation-forms/ObservationFormHeaderCard";
import {
  Arf02MatrixLog,
  type Arf02CriteriaState,
  type ObservationCriterionDef,
} from "./components/observation-forms/Arf02MatrixLog";
import {
  Arf04OralQuestionsRecord,
  type Arf04CriteriaState,
} from "./components/observation-forms/Arf04OralQuestionsRecord";
import { ObservationSignaturesSection } from "./components/observation-forms/ObservationSignaturesSection";
import {
  useGetDirectObservations,
  useGetDirectObservationSession,
  useSaveDirectObservationForm,
} from "@/src/features/shared/applications/hooks";

interface NsqAssessorObservationFormsViewProps {
  candidateName: string;
  applicationId: string;
  sessionId?: string;
  unitsAssessed?: string;
  registrationNo?: string;
  onBack: () => void;
  onSubmitSuccess?: () => void;
}

const DEFAULT_PCS: ObservationCriterionDef[] = [
  { code: "PC 1.1", desc: "Wear Clean, Smart And Appropriate Personal Protective Equipment." },
  { code: "PC 1.2", desc: "Adhere to environmental safety, tool calibration, and equipment maintenance protocols." },
  { code: "PC 1.3", desc: "Inspect work environment for hazard identification and execute standard risk controls." },
  { code: "PC 1.4", desc: "Select, clean, inspect, and safely store hand and power tools according to manufacturer instructions." },
  { code: "PC 1.5", desc: "Ensure workspace floor area is free of debris, trip hazards, and flammable contaminants." },
  { code: "PC 1.6", desc: "Demonstrate proper manual handling, posture alignment, and safe lifting ergonomics." },
  { code: "PC 1.7", desc: "Follow emergency evacuation protocols, report incidents, and maintain fire extinguisher awareness." },
  { code: "PC 1.8", desc: "Dispose of industrial waste, excess mortar, and hazardous chemicals in compliance with environmental laws." },
  { code: "PC 1.9", desc: "Maintain clear communication with supervisors and team members throughout operational tasks." },
];

export const NsqAssessorObservationFormsView: React.FC<
  NsqAssessorObservationFormsViewProps
> = ({
  candidateName,
  applicationId,
  sessionId,
  unitsAssessed,
  registrationNo,
  onBack,
  onSubmitSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"arf02a" | "arf04a">("arf02a");

  const { data: directObsList } = useGetDirectObservations(applicationId, {
    enabled: Boolean(applicationId),
  });
  const effectiveSessionId =
    sessionId || directObsList?.items?.[0]?.id || "session-1";

  // Session detail carries the real per-unit NOS criteria catalogue for this
  // sitting (`catalogue`) — that's the actual list of PCs to log, not a
  // generic placeholder set.
  const { data: sessionDetail } = useGetDirectObservationSession(
    applicationId,
    effectiveSessionId,
    { enabled: Boolean(applicationId && effectiveSessionId) },
  );

  const { mutateAsync: saveObservationForm } = useSaveDirectObservationForm(
    applicationId,
    effectiveSessionId,
  );

  const normalizeCode = (code: string) => (code.startsWith("PC") ? code : `PC ${code}`);

  // Real criteria + a code -> unitId lookup so submitted rows target the
  // actual NOS unit instead of a fabricated id.
  const { criteriaDefs, criterionUnitMap } = useMemo(() => {
    const catalogue = sessionDetail?.catalogue;
    if (!catalogue || catalogue.length === 0) {
      return { criteriaDefs: DEFAULT_PCS, criterionUnitMap: {} as Record<string, string> };
    }
    const defs: ObservationCriterionDef[] = [];
    const unitMap: Record<string, string> = {};
    catalogue.forEach((unit) => {
      unit.criteria.forEach((c) => {
        const code = normalizeCode(c.code);
        defs.push({ code, desc: c.text });
        unitMap[code] = unit.unitId;
      });
    });
    return { criteriaDefs: defs, criterionUnitMap: unitMap };
  }, [sessionDetail]);

  // ARF 02A Criteria state
  const [arf02Criteria, setArf02Criteria] = useState<Record<string, Arf02CriteriaState>>(() => {
    const initial: Record<string, Arf02CriteriaState> = {};
    DEFAULT_PCS.forEach((pc) => {
      initial[pc.code] = { fulfilled: false, comment: "" };
    });
    return initial;
  });

  // ARF 04A Criteria state
  const [arf04Criteria, setArf04Criteria] = useState<Record<string, Arf04CriteriaState>>(() => {
    const initial: Record<string, Arf04CriteriaState> = {};
    DEFAULT_PCS.forEach((pc) => {
      initial[pc.code] = { satisfactory: false, question: "", answer: "" };
    });
    return initial;
  });

  // Re-seed criteria state once the real catalogue loads.
  useEffect(() => {
    if (criteriaDefs === DEFAULT_PCS) return;
    setArf02Criteria((prev) => {
      const next: Record<string, Arf02CriteriaState> = {};
      criteriaDefs.forEach((pc) => {
        next[pc.code] = prev[pc.code] || { fulfilled: false, comment: "" };
      });
      return next;
    });
    setArf04Criteria((prev) => {
      const next: Record<string, Arf04CriteriaState> = {};
      criteriaDefs.forEach((pc) => {
        next[pc.code] = prev[pc.code] || { satisfactory: false, question: "", answer: "" };
      });
      return next;
    });
  }, [criteriaDefs]);

  const [isWitnessSigned, setIsWitnessSigned] = useState(false);

  const fallbackUnitId = sessionDetail?.catalogue?.[0]?.unitId || sessionDetail?.unitIds?.[0] || "";

  const handleSave = async () => {
    const isPhysical = activeTab === "arf02a";
    const rows = Object.entries(isPhysical ? arf02Criteria : arf04Criteria).map(
      ([code, val]: [string, any]) => ({
        unitId: criterionUnitMap[code] || fallbackUnitId,
        performanceCriteriaCode: code.replace("PC ", ""),
        met: isPhysical ? Boolean(val.fulfilled) : Boolean(val.satisfactory),
        comment: isPhysical
          ? val.comment || ""
          : `${val.question || ""} - ${val.answer || ""}`,
      }),
    );

    try {
      await saveObservationForm({
        formKind: isPhysical ? "physical" : "oral",
        submit: false,
        rows,
      });
    } catch {
      // useSaveDirectObservationForm already surfaced an error toast.
    }
  };

  const handleSubmit = async () => {
    const isPhysical = activeTab === "arf02a";
    const rows = Object.entries(isPhysical ? arf02Criteria : arf04Criteria).map(
      ([code, val]: [string, any]) => ({
        unitId: criterionUnitMap[code] || fallbackUnitId,
        performanceCriteriaCode: code.replace("PC ", ""),
        met: isPhysical ? Boolean(val.fulfilled) : Boolean(val.satisfactory),
        comment: isPhysical
          ? val.comment || ""
          : `${val.question || ""} - ${val.answer || ""}`,
      }),
    );

    try {
      await saveObservationForm({
        formKind: isPhysical ? "physical" : "oral",
        submit: true,
        rows,
      });
    } catch {
      // useSaveDirectObservationForm already surfaced an error toast — stay
      // on the form so the assessor can retry instead of navigating away.
      return;
    }
    onSubmitSuccess?.();
    onBack();
  };

  return (
    <div className="w-full flex flex-col items-center select-text">
      <div className="w-full max-w-7xl xl:max-w-360 mx-auto flex flex-col gap-6">
        {/* Form Tabs & Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("arf02a")}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "arf02a"
                  ? "bg-[#a31d38] text-white shadow-sm"
                  : "bg-gray-100 text-neutral-secondary hover:bg-gray-200/60"
              }`}
            >
              Ref: ARF 02A
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("arf04a")}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "arf04a"
                  ? "bg-[#a31d38] text-white shadow-sm"
                  : "bg-gray-100 text-neutral-secondary hover:bg-gray-200/60"
              }`}
            >
              Ref: ARF 04A
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-neutral-primary font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={activeTab === "arf02a" ? () => setActiveTab("arf04a") : handleSubmit}
              className="px-5 py-2 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all"
            >
              {activeTab === "arf02a" ? "Next" : "Submit"}
            </button>
          </div>
        </div>

        {/* Header Information Card */}
        <ObservationFormHeaderCard
          activeTab={activeTab}
          candidateName={candidateName}
          registrationNo={registrationNo}
          unitsAssessed={unitsAssessed}
        />

        {/* Matrix Log or Oral Questions Record */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-neutral-primary">
              {activeTab === "arf02a"
                ? "Activity & Performance Evidence Log (ARF 02A Matrix)"
                : "Oral Questions, Candidate Answers & Assessment Criteria Record"}
            </h3>
            <p className="text-xs text-neutral-secondary mt-0.5">
              {activeTab === "arf02a"
                ? "Detailed descriptions of work tasks carried out and logged criteria"
                : "Record of questions asked during direct observation with candidate and assessment of answers"}
            </p>
          </div>

          {activeTab === "arf02a" ? (
            <Arf02MatrixLog
              criteriaDefs={DEFAULT_PCS}
              criteriaState={arf02Criteria}
              onToggleFulfilled={(code) =>
                setArf02Criteria((prev) => ({
                  ...prev,
                  [code]: { ...prev[code], fulfilled: !prev[code]?.fulfilled },
                }))
              }
              onChangeComment={(code, comment) =>
                setArf02Criteria((prev) => ({
                  ...prev,
                  [code]: { ...prev[code], comment },
                }))
              }
            />
          ) : (
            <Arf04OralQuestionsRecord
              criteriaDefs={DEFAULT_PCS}
              criteriaState={arf04Criteria}
              onToggleSatisfactory={(code) =>
                setArf04Criteria((prev) => ({
                  ...prev,
                  [code]: { ...prev[code], satisfactory: !prev[code]?.satisfactory },
                }))
              }
              onChangeQuestion={(code, question) =>
                setArf04Criteria((prev) => ({
                  ...prev,
                  [code]: { ...prev[code], question },
                }))
              }
              onChangeAnswer={(code, answer) =>
                setArf04Criteria((prev) => ({
                  ...prev,
                  [code]: { ...prev[code], answer },
                }))
              }
            />
          )}

          {/* Signatures Section */}
          <ObservationSignaturesSection
            activeTab={activeTab}
            isWitnessSigned={isWitnessSigned}
            onToggleWitnessSigned={() => setIsWitnessSigned(!isWitnessSigned)}
          />

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-primary hover:text-[#a31d38] transition-colors cursor-pointer"
            >
              <FiChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-neutral-primary font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={activeTab === "arf02a" ? () => setActiveTab("arf04a") : handleSubmit}
                className="px-6 py-2.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all"
              >
                {activeTab === "arf02a" ? "Next" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
