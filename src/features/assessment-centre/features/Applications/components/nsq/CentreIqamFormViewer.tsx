"use client";

import React from "react";
import {
  useGetCentreIqamSamplingPlan,
  useGetCentreIqamSamplingRecord,
  useGetCentreIqamIvReport,
  useGetCentreIqamAssessorOutcomes,
  useGetCentreIqamFinalPortfolio,
} from "@/src/features/shared/applications/hooks";
import type { IqamToolId } from "@/src/features/assessor/features/iqam/types/iqam.types";

interface CentreIqamFormViewerProps {
  toolId: IqamToolId;
  applicationId: string;
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-gray-800">{value ?? "—"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col gap-3">
      <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">{title}</h4>
      {children}
    </div>
  );
}

function EmptyState({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xs border border-gray-100 flex flex-col items-center text-center gap-2">
      <p className="text-xs text-gray-400">
        {isLoading ? "Loading form…" : "This form has not been submitted yet."}
      </p>
    </div>
  );
}

function AnswerBadge({ answer }: { answer?: "yes" | "no" | null }) {
  if (!answer) return null;
  return (
    <span
      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg ${
        answer === "yes" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {answer.toUpperCase()}
    </span>
  );
}

export const CentreIqamFormViewer: React.FC<CentreIqamFormViewerProps> = ({ toolId, applicationId }) => {
  const samplingPlan = useGetCentreIqamSamplingPlan(applicationId, { enabled: toolId === "CON/02/IQAM" });
  const samplingRecord = useGetCentreIqamSamplingRecord(applicationId, { enabled: toolId === "CON/03/IQAM" });
  const ivReport = useGetCentreIqamIvReport(applicationId, { enabled: toolId === "CON/04/IQAM" });
  const assessorOutcomes = useGetCentreIqamAssessorOutcomes(applicationId, { enabled: toolId === "CON/05/IQAM" });
  const finalPortfolio = useGetCentreIqamFinalPortfolio(applicationId, { enabled: toolId === "CON/06/IQAM" });

  if (toolId === "CON/02/IQAM") {
    const { data, isLoading } = samplingPlan;
    if (!data) return <EmptyState isLoading={isLoading} />;
    return (
      <div className="flex flex-col gap-4">
        <Section title="Sampling Plan">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Trade" value={data.trade?.name} />
            <Field label="Level" value={data.qualificationLevel ? `Level ${data.qualificationLevel.level}` : undefined} />
            <Field label="Term Type" value={data.termType} />
            <Field label="Planned Date" value={data.plannedDate} />
            <Field label="Assessor" value={data.unitAssessor?.name} />
            <Field label="Status" value={data.status} />
          </div>
        </Section>
        {data.units?.length > 0 && (
          <Section title="Units">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.units.map((unit) => (
                <div
                  key={unit.id}
                  className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-800"
                >
                  <span className="font-bold truncate pr-2">{unit.referenceNumber}</span>
                  {data.sampledUnitIds?.includes(unit.id) && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg shrink-0">
                      Sampled
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    );
  }

  if (toolId === "CON/03/IQAM") {
    const { data, isLoading } = samplingRecord;
    if (!data) return <EmptyState isLoading={isLoading} />;
    return (
      <Section title="Sampling Record">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Trade" value={data.trade?.name} />
          <Field label="Level" value={data.qualificationLevel ? `Level ${data.qualificationLevel.level}` : undefined} />
          <Field label="Audit Status" value={data.auditStatus} />
          <Field label="Process" value={data.process} />
          <Field label="Assessment Site" value={data.assessmentSite} />
          <Field label="Method(s)" value={data.methods?.length ? data.methods.join("/") : undefined} />
          <Field label="Assessor" value={data.unitAssessor?.name} />
          <Field label="Status" value={data.status} />
        </div>
      </Section>
    );
  }

  if (toolId === "CON/04/IQAM") {
    const { data, isLoading } = ivReport;
    if (!data) return <EmptyState isLoading={isLoading} />;
    const { con04a, con04b, con04c } = data.data || {};
    return (
      <div className="flex flex-col gap-4">
        <Section title="Verification Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Date of Verification" value={con04a?.dateOfVerification} />
            <Field label="Assessor" value={data.unitAssessor?.name} />
            <Field label="Internal Verifier" value={data.internalVerifier?.name} />
            <Field label="Status" value={data.status} />
          </div>
          {con04a?.standardizationNotes && (
            <p className="text-xs text-gray-700 whitespace-pre-wrap mt-1">{con04a.standardizationNotes}</p>
          )}
        </Section>
        <Section title="IV Summary">
          <p className="text-xs text-gray-700 whitespace-pre-wrap">{con04b?.ivSummary || "—"}</p>
        </Section>
        {con04b?.actions && con04b.actions.length > 0 && (
          <Section title="Agreed Actions">
            <div className="flex flex-col gap-2.5">
              {con04b.actions.map((action) => (
                <div key={action.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-800">{action.actionRequired}</span>
                  <span className="text-[11px] text-gray-500">
                    By {action.byWho}
                    {action.timeline ? ` · ${action.timeline}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}
        {(con04c?.accessProblems || con04c?.appealsAndOutcomes || con04c?.secondLineFeedback) && (
          <Section title="Unit Outcomes">
            {con04c?.accessProblems && (
              <Field label="Access Problems" value={con04c.accessProblems} />
            )}
            {con04c?.appealsAndOutcomes && (
              <Field label="Disagreements / Appeals" value={con04c.appealsAndOutcomes} />
            )}
            {con04c?.secondLineFeedback && (
              <Field label="Second Line IQA Feedback" value={con04c.secondLineFeedback} />
            )}
          </Section>
        )}
      </div>
    );
  }

  if (toolId === "CON/05/IQAM") {
    const { data, isLoading } = assessorOutcomes;
    if (!data) return <EmptyState isLoading={isLoading} />;
    const questions = data.data?.questions || [];
    return (
      <div className="flex flex-col gap-4">
        <Section title="Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Assessor" value={data.unitAssessor?.name} />
            <Field label="Internal Verifier" value={data.internalVerifier?.name} />
            <Field label="Status" value={data.status} />
          </div>
        </Section>
        {questions.length > 0 && (
          <Section title="Observation & Questioning Checklist">
            <div className="flex flex-col gap-2.5">
              {questions.map((item) => (
                <div key={item.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-semibold text-gray-800">{item.question}</span>
                    <AnswerBadge answer={item.answer} />
                  </div>
                  {item.comments && <p className="text-[11px] text-gray-500">{item.comments}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    );
  }

  {
    const { data, isLoading } = finalPortfolio;
    if (!data) return <EmptyState isLoading={isLoading} />;
    const checkpoints = data.data?.checkpoints || [];
    return (
      <div className="flex flex-col gap-4">
        <Section title="Final Portfolio / Award">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Trade" value={data.trade?.name} />
            <Field label="Full Award Verified" value={data.data?.fullAwardVerified === true ? "Yes" : data.data?.fullAwardVerified === false ? "No" : undefined} />
            <Field label="Assessor" value={data.unitAssessor?.name} />
            <Field label="Internal Verifier" value={data.internalVerifier?.name} />
            <Field label="Status" value={data.status} />
          </div>
        </Section>
        {(data.data?.actionForAssessor || data.data?.planAchieved) && (
          <Section title="Action & Plan">
            {data.data?.actionForAssessor && <Field label="Action for Assessor" value={data.data.actionForAssessor} />}
            {data.data?.planAchieved && <Field label="Plan Achieved" value={data.data.planAchieved} />}
          </Section>
        )}
        {checkpoints.length > 0 && (
          <Section title="Comprehensive Portfolio Audit Checkpoints">
            <div className="flex flex-col gap-2.5">
              {checkpoints.map((item) => (
                <div key={item.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-semibold text-gray-800">{item.question}</span>
                    <AnswerBadge answer={item.answer} />
                  </div>
                  {item.comments && <p className="text-[11px] text-gray-500">{item.comments}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    );
  }
};
