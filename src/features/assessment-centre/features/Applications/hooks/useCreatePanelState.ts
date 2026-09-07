"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCentreAssessors } from "@/src/features/shared/centre/hooks";
import { postCentrePanelsApi } from "@/src/features/shared/centre/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function useCreatePanelState({ isOpen, onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: centreAssessors = [], isLoading: isLoadingAssessors } =
    useGetCentreAssessors({ status: "all" });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [leadPanelistId, setLeadPanelistId] = useState("");
  const [panelMemberId, setPanelMemberId] = useState("");
  const [internalVerifierId, setInternalVerifierId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assessorOptions = useMemo(() => {
    if (centreAssessors && centreAssessors.length > 0) {
      return centreAssessors.map((a) => ({
        label: a.name || "Assessor",
        value: a.id || (a as any).assessorId || (a as any).userId,
        qualifications: a.qualifications || [],
      }));
    }
    return [];
  }, [centreAssessors]);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      if (assessorOptions.length >= 3) {
        setLeadPanelistId(assessorOptions[0]?.value || "");
        setPanelMemberId(assessorOptions[1]?.value || "");
        const ivCandidate = assessorOptions.find(
          (a) =>
            a.qualifications?.includes("IV") &&
            a.value !== assessorOptions[0]?.value &&
            a.value !== assessorOptions[1]?.value,
        );
        setInternalVerifierId(ivCandidate?.value || assessorOptions[2]?.value || "");
      } else if (assessorOptions.length === 2) {
        setLeadPanelistId(assessorOptions[0]?.value || "");
        setPanelMemberId(assessorOptions[1]?.value || "");
        setInternalVerifierId("");
      } else if (assessorOptions.length === 1) {
        setLeadPanelistId(assessorOptions[0]?.value || "");
        setPanelMemberId("");
        setInternalVerifierId("");
      }
    }
  }, [isOpen, assessorOptions]);

  const handleTriggerCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ type: "error", title: "Title Required", description: "Please provide a panel title." });
      return;
    }
    if (!leadPanelistId) {
      toast({ type: "error", title: "Lead Panelist Required", description: "Please select a Lead Panelist." });
      return;
    }
    if (!panelMemberId) {
      toast({ type: "error", title: "Panel Member Required", description: "Please select a Panel Member." });
      return;
    }
    if (!internalVerifierId) {
      toast({ type: "error", title: "Internal Verifier Required", description: "Please select an Internal Verifier." });
      return;
    }

    const distinctIds = new Set([leadPanelistId, panelMemberId, internalVerifierId]);
    if (distinctIds.size < 3) {
      toast({
        type: "error",
        title: "Distinct Assessors Required",
        description: "The Lead Panelist, Panel Member, and Internal Verifier must be 3 different assessors.",
      });
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const assessorIds = [leadPanelistId, panelMemberId, internalVerifierId].filter(Boolean);
      await postCentrePanelsApi({
        name: title.trim(),
        description: description.trim() || `${title.trim()} Panel`,
        assessorIds,
        leadAssessorId: leadPanelistId,
        observerIvAssessorId: internalVerifierId || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["centre", "panels"] });
      toast({ type: "success", title: "Panel Created", description: "Interview panel successfully created." });

      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Failed to Create Panel",
        description: err.message || "An error occurred while creating the panel.",
      });
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueSuccess = () => {
    setIsSuccessOpen(false);
    onSuccess?.();
    onClose();
  };

  return {
    title, setTitle,
    description, setDescription,
    leadPanelistId, setLeadPanelistId,
    panelMemberId, setPanelMemberId,
    internalVerifierId, setInternalVerifierId,
    isConfirmOpen, setIsConfirmOpen,
    isSuccessOpen, setIsSuccessOpen,
    isSubmitting,
    assessorOptions, isLoadingAssessors,
    handleTriggerCreate,
    handleFinalSubmit,
    handleContinueSuccess,
  };
}
