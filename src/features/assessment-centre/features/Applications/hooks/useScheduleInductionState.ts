"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCentreProfile } from "@/src/features/shared/centre/hooks";
import { postCentreInductionsApi } from "@/src/features/shared/centre/api";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { hasModalDraft, useModalDraft } from "@/src/lib/hooks/usePersistentModal";
import { SCHEDULE_INDUCTION_MODAL } from "@/src/lib/modal-keys";

interface Props {
  isOpen: boolean;
  modalKey?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function useScheduleInductionState({
  isOpen,
  modalKey = SCHEDULE_INDUCTION_MODAL,
  onClose,
  onSuccess,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: centreProfile } = useGetCentreProfile();

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { countries, states, lgas } = useCountryStateCity(
    selectedCountry || "Nigeria",
    selectedState,
  );

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
    }
  }, [
    isOpen,
    setDate,
    setDescription,
    setInterviewMode,
    setMeetingLink,
    setSameAsCompanyAddress,
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

      await postCentreInductionsApi({
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
      });

      queryClient.invalidateQueries({ queryKey: ["centre", "inductions"] });
      toast({
        type: "success",
        title: "Induction Scheduled",
        description: "Induction session has been scheduled successfully.",
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
