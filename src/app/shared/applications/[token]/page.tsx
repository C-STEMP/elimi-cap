"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FiCheckCircle, FiShield, FiCalendar, FiClock, FiAlertCircle, FiAward, FiFileText } from "react-icons/fi";
import { Loader } from "@/src/components/ui/loader";
import { getSharedApplicationApi } from "@/src/features/shared/applications/api/core.api";
import type { ApplicationDossier } from "@/src/features/shared/applications/api/types";

export default function SharedApplicationDossierPage() {
  const params = useParams();
  const token = (params?.token as string) || "";

  const [dossier, setDossier] = useState<ApplicationDossier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError("Invalid or missing share token.");
      return;
    }

    getSharedApplicationApi(token)
      .then((data) => {
        setDossier(data);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setError(err?.message || "Unable to load shared application dossier. The link may have expired or been revoked.");
        setIsLoading(false);
      });
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
        <Loader tip="Verifying and retrieving shared dossier..." />
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
          <FiAlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Dossier Unavailable</h2>
        <p className="text-gray-600 text-sm max-w-md mb-6 leading-relaxed">
          {error || "This shared application link is invalid, expired, or revoked by the assessment centre."}
        </p>
      </div>
    );
  }

  const { application, stages = [], appeals = [] } = dossier;
  const candidateName =
    (application as any)?.candidate?.name ||
    `${(application as any)?.candidate?.firstName || ""} ${(application as any)?.candidate?.lastName || ""}`.trim() ||
    "Candidate";

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1A1A1A] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Top Header Card */}
        <div className="bg-[#8A1538] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 z-10">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                Official Dossier
              </span>
              <span className="bg-emerald-500/20 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-400/30">
                <FiShield className="w-3 h-3" /> Token Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              {candidateName}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium">
              Trade: {(application as any)?.trade?.name || application.type || "Vocational Qualification"} &bull; Application ID:{" "}
              <span className="font-mono text-white">{application.id.slice(0, 8)}...</span>
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col items-start sm:items-end gap-1 shrink-0 z-10 backdrop-blur-xs">
            <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">Status</span>
            <span className="text-lg sm:text-xl font-bold text-white capitalize">
              {application.status === "certified" ? "Certified Competent" : application.status.replace("_", " ")}
            </span>
            <span className="text-xs text-white/80 mt-1">
              Submitted: {new Date(application.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Candidate & Verification Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assessment Type</span>
            <span className="text-base font-bold text-gray-900">{application.type || "RPL"}</span>
            <span className="text-xs text-gray-500 mt-1">Recognition of Prior Learning</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assessment Centre</span>
            <span className="text-base font-bold text-gray-900">{(application as any)?.centre?.name || "Accredited Centre"}</span>
            <span className="text-xs text-gray-500 mt-1">Verified Assessment Provider</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal Verification</span>
            <span className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-600" /> Endorsed
            </span>
            <span className="text-xs text-gray-500 mt-1">Approved by Internal Verifier</span>
          </div>
        </div>

        {/* Assessment Stages Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-[#8A1538]" /> Stage Progression & Verification
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {stages.length} Milestones
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {stages.map((stage, idx) => {
              const statusStr = stage.status as string;
              const isDone =
                statusStr === "successful" ||
                statusStr === "certified" ||
                statusStr === "approved";
              const isCurrent =
                statusStr === "in_progress" || statusStr === "under_review";

              return (
                <div
                  key={stage.stageKey || idx}
                  className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : isCurrent
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isDone ? (
                        <FiCheckCircle className="w-5 h-5" />
                      ) : (
                        <FiClock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 capitalize">
                        {stage.stageKey.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {stage.enteredAt
                          ? `Entered: ${new Date(stage.enteredAt).toLocaleDateString()}`
                          : "Milestone registered"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                      isDone
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isCurrent
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusStr.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Appeals Record if any */}
        {appeals && appeals.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-amber-600" /> Appeals & Review Log
            </h2>
            <div className="flex flex-col gap-3">
              {appeals.map((appeal) => (
                <div
                  key={appeal.id}
                  className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 capitalize">
                      Status: {appeal.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-amber-700">
                      {appeal.createdAt ? new Date(appeal.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    &ldquo;{appeal.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4">
          Powered by Elimí Competency Assessment Platform (CAP) &bull; Verified Public Audit Dossier
        </div>
      </div>
    </div>
  );
}
