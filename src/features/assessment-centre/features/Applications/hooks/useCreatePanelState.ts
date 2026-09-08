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
      return centreAssessors.map((a) => {
        const rawQuals =
          (a as any).qualifications ||
          (a as any).assessor?.qualifications ||
          (a as any).assessorSnapshot?.qualifications ||
          [];
        const qualifications = Array.isArray(rawQuals) ? rawQuals : [rawQuals];
        return {
          label: a.name || "Assessor",
          value: a.id || (a as any).assessorId || (a as any).userId,
          qualifications: qualifications.map((q: any) => String(q)),
        };
      });
    }
    return [];
  }, [centreAssessors]);

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setDescription("");
    if (assessorOptions.length >= 3) {
      setLeadPanelistId(assessorOptions[0]?.value || "");
      setPanelMemberId(assessorOptions[1]?.value || "");
      const iv = assessorOptions.find(
        (a) => a.qualifications?.some((q) => q.toUpperCase() === "IV") &&
          a.value !== assessorOptions[0]?.value && a.value !== assessorOptions[1]?.value,
      );
      setInternalVerifierId(iv?.value || assessorOptions[2]?.value || "");
    } else {
      setLeadPanelistId(assessorOptions[0]?.value || "");
      setPanelMemberId(assessorOptions[1]?.value || "");
      setInternalVerifierId(assessorOptions[2]?.value || "");
    }
  }, [isOpen, assessorOptions]);

  const selectedIvAssessor = useMemo(
    () => assessorOptions.find((a) => a.value === internalVerifierId),
    [assessorOptions, internalVerifierId],
  );

  const isSelectedIvQualified = useMemo(() => {
    if (!selectedIvAssessor) return true;
    return selectedIvAssessor.qualifications.some((q) => q.toUpperCase() === "IV");
  }, [selectedIvAssessor]);

  const handleTriggerCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ type: "error", title: "Title Required", description: "Please provide a panel title." });
      return;
    }
    if (!leadPanelistId || !panelMemberId || !internalVerifierId) {
      toast({ type: "error", title: "All Panelists Required", description: "Please select Lead Panelist, Panel Member, and Internal Verifier." });
      return;
    }
    if (new Set([leadPanelistId, panelMemberId, internalVerifierId]).size < 3) {
      toast({ type: "error", title: "Distinct Assessors Required", description: "All 3 panel members must be distinct assessors." });
      return;
    }
    if (!isSelectedIvQualified) {
      toast({
        type: "error",
        title: "IV Qualification Required",
        description: `${selectedIvAssessor?.label || "Selected Internal Verifier"} does not hold the IV qualification. Please select an assessor with AssessorQualification.IV or update their profile.`,
      });
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await postCentrePanelsApi({
        name: title.trim(),
        description: description.trim() || `${title.trim()} Panel`,
        assessorIds: [leadPanelistId, panelMemberId, internalVerifierId],
        leadAssessorId: leadPanelistId,
        observerIvAssessorId: internalVerifierId,
      });

      queryClient.invalidateQueries({ queryKey: ["centre", "panels"] });
      toast({ type: "success", title: "Panel Created", description: "Interview panel successfully created." });
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
    } catch (err: any) {
      toast({ type: "error", title: "Failed to Create Panel", description: err.message || "Error creating panel." });
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
    title, setTitle, description, setDescription,
    leadPanelistId, setLeadPanelistId, panelMemberId, setPanelMemberId,
    internalVerifierId, setInternalVerifierId, selectedIvAssessor, isSelectedIvQualified,
    isConfirmOpen, setIsConfirmOpen, isSuccessOpen, setIsSuccessOpen, isSubmitting,
    assessorOptions, isLoadingAssessors, handleTriggerCreate, handleFinalSubmit, handleContinueSuccess,
  };
}
