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
  const [panelMember1Id, setPanelMember1Id] = useState("");
  const [panelMember2Id, setPanelMember2Id] = useState("");
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
        const lead = assessorOptions[0]?.value || "";
        const m1 = assessorOptions[1]?.value || "";
        const m2 = assessorOptions[2]?.value || "";
        setLeadPanelistId(lead);
        setPanelMember1Id(m1);
        setPanelMember2Id(m2);

        const ivCandidate = assessorOptions.find(
          (a) =>
            a.qualifications?.includes("IV") &&
            a.value !== lead &&
            a.value !== m1 &&
            a.value !== m2
        );
        setInternalVerifierId(ivCandidate?.value || assessorOptions[3]?.value || "");
      } else if (assessorOptions.length === 2) {
        setLeadPanelistId(assessorOptions[0]?.value || "");
        setPanelMember1Id(assessorOptions[1]?.value || "");
        setPanelMember2Id("");
        setInternalVerifierId("");
      } else if (assessorOptions.length === 1) {
        setLeadPanelistId(assessorOptions[0]?.value || "");
        setPanelMember1Id("");
        setPanelMember2Id("");
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
    if (!panelMember1Id) {
      toast({ type: "error", title: "First Panel Member Required", description: "Please select the First Panel Member." });
      return;
    }
    if (!panelMember2Id) {
      toast({ type: "error", title: "Second Panel Member Required", description: "Please select the Second Panel Member." });
      return;
    }

    const votingIds = new Set([leadPanelistId, panelMember1Id, panelMember2Id]);
    if (votingIds.size < 3) {
      toast({
        type: "error",
        title: "Distinct Assessors Required",
        description: "The Lead Panelist and both Panel Members must be 3 different assessors.",
      });
      return;
    }

    if (internalVerifierId && votingIds.has(internalVerifierId)) {
      toast({
        type: "error",
        title: "Distinct Internal Verifier Required",
        description: "The Internal Verifier must be different from the 3 voting panelists.",
      });
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const assessorIds = [leadPanelistId, panelMember1Id, panelMember2Id];
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
    panelMember1Id, setPanelMember1Id,
    panelMember2Id, setPanelMember2Id,
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
