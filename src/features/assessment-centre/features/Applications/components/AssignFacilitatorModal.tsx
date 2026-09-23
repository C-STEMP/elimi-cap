"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useGetCentreAssessors } from "@/src/features/shared/centre/hooks";
import { assignFacilitatorApi } from "@/src/features/shared/applications/api/application.api";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useModalDraft } from "@/src/lib/hooks/usePersistentModal";
import { ASSIGN_FACILITATOR_MODAL } from "@/src/lib/modal-keys";

interface AssignFacilitatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  tradeName?: string;
  onSuccess: (facilitator: { id: string; name: string }) => void;
}

export const AssignFacilitatorModal: React.FC<AssignFacilitatorModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  tradeName = "Carpentry",
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: centreAssessors = [], isLoading: isLoadingAssessors } =
    useGetCentreAssessors({ status: "approved" });

  const [selectedAssessorId, setSelectedAssessorId] = useModalDraft(ASSIGN_FACILITATOR_MODAL, "selectedAssessorId", "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [assignedInfo, setAssignedInfo] = useState<{ id: string; name: string } | null>(
    null,
  );

  if (!isOpen && !isSuccessOpen) return null;

  // Real, approved centre assessors only — no fabricated fallback names.
  const assessorOptions = centreAssessors.map((a) => ({
    label: a.name || "Assessor",
    value: a.id || (a as any).assessorId || (a as any).userId,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessorId) {
      toast({
        type: "error",
        title: "Selection Required",
        description: "Please select an assessor to assign as facilitator.",
      });
      return;
    }

    const assessor = assessorOptions.find((opt) => opt.value === selectedAssessorId);
    const facilitatorName = assessor?.label || "Assessor";

    setIsSubmitting(true);
    try {
      await assignFacilitatorApi(applicationId, selectedAssessorId);

      await queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      await queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.all,
      });

      setAssignedInfo({ id: selectedAssessorId, name: facilitatorName });
      setIsSuccessOpen(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Assignment Failed",
        description: err?.message || "Unable to assign this facilitator. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueSuccess = () => {
    setIsSuccessOpen(false);
    if (assignedInfo) {
      onSuccess(assignedInfo);
    }
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-100"
            >
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer absolute top-6 right-6 transition-colors"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">
                  Assign Facilitator
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                  Assign a facilitator to this candidate
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Read-only — this assignment is scoped to the application's own trade */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Trade</label>
                  <div className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium">
                    {tradeName}
                  </div>
                </div>

                {!isLoadingAssessors && assessorOptions.length === 0 ? (
                  <div className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-400">
                    No approved retained assessors at this centre yet.
                  </div>
                ) : (
                  <Select
                    label="Select Facilitator"
                    placeholder={isLoadingAssessors ? "Loading Assessors..." : "Select"}
                    value={selectedAssessorId}
                    onChange={(e) => setSelectedAssessorId(e.target.value)}
                    options={assessorOptions}
                  />
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  disabled={!selectedAssessorId || isSubmitting}
                  className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-6 cursor-pointer"
                >
                  {isSubmitting ? "Assigning..." : "Assign Facilitator"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative border border-gray-100"
            >
              <div className="w-20 h-20 rounded-full bg-[#48C046] flex items-center justify-center text-white mb-6 shadow-md">
                <FiCheck className="w-10 h-10 stroke-3" />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-2">
                Facilitator Assigned Successfully
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm font-normal leading-relaxed mb-8 max-w-xs">
                You have successfully assigned a facilitator to this candidate.
              </p>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleContinueSuccess}
                className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl cursor-pointer"
              >
                Continue
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
