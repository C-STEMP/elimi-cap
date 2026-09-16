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
  useSignDirectObservation,
} from "@/src/features/shared/applications/hooks";
import { useAppSelector } from "@/src/store/hooks";

interface NsqAssessorObservationFormsViewProps {
  candidateName: string;
  applicationId: string;
  sessionId?: string;
  unitsAssessed?: string;
  registrationNo?: string;
  isCandidate?: boolean;
  /** Pure view-only access (e.g. centre staff) — no editing and no signing. */
  readOnly?: boolean;
  onBack: () => void;
  onSubmitSuccess?: () => void;
}

const DEFAULT_PCS: ObservationCriterionDef[] = [
  { id: "default_PC_1.1", code: "PC 1.1", desc: "Wear Clean, Smart And Appropriate Personal Protective Equipment." },
  { id: "default_PC_1.2", code: "PC 1.2", desc: "Adhere to environmental safety, tool calibration, and equipment maintenance protocols." },
  { id: "default_PC_1.3", code: "PC 1.3", desc: "Inspect work environment for hazard identification and execute standard risk controls." },
  { id: "default_PC_1.4", code: "PC 1.4", desc: "Select, clean, inspect, and safely store hand and power tools according to manufacturer instructions." },
  { id: "default_PC_1.5", code: "PC 1.5", desc: "Ensure workspace floor area is free of debris, trip hazards, and flammable contaminants." },
  { id: "default_PC_1.6", code: "PC 1.6", desc: "Demonstrate proper manual handling, posture alignment, and safe lifting ergonomics." },
  { id: "default_PC_1.7", code: "PC 1.7", desc: "Follow emergency evacuation protocols, report incidents, and maintain fire extinguisher awareness." },
  { id: "default_PC_1.8", code: "PC 1.8", desc: "Dispose of industrial waste, excess mortar, and hazardous chemicals in compliance with environmental laws." },
  { id: "default_PC_1.9", code: "PC 1.9", desc: "Maintain clear communication with supervisors and team members throughout operational tasks." },
];

export const NsqAssessorObservationFormsView: React.FC<
  NsqAssessorObservationFormsViewProps
> = ({
  candidateName,
  applicationId,
  sessionId,
  unitsAssessed,
  registrationNo,
  isCandidate = false,
  readOnly = false,
  onBack,
  onSubmitSuccess,
}) => {
  const isViewOnly = isCandidate || readOnly;
  const [activeTab, setActiveTab] = useState<"arf02a" | "arf04a">("arf02a");

  const { data: directObsList } = useGetDirectObservations(applicationId, {
    enabled: Boolean(applicationId),
  });
  const obsSessions =
    (directObsList as any)?.sessions ||
    (directObsList as any)?.items ||
    [];
  const sortedObsSessions = obsSessions.slice().sort((a: any, b: any) => {
    const timeA = new Date(a.createdAt || a.scheduledAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.scheduledAt || 0).getTime();
    return timeB - timeA;
  });
  const effectiveSessionId =
    sessionId || sortedObsSessions[0]?.id || "session-1";

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

  // Real criteria + a code/id -> unitId lookup so submitted rows target the
  // actual NOS unit instead of a fabricated id.
  const { criteriaDefs, criterionUnitMap } = useMemo(() => {
    const catalogue = sessionDetail?.catalogue;
    if (!catalogue || catalogue.length === 0) {
      const unitMap: Record<string, string> = {};
      DEFAULT_PCS.forEach((pc) => {
        unitMap[pc.id || pc.code] = "";
      });
      return { criteriaDefs: DEFAULT_PCS, criterionUnitMap: unitMap };
    }
    const defs: ObservationCriterionDef[] = [];
    const unitMap: Record<string, string> = {};
    const seenIds = new Set<string>();

    catalogue.forEach((unit, uIdx) => {
      const unitLabel = unit.referenceNumber || `UNIT ${uIdx + 1}`;
      unit.criteria.forEach((c, cIdx) => {
        const code = normalizeCode(c.code);
        let id = `${unit.unitId}_${code}`;
        if (seenIds.has(id)) {
          id = `${unit.unitId}_${code}_${cIdx}`;
        }
        seenIds.add(id);

        defs.push({
          id,
          code,
          desc: c.text,
          unitId: unit.unitId,
          unitTitle: unit.title,
          unitReference: unitLabel,
          learningObjectiveCode: c.learningObjectiveCode || undefined,
          learningObjectiveText: c.learningObjectiveText || undefined,
        });
        unitMap[id] = unit.unitId;
      });
    });
    return { criteriaDefs: defs, criterionUnitMap: unitMap };
  }, [sessionDetail]);

  // ARF 02A Criteria state
  const [arf02Criteria, setArf02Criteria] = useState<Record<string, Arf02CriteriaState>>(() => {
    const initial: Record<string, Arf02CriteriaState> = {};
    DEFAULT_PCS.forEach((pc) => {
      const key = pc.id || pc.code;
      initial[key] = { fulfilled: false, comment: "" };
      initial[pc.code] = { fulfilled: false, comment: "" };
    });
    return initial;
  });

  // ARF 04A Criteria state
  const [arf04Criteria, setArf04Criteria] = useState<Record<string, Arf04CriteriaState>>(() => {
    const initial: Record<string, Arf04CriteriaState> = {};
    DEFAULT_PCS.forEach((pc) => {
      const key = pc.id || pc.code;
      initial[key] = { satisfactory: false, question: "", answer: "" };
      initial[pc.code] = { satisfactory: false, question: "", answer: "" };
    });
    return initial;
  });

  useEffect(() => {
    if (criteriaDefs === DEFAULT_PCS) return;

    const physicalByKey = new Map(
      (sessionDetail?.physical?.rows || []).map((r) => [
        `${r.unitId}_${normalizeCode(r.performanceCriteriaCode)}`,
        r,
      ]),
    );
    const oralByKey = new Map(
      (sessionDetail?.oral?.rows || []).map((r) => [
        `${r.unitId}_${normalizeCode(r.performanceCriteriaCode)}`,
        r,
      ]),
    );
    const physicalByCode = new Map(
      (sessionDetail?.physical?.rows || []).map((r) => [
        normalizeCode(r.performanceCriteriaCode),
        r,
      ]),
    );
    const oralByCode = new Map(
      (sessionDetail?.oral?.rows || []).map((r) => [
        normalizeCode(r.performanceCriteriaCode),
        r,
      ]),
    );

    setArf02Criteria((prev) => {
      const next: Record<string, Arf02CriteriaState> = {};
      criteriaDefs.forEach((pc) => {
        const key = pc.id || pc.code;
        const saved =
          (pc.unitId ? physicalByKey.get(`${pc.unitId}_${pc.code}`) : undefined) ||
          physicalByCode.get(pc.code);
        next[key] = saved
          ? { fulfilled: saved.met, comment: saved.comment || "" }
          : prev[key] || prev[pc.code] || { fulfilled: false, comment: "" };
      });
      return next;
    });
    setArf04Criteria((prev) => {
      const next: Record<string, Arf04CriteriaState> = {};
      criteriaDefs.forEach((pc) => {
        const key = pc.id || pc.code;
        const saved =
          (pc.unitId ? oralByKey.get(`${pc.unitId}_${pc.code}`) : undefined) ||
          oralByCode.get(pc.code);
        if (saved) {
          const [question, answer] = (saved.comment || "").split(" - ");
          next[key] = {
            satisfactory: saved.met,
            question: question || "",
            answer: answer || "",
          };
        } else {
          next[key] =
            prev[key] || prev[pc.code] || { satisfactory: false, question: "", answer: "" };
        }
      });
      return next;
    });
  }, [criteriaDefs, sessionDetail?.physical, sessionDetail?.oral]);

  const [isWitnessSigned, setIsWitnessSigned] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);
  const assessorDisplayName =
    authUser?.fullName || authUser?.email?.split("@")[0] || "Assessor";
  const candidateDisplayName =
    candidateName || authUser?.fullName || authUser?.email?.split("@")[0] || "Learner";
  const { mutateAsync: signObservation, isPending: isSigningObservation } =
    useSignDirectObservation(applicationId, effectiveSessionId);
  const bothFormsSubmitted =
    sessionDetail?.physicalStatus === "submitted" &&
    sessionDetail?.oralStatus === "submitted";
  // Once a form has been submitted it's locked — editing/resubmitting it
  // shouldn't be possible, independent of the isCandidate/readOnly role gate.
  const isCurrentTabSubmitted =
    activeTab === "arf02a"
      ? sessionDetail?.physicalStatus === "submitted"
      : sessionDetail?.oralStatus === "submitted";
  const isCurrentTabLocked = isViewOnly || isCurrentTabSubmitted;

  const handleSignAsAssessor = async () => {
    try {
      await signObservation({
        role: "unit_assessor",
        signatureMode: "typed",
        typedName: assessorDisplayName,
        signedAt: new Date().toISOString(),
      });
    } catch {
      /* empty */
    }
  };

  const handleSignAsCandidate = async () => {
    try {
      await signObservation({
        role: "learner",
        signatureMode: "typed",
        typedName: candidateDisplayName,
        signedAt: new Date().toISOString(),
      });
    } catch {
      /* empty */
    }
  };

  const fallbackUnitId = sessionDetail?.catalogue?.[0]?.unitId || sessionDetail?.unitIds?.[0] || "";

  const buildRows = (isPhysical: boolean) => {
    return criteriaDefs.map((pc) => {
      const key = pc.id || pc.code;
      if (isPhysical) {
        const val = arf02Criteria[key];
        return {
          unitId: pc.unitId || criterionUnitMap[key] || fallbackUnitId,
          performanceCriteriaCode: pc.code.replace("PC ", ""),
          met: Boolean(val?.fulfilled),
          comment: val?.comment || "",
        };
      } else {
        const val = arf04Criteria[key];
        return {
          unitId: pc.unitId || criterionUnitMap[key] || fallbackUnitId,
          performanceCriteriaCode: pc.code.replace("PC ", ""),
          met: Boolean(val?.satisfactory),
          comment: `${val?.question || ""} - ${val?.answer || ""}`,
        };
      }
    });
  };

  const handleSave = async () => {
    const isPhysical = activeTab === "arf02a";
    const rows = buildRows(isPhysical);

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
    const rows = buildRows(isPhysical);

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

    if (isPhysical) {
      // Physical (ARF 02A) is submitted — advance to the oral (ARF 04A) form
      // rather than exiting, since the sitting isn't complete yet.
      setActiveTab("arf04a");
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

          {isCurrentTabLocked ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-neutral-primary font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <FiChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === "arf02a" ? "arf04a" : "arf02a")
                }
                className="px-5 py-2 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all"
              >
                {isCurrentTabSubmitted && !isViewOnly
                  ? activeTab === "arf02a"
                    ? "Submitted — Next (ARF 04A)"
                    : "Submitted — View ARF 02A"
                  : activeTab === "arf02a"
                    ? "Next (ARF 04A)"
                    : "View ARF 02A"}
              </button>
            </div>
          ) : (
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
                onClick={handleSubmit}
                className="px-5 py-2 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all"
              >
                {activeTab === "arf02a" ? "Next" : "Submit"}
              </button>
            </div>
          )}
        </div>

        {/* Read-Only Notice Banner */}
        {isViewOnly && (
          <div className="w-full bg-[#1E7F4C]/10 border border-[#1E7F4C]/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5">
              <span className="font-extrabold text-[#1E7F4C] uppercase tracking-wider text-[11px]">
                {isCandidate ? "Candidate Form View (Read-Only):" : "Read-Only View:"}
              </span>
              <span className="text-neutral-secondary font-medium">
                {isCandidate
                  ? bothFormsSubmitted && !sessionDetail?.signatures?.learner
                    ? "Your QAA assessor has completed this observation. Please review the criteria below and append your signature."
                    : sessionDetail?.signatures?.learner
                      ? "You have reviewed and signed off on this observation report."
                      : "Reviewing direct observation criteria and assessor evaluation. Signature unlocks once both forms are submitted."
                  : "Reviewing direct observation criteria and assessor evaluation."}
              </span>
            </div>
          </div>
        )}

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
              readOnly={isCurrentTabLocked}
              criteriaDefs={criteriaDefs}
              criteriaState={arf02Criteria}
              onToggleFulfilled={(key) =>
                !isCurrentTabLocked &&
                setArf02Criteria((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], fulfilled: !prev[key]?.fulfilled },
                }))
              }
              onChangeComment={(key, comment) =>
                !isCurrentTabLocked &&
                setArf02Criteria((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], comment },
                }))
              }
            />
          ) : (
            <Arf04OralQuestionsRecord
              readOnly={isCurrentTabLocked}
              criteriaDefs={criteriaDefs}
              criteriaState={arf04Criteria}
              onToggleSatisfactory={(key) =>
                !isCurrentTabLocked &&
                setArf04Criteria((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], satisfactory: !prev[key]?.satisfactory },
                }))
              }
              onChangeQuestion={(key, question) =>
                !isCurrentTabLocked &&
                setArf04Criteria((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], question },
                }))
              }
              onChangeAnswer={(key, answer) =>
                !isCurrentTabLocked &&
                setArf04Criteria((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], answer },
                }))
              }
            />
          )}

          {/* Signatures Section */}
          <ObservationSignaturesSection
            activeTab={activeTab}
            isWitnessSigned={isWitnessSigned}
            onToggleWitnessSigned={() => !isViewOnly && setIsWitnessSigned(!isWitnessSigned)}
            learnerSigned={Boolean(sessionDetail?.signatures?.learner)}
            assessorSigned={Boolean(sessionDetail?.signatures?.unitAssessor)}
            canSignAsAssessor={!isViewOnly && bothFormsSubmitted && !sessionDetail?.signatures?.unitAssessor}
            onSignAsAssessor={handleSignAsAssessor}
            isSigningAsAssessor={!isViewOnly && isSigningObservation}
            canSignAsCandidate={isCandidate && bothFormsSubmitted && !sessionDetail?.signatures?.learner}
            onSignAsCandidate={handleSignAsCandidate}
            isSigningAsCandidate={isCandidate && isSigningObservation}
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
              {isCurrentTabLocked ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(activeTab === "arf02a" ? "arf04a" : "arf02a")
                  }
                  className="px-6 py-2.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {isCurrentTabSubmitted && !isViewOnly
                    ? activeTab === "arf02a"
                      ? "Submitted — Next: ARF 04A"
                      : "Submitted — Previous: ARF 02A"
                    : activeTab === "arf02a"
                      ? "Next: ARF 04A"
                      : "Previous: ARF 02A"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-neutral-primary font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    {activeTab === "arf02a" ? "Next" : "Submit"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
