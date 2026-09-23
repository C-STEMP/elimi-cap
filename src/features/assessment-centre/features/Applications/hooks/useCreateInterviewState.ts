"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCentrePanels,
  useGetCentreProfile,
} from "@/src/features/shared/centre/hooks";
import { postCentreInterviewsApi } from "@/src/features/shared/centre/api";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { hasModalDraft, useModalDraft } from "@/src/lib/hooks/usePersistentModal";
import { CREATE_INTERVIEW_MODAL } from "@/src/lib/modal-keys";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenCreatePanel?: () => void;
}

export function useCreateInterviewState({
  isOpen,
  onClose,
  onSuccess,
  onOpenCreatePanel,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: centreProfile } = useGetCentreProfile();
  const { data: panels = [], isLoading: isLoadingPanels } = useGetCentrePanels();

  const [name, setName] = useModalDraft(CREATE_INTERVIEW_MODAL, "name", "");
  const [description, setDescription] = useModalDraft(CREATE_INTERVIEW_MODAL, "description", "");
  const [selectedPanelId, setSelectedPanelId] = useModalDraft(CREATE_INTERVIEW_MODAL, "selectedPanelId", "");
  const [date, setDate] = useModalDraft(CREATE_INTERVIEW_MODAL, "date", "");
  const [time, setTime] = useModalDraft(CREATE_INTERVIEW_MODAL, "time", "10:00");
  const [interviewMode, setInterviewMode] = useModalDraft<"Physical" | "Online">(CREATE_INTERVIEW_MODAL, "interviewMode", "Physical");
  const [sameAsCentreAddress, setSameAsCentreAddress] = useModalDraft(CREATE_INTERVIEW_MODAL, "sameAsCentreAddress", true);
  const [selectedCountry, setSelectedCountry] = useModalDraft(CREATE_INTERVIEW_MODAL, "selectedCountry", centreProfile?.address?.country || "Nigeria");
  const [selectedState, setSelectedState] = useModalDraft(CREATE_INTERVIEW_MODAL, "selectedState", centreProfile?.address?.state || "");
  const [selectedLga, setSelectedLga] = useModalDraft(CREATE_INTERVIEW_MODAL, "selectedLga", centreProfile?.address?.lga || "");
  const [streetAddress, setStreetAddress] = useModalDraft(CREATE_INTERVIEW_MODAL, "streetAddress", 
    centreProfile?.formattedAddress || centreProfile?.address?.address || ""
  );
  const [meetingLink, setMeetingLink] = useModalDraft(CREATE_INTERVIEW_MODAL, "meetingLink", "");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { countries, states, lgas } = useCountryStateCity(selectedCountry, selectedState);

  const panelOptions = useMemo(() => {
    return panels.map((p) => {
      const memberCount = p.members?.length || p.assessorIds?.length || 0;
      return {
        label: `${p.name} (${memberCount} panelist${memberCount !== 1 ? "s" : ""})`,
        value: p.id,
      };
    });
  }, [panels]);

  // Skip the on-open reset when a draft was restored after a page reload.
  const restoredDraft = useRef(hasModalDraft(CREATE_INTERVIEW_MODAL));

  useEffect(() => {
    if (!isOpen) restoredDraft.current = false;
    if (isOpen && !restoredDraft.current) {
      setName("");
      setDescription("");
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDate(d.toISOString().split("T")[0]);
      setTime("10:00");
      setInterviewMode("Physical");
      setSameAsCentreAddress(true);
      setMeetingLink("");
      if (panelOptions.length > 0) {
        setSelectedPanelId(panelOptions[0].value);
      } else {
        setSelectedPanelId("");
      }
    }
  }, [
    isOpen,
    panelOptions,
    setDate,
    setDescription,
    setInterviewMode,
    setMeetingLink,
    setName,
    setSameAsCentreAddress,
    setSelectedPanelId,
    setTime,
  ]);

  useEffect(() => {
    if (sameAsCentreAddress && centreProfile) {
      const companyAddress =
        centreProfile?.formattedAddress ||
        centreProfile?.address?.address ||
        centreProfile?.name ||
        "";
      setStreetAddress(companyAddress);
      if (centreProfile?.address?.state) setSelectedState(centreProfile.address.state);
      if (centreProfile?.address?.country) setSelectedCountry(centreProfile.address.country);
      if (centreProfile?.address?.lga) setSelectedLga(centreProfile.address.lga);
    }
  }, [
    sameAsCentreAddress,
    centreProfile,
    setSelectedCountry,
    setSelectedLga,
    setSelectedState,
    setStreetAddress,
  ]);

  const handleTriggerCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ type: "error", title: "Name Required", description: "Please provide an interview name." });
      return;
    }
    if (!selectedPanelId) {
      toast({
        type: "error",
        title: "Panel Required",
        description: "Please select an interview panel.",
      });
      return;
    }
    if (!date) {
      toast({ type: "error", title: "Date Required", description: "Please select an interview date." });
      return;
    }
    if (!time) {
      toast({ type: "error", title: "Time Required", description: "Please select a start time." });
      return;
    }
    if (interviewMode === "Online" && !meetingLink.trim()) {
      toast({ type: "error", title: "Meeting Link Required", description: "Please provide a valid online meeting link." });
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      let scheduledAtIso = new Date().toISOString();
      try {
        const [h, m] = (time || "10:00").split(":");
        const d = new Date(date);
        d.setHours(parseInt(h || "10", 10));
        d.setMinutes(parseInt(m || "0", 10));
        d.setSeconds(0);
        scheduledAtIso = d.toISOString();
      } catch {
        scheduledAtIso = new Date(`${date}T${time || "10:00"}:00`).toISOString();
      }

      const mode = interviewMode === "Online" ? "online" : "physical";
      const location =
        mode === "physical"
          ? sameAsCentreAddress
            ? centreProfile?.formattedAddress || "Cstemp Centre"
            : `${streetAddress}, ${selectedLga}, ${selectedState}`
          : undefined;

      const formattedLink =
        meetingLink && (meetingLink.startsWith("http://") || meetingLink.startsWith("https://"))
          ? meetingLink
          : meetingLink ? `https://${meetingLink}` : undefined;

      await postCentreInterviewsApi({
        name: name.trim(),
        description: description.trim() || undefined,
        panelId: selectedPanelId,
        scheduledAt: scheduledAtIso,
        mode,
        location,
        useCentreAddress: sameAsCentreAddress,
        link: formattedLink,
        durationMinutes: 60,
      });

      queryClient.invalidateQueries({ queryKey: ["centre", "interviews"] });
      toast({ type: "success", title: "Interview Created", description: "Interview sitting template successfully created." });

      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Failed to Create Interview",
        description: err.message || "An error occurred while creating interview.",
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
    name, setName,
    description, setDescription,
    selectedPanelId, setSelectedPanelId,
    date, setDate,
    time, setTime,
    interviewMode, setInterviewMode,
    sameAsCentreAddress, setSameAsCentreAddress,
    selectedCountry, setSelectedCountry,
    selectedState, setSelectedState,
    selectedLga, setSelectedLga,
    streetAddress, setStreetAddress,
    meetingLink, setMeetingLink,
    isConfirmOpen, setIsConfirmOpen,
    isSuccessOpen, setIsSuccessOpen,
    isSubmitting,
    countries, states, lgas,
    panelOptions, isLoadingPanels,
    handleTriggerCreate,
    handleFinalSubmit,
    handleContinueSuccess,
    onOpenCreatePanel,
  };
}
