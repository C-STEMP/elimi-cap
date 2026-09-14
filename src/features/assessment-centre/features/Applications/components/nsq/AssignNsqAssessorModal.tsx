"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiUser, FiSearch, FiAward } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { Select } from "@/src/components/ui/select";
import { useToast } from "@/src/components/ui/toast";
import { useGetCentreAssessors } from "@/src/features/shared/centre/hooks";
import { assignIvApi } from "@/src/features/shared/applications/api/verification.api";
import {
  assignUnitAssessorApi,
  assignNsqAssessorApi,
} from "@/src/features/shared/applications/api/nsq.api";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks";
import { useQueryClient } from "@tanstack/react-query";

export type NsqRoleType = "QAA" | "IQA";

interface AssignNsqAssessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  roleType: NsqRoleType;
  tradeName?: string;
  unitIds?: string[];
  currentAssignedId?: string | null;
  onAssigned?: (assessor: {
    id: string;
    name: string;
    email?: string;
    qualification?: string;
    photoUrl?: string;
  }) => void;
}

export const AssignNsqAssessorModal: React.FC<AssignNsqAssessorModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  roleType,
  tradeName = "General",
  unitIds = [],
  currentAssignedId,
  onAssigned,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real centre assessor roster — GET /centre/assessors?status=approved,
  // scoped to whichever qualification this role actually requires so the
  // backend's own "qualification required" check can never be hit here.
  // QAA assignment needs the QAA credential; NSQ's Internal Verifier
  // assignment is the IQAM role, whose credential is IQM (the spec ties
  // "IQAM / IQM" directly to "NSQ IV").
  const { data: remoteAssessors = [], isLoading: isLoadingAssessors } =
    useGetCentreAssessors({
      status: "approved",
      qualification: roleType === "QAA" ? "QAA" : "IQM",
    });

  const [selectedAssessorId, setSelectedAssessorId] = useState<string>(
    currentAssignedId || "",
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default the picker to the currently assigned assessor (once known) or
  // the first entry in the real roster — never a fabricated id.
  useEffect(() => {
    if (currentAssignedId) {
      setSelectedAssessorId(currentAssignedId);
    } else if (!selectedAssessorId && remoteAssessors.length > 0) {
      setSelectedAssessorId(remoteAssessors[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAssignedId, remoteAssessors]);

  if (!isOpen) return null;

  const isQaa = roleType === "QAA";
  const assessorsPool = remoteAssessors;

  const handleAssign = async () => {
    if (!selectedAssessorId) return;
    setIsSubmitting(true);
    try {
      if (isQaa) {
        // Primary NSQ assessor assignment endpoint.
        await assignNsqAssessorApi(applicationId, selectedAssessorId);

        // Per-unit alias — trade-validated only, assignment stays application-scoped.
        if (unitIds.length > 0) {
          await Promise.all(
            unitIds.map((uId) =>
              assignUnitAssessorApi(applicationId, uId, selectedAssessorId),
            ),
          );
        }
      } else {
        await assignIvApi(applicationId, selectedAssessorId);
      }

      await queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.all,
      });
      await queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });

      setIsSuccess(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Assignment Failed",
        description:
          err?.message ||
          `Unable to assign this ${isQaa ? "QAA" : "IQA"} assessor. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    const chosen = assessorsPool.find((a) => a.id === selectedAssessorId);
    if (!chosen) {
      onClose();
      return;
    }

    toast({
      type: "success",
      title: `${isQaa ? "QAA Assessor" : "IQA Assessor"} Assigned`,
      description: `${chosen.name} has been assigned successfully.`,
    });

    onAssigned?.({
      id: chosen.id,
      name: chosen.name,
      email: chosen.email ?? undefined,
      qualification: isQaa ? "QAA Assessor" : "IQAM Verifier",
      photoUrl: (chosen as any)?.photo?.url ?? undefined,
    });

    setIsSuccess(false);
    onClose();
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-text">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-7 sm:p-9 max-w-md w-full shadow-2xl relative border border-gray-100 flex flex-col gap-5"
        >
          {/* Close button (pink square) */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-[#FDF2F4] text-[#E11D48] hover:bg-rose-100 transition-all cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>

          {!isSuccess ? (
            /* Form View (matching Image 1 & Image 5) */
            <div className="flex flex-col gap-5 pt-2">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  {isQaa ? "Assign Assessors" : "Assign IQA Assessor"}
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-normal">
                  Assign an assessor to this candidate
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                {/* Field 1: Trade (read-only — this assignment is scoped to the application's trade) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Trade
                  </label>
                  <div className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium">
                    {tradeName}
                  </div>
                </div>

                {/* Field 2: Select QAA Assessor — from the centre's real, approved retained roster */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Select {isQaa ? "QAA" : "IQA"} Assessor
                  </label>
                  {isLoadingAssessors ? (
                    <div className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-400">
                      Loading assessors…
                    </div>
                  ) : assessorsPool.length === 0 ? (
                    <div className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-400">
                      No approved retained assessors at this centre yet.
                    </div>
                  ) : (
                    <Select
                      value={selectedAssessorId}
                      onChange={(e) => setSelectedAssessorId(e.target.value)}
                      options={assessorsPool.map((assessor) => ({
                        label: assessor.name,
                        value: assessor.id,
                      }))}
                      placeholder="Select an assessor"
                    />
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  onClick={handleAssign}
                  loading={isSubmitting}
                  disabled={!selectedAssessorId}
                  variant="amber"
                  className="w-full py-3.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Assessor
                </Button>
              </div>
            </div>
          ) : (
            /* Success View (matching Image 2) */
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="w-20 h-20 rounded-full bg-linear-to-tr from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white mb-1">
                <FiCheck className="w-10 h-10 stroke-3" />
              </div>

              <div className="flex flex-col items-center">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  Congratulation
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-normal">
                  {isQaa ? "QAA" : "IQA"} Assessor assigned successfully
                </p>
              </div>

              <div className="w-full mt-4">
                <Button
                  type="button"
                  onClick={handleContinue}
                  variant="amber"
                  className="w-full py-3.5 bg-[#fbab2a] hover:bg-[#e89b1f] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer border-none"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
