"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCentreProfile,
  useGetCentreInductions,
} from "@/src/features/shared/centre/hooks";
import { useGetApplications } from "@/src/features/shared/applications/hooks";
import { postCentreInductionsApi } from "@/src/features/shared/centre/api";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { hasModalDraft, useModalDraft } from "@/src/lib/hooks/usePersistentModal";
import { SCHEDULE_INDUCTION_MODAL } from "@/src/lib/modal-keys";

interface Props {
  isOpen: boolean;
  modalKey?: string;
  onClose: () => void;
  onSuccess?: () => void;
  initialApplicationId?: string;
}

export function useScheduleInductionState({
  isOpen,
  modalKey = SCHEDULE_INDUCTION_MODAL,
  onClose,
  onSuccess,
  initialApplicationId,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: centreProfile } = useGetCentreProfile();
  const { data: applications = [] } = useGetApplications();
  const { data: existingInductions = [] } = useGetCentreInductions();

  const [title, setTitle] = useModalDraft(modalKey, "title", "");
  const [description, setDescription] = useModalDraft(modalKey, "description", "");
  const [date, setDate] = useModalDraft(modalKey, "date", "");
  const [time, setTime] = useModalDraft(modalKey, "time", "");
  const [interviewMode, setInterviewMode] = useModalDraft<"Virtual" | "Physical">(
    modalKey,
    "interviewMode",
    "Virtual",
  );
  const [sameAsCompanyAddress, setSameAsCompanyAddress] = useModalDraft(
    modalKey,
    "sameAsCompanyAddress",
    true,
  );
  const [selectedCountry, setSelectedCountry] = useModalDraft(
    modalKey,
    "selectedCountry",
    centreProfile?.address?.country || "",
  );
  const [selectedState, setSelectedState] = useModalDraft(
    modalKey,
    "selectedState",
    centreProfile?.address?.state || "",
  );
  const [selectedLga, setSelectedLga] = useModalDraft(
    modalKey,
    "selectedLga",
    centreProfile?.address?.lga || "",
  );
  const [streetAddress, setStreetAddress] = useModalDraft(
    modalKey,
    "streetAddress",
    centreProfile?.formattedAddress || centreProfile?.address?.address || "",
  );
  const [meetingLink, setMeetingLink] = useModalDraft(modalKey, "meetingLink", "");
  const [selectedApplicationIds, setSelectedApplicationIds] = useModalDraft<string[]>(
    modalKey,
    "selectedApplicationIds",
    [],
  );
  const [candidatePickerId, setCandidatePickerId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { countries, states, lgas } = useCountryStateCity(
    selectedCountry || "Nigeria",
    selectedState,
  );

  // Applications that already belong to an existing induction (one induction per application)
  const alreadyInductedAppIds = useMemo(() => {
    const ids = new Set<string>();
    existingInductions.forEach((ind: any) => {
      if (Array.isArray(ind.attendees)) {
        ind.attendees.forEach((att: any) => {
          const appId = att.applicationId || att.id;
          if (appId) ids.add(appId);
        });
      }
      if (Array.isArray(ind.candidates)) {
        ind.candidates.forEach((c: any) => {
          const appId = c.applicationId || c.id;
          if (appId) ids.add(appId);
        });
      }
      if (Array.isArray(ind.applicationIds)) {
        ind.applicationIds.forEach((appId: string) => {
          if (appId) ids.add(appId);
        });
      }
    });
    return ids;
  }, [existingInductions]);

  // Eligible RPL applications with completed payment and not already in an induction
  const eligibleCandidates = useMemo(() => {
    return applications
      .filter((app: any) => {
        const appType = (app.type || app.assessmentType || "RPL").toUpperCase();
        if (appType !== "RPL") return false;
        if (app.status === "rejected" || app.status === "withdrawn") return false;
        if (alreadyInductedAppIds.has(app.id)) return false;

        const isPaidExplicit =
          app.paymentStatus === "paid" ||
          app.paymentStatus === "successful" ||
          app.isPaid === true ||
          app.payment?.status === "successful" ||
          app.payment?.status === "paid";
        const isPastPaymentStage = Boolean(
          app.currentStageKey &&
            ![
              "draft",
              "submitted",
              "application_form",
              "application_review",
              "payment",
            ].includes(app.currentStageKey),
        );

        return isPaidExplicit || isPastPaymentStage;
      })
      .map((app: any) => {
        const name =
          app.candidate?.name ||
          `${app.candidate?.firstName || ""} ${app.candidate?.lastName || ""}`.trim() ||
          "Candidate";
        const tradeName =
          app.trade?.name ||
          (typeof app.trade === "string" ? app.trade : null) ||
          "General";
        return {
          applicationId: app.id,
          name,
          tradeName,
          label: `${name} — ${tradeName}`,
          value: app.id,
        };
      });
  }, [applications, alreadyInductedAppIds, initialApplicationId]);

  const selectedCandidates = useMemo(() => {
    return selectedApplicationIds.map((appId) => {
      const found = eligibleCandidates.find((c) => c.applicationId === appId);
      if (found) return found;
      const rawApp = applications.find((a: any) => a.id === appId) as any;
      const name =
        rawApp?.candidate?.name ||
        `${rawApp?.candidate?.firstName || ""} ${rawApp?.candidate?.lastName || ""}`.trim() ||
        "Candidate";
      const tradeName =
        rawApp?.trade?.name ||
        (typeof rawApp?.trade === "string" ? rawApp.trade : null) ||
        "General";
      return {
        applicationId: appId,
        name,
        tradeName,
        label: `${name} — ${tradeName}`,
        value: appId,
      };
    });
  }, [selectedApplicationIds, eligibleCandidates, applications]);

  const unselectedCandidates = useMemo(() => {
    const selectedSet = new Set(selectedApplicationIds);
    return eligibleCandidates.filter((c) => !selectedSet.has(c.applicationId));
  }, [eligibleCandidates, selectedApplicationIds]);

  const handleSelectCandidate = (appId: string) => {
    if (!appId) return;
    setSelectedApplicationIds((prev) =>
      prev.includes(appId) ? prev : [...prev, appId],
    );
    setCandidatePickerId("");
  };

  const handleAddCandidate = () => {
    if (!candidatePickerId) return;
    handleSelectCandidate(candidatePickerId);
  };

  const handleRemoveCandidate = (appId: string) => {
    setSelectedApplicationIds((prev) => prev.filter((id) => id !== appId));
  };

  const restoredDraft = useRef(hasModalDraft(modalKey));

  useEffect(() => {
    if (!isOpen) restoredDraft.current = false;
    if (isOpen && !restoredDraft.current) {
      setTitle("");
      setDescription("");
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDate(d.toISOString().split("T")[0]);
      setTime("10:00");
      setInterviewMode("Virtual");
      setSameAsCompanyAddress(true);
      setMeetingLink("");
      setCandidatePickerId("");
      if (initialApplicationId && !alreadyInductedAppIds.has(initialApplicationId)) {
        setSelectedApplicationIds([initialApplicationId]);
      } else {
        setSelectedApplicationIds([]);
      }
    }
  }, [
    isOpen,
    initialApplicationId,
    alreadyInductedAppIds,
    setDate,
    setDescription,
    setInterviewMode,
    setMeetingLink,
    setSameAsCompanyAddress,
    setSelectedApplicationIds,
    setTime,
    setTitle,
  ]);

  useEffect(() => {
    if (sameAsCompanyAddress && centreProfile) {
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
    sameAsCompanyAddress,
    centreProfile,
    setSelectedCountry,
    setSelectedLga,
    setSelectedState,
    setStreetAddress,
  ]);

  const handleTriggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        type: "error",
        title: "Title Required",
        description: "Please provide an induction title.",
      });
      return;
    }
    if (!date) {
      toast({
        type: "error",
        title: "Date Required",
        description: "Please select an induction date.",
      });
      return;
    }
    if (!time) {
      toast({
        type: "error",
        title: "Time Required",
        description: "Please select an induction time.",
      });
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    // Allow up to 5 minutes grace for clock drift today
    if (isNaN(selectedDateTime.getTime()) || selectedDateTime.getTime() < now.getTime() - 5 * 60 * 1000) {
      toast({
        type: "error",
        title: "Future Date Required",
        description: "Induction date and time must be in the future.",
      });
      return;
    }
    if (interviewMode === "Virtual" && !meetingLink.trim()) {
      toast({
        type: "error",
        title: "Meeting Link Required",
        description: "Please provide a valid meeting link.",
      });
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

      const mode = interviewMode === "Virtual" ? "online" : "physical";
      const location =
        mode === "physical"
          ? sameAsCompanyAddress
            ? [
                streetAddress || centreProfile?.formattedAddress || centreProfile?.address?.address,
                selectedLga || centreProfile?.address?.lga,
                selectedState || centreProfile?.address?.state,
              ]
                .filter(Boolean)
                .join(", ") || "Centre Address"
            : [streetAddress, selectedLga, selectedState].filter(Boolean).join(", ") || "Physical Location"
          : undefined;

      const formattedLink =
        meetingLink && (meetingLink.startsWith("http://") || meetingLink.startsWith("https://"))
          ? meetingLink
          : meetingLink
          ? `https://${meetingLink}`
          : undefined;

      const created = await postCentreInductionsApi({
        name: title.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledAt: scheduledAtIso,
        mode,
        location,
        country: selectedCountry || centreProfile?.address?.country || "Nigeria",
        state: selectedState || centreProfile?.address?.state || "",
        lga: selectedLga || centreProfile?.address?.lga || "",
        streetAddress: streetAddress || centreProfile?.formattedAddress || "",
        useCentreAddress: sameAsCompanyAddress,
        link: formattedLink,
        durationMinutes: 60,
        applicationIds:
          selectedApplicationIds.length > 0 ? selectedApplicationIds : undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["centre", "inductions"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["centre", "applications"] });

      toast({
        type: "success",
        title: "Induction Scheduled",
        description: "You have successfully scheduled an induction.",
      });

      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Failed to Schedule Induction",
        description: err.message || "An error occurred while scheduling induction.",
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
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    time,
    setTime,
    interviewMode,
    setInterviewMode,
    sameAsCompanyAddress,
    setSameAsCompanyAddress,
    selectedCountry,
    setSelectedCountry,
    selectedState,
    setSelectedState,
    selectedLga,
    setSelectedLga,
    streetAddress,
    setStreetAddress,
    meetingLink,
    setMeetingLink,
    selectedCandidates,
    unselectedCandidates,
    candidatePickerId,
    setCandidatePickerId,
    handleSelectCandidate,
    handleAddCandidate,
    handleRemoveCandidate,
    isConfirmOpen,
    setIsConfirmOpen,
    isSuccessOpen,
    setIsSuccessOpen,
    isSubmitting,
    countries,
    states,
    lgas,
    handleTriggerSubmit,
    handleFinalSubmit,
    handleContinueSuccess,
  };
}

