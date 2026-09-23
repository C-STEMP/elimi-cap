"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCentreAssessors, useGetCentreProfile } from "@/src/features/shared/centre/hooks";
import {
  curateInterviewPanelApi,
  scheduleInterviewApi,
  assignIvApi,
} from "@/src/features/shared/applications/api/application.api";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import type { ScheduledPanelistInfo } from "../components/AssignPanelistModal";
import { hasModalDraft, useModalDraft } from "@/src/lib/hooks/usePersistentModal";
import { ASSIGN_PANELIST_MODAL } from "@/src/lib/modal-keys";

interface InitialSchedule { scheduledAt?: string; mode?: string; location?: string; link?: string; useCentreAddress?: boolean; }
interface InitialPanel { members?: { assessorId: string; isLead: boolean; isObserver?: boolean; name?: string }[]; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  tradeName?: string;
  initialSchedule?: InitialSchedule | null;
  initialPanel?: InitialPanel | null;
  onSuccess: (data: ScheduledPanelistInfo) => void;
}

export function usePanelistModalState({
  isOpen, onClose, applicationId, tradeName = "Carpentry", initialSchedule, initialPanel, onSuccess,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: centreProfile } = useGetCentreProfile();
  const { data: centreAssessors = [], isLoading: isLoadingAssessors } = useGetCentreAssessors({ status: "all" });

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTrade, setSelectedTrade] = useModalDraft(ASSIGN_PANELIST_MODAL, "selectedTrade", tradeName);
  const [leadPanelistId, setLeadPanelistId] = useModalDraft(ASSIGN_PANELIST_MODAL, "leadPanelistId", "");
  const [panelMemberId, setPanelMemberId] = useModalDraft(ASSIGN_PANELIST_MODAL, "panelMemberId", "");
  const [internalVerifierId, setInternalVerifierId] = useModalDraft(ASSIGN_PANELIST_MODAL, "internalVerifierId", "");
  const [date, setDate] = useModalDraft(ASSIGN_PANELIST_MODAL, "date", "");
  const [time, setTime] = useModalDraft(ASSIGN_PANELIST_MODAL, "time", "");
  const [interviewMode, setInterviewMode] = useModalDraft<"Physical" | "Virtual">(ASSIGN_PANELIST_MODAL, "interviewMode", "Physical");
  const [sameAsCompanyAddress, setSameAsCompanyAddress] = useModalDraft(ASSIGN_PANELIST_MODAL, "sameAsCompanyAddress", true);
  const [selectedCountry, setSelectedCountry] = useModalDraft(ASSIGN_PANELIST_MODAL, "selectedCountry", "Nigeria");
  const [selectedState, setSelectedState] = useModalDraft(ASSIGN_PANELIST_MODAL, "selectedState", "FCT");
  const [selectedLga, setSelectedLga] = useModalDraft(ASSIGN_PANELIST_MODAL, "selectedLga", "Abuja Municipal");
  const [streetAddress, setStreetAddress] = useModalDraft(ASSIGN_PANELIST_MODAL, "streetAddress", "Cstemp Centre");
  const [meetingLink, setMeetingLink] = useModalDraft(ASSIGN_PANELIST_MODAL, "meetingLink", "www.meet.google.com");
  const [scheduledResult, setScheduledResult] = useState<ScheduledPanelistInfo | null>(null);

  const { countries, states, lgas } = useCountryStateCity(selectedCountry, selectedState);

  const assessorOptions = useMemo(() => {
    if (centreAssessors && centreAssessors.length > 0) {
      return centreAssessors.map((a) => ({
        label: a.name || "Assessor",
        value: a.id || (a as any).assessorId || (a as any).userId,
        sectors: a.sectors || [],
        avatar: (a as any)?.photo?.url || (a as any).avatar || (a as any).photoUrl || undefined,
      }));
    }
    return [
      { label: "RUQOYAT BABALOLA", value: "assessor-ruqoyat", sectors: [{ id: "sec-1", name: tradeName }], avatar: undefined },
      { label: "Angela Jones", value: "assessor-angela", sectors: [{ id: "sec-1", name: tradeName }], avatar: undefined },
      { label: "Amina Bello", value: "assessor-amina", sectors: [{ id: "sec-1", name: tradeName }], avatar: undefined },
      { label: "David Adeleke", value: "assessor-david", sectors: [{ id: "sec-1", name: tradeName }], avatar: undefined },
    ];
  }, [centreAssessors, tradeName]);

  // Skip the on-open reset when a draft was restored after a page reload.
  const restoredDraft = useRef(hasModalDraft(ASSIGN_PANELIST_MODAL));

  useEffect(() => {
    if (!isOpen) {
      restoredDraft.current = false;
      return;
    }
    if (restoredDraft.current) return;
    setSelectedTrade(tradeName || "Carpentry");
    if (initialSchedule?.scheduledAt) {
      try {
        const d = new Date(initialSchedule.scheduledAt);
        if (!isNaN(d.getTime())) {
          setDate(d.toISOString().split("T")[0]);
          setTime(`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`);
        }
      } catch {}
    } else {
      const def = new Date(); def.setDate(def.getDate() + 14);
      setDate(def.toISOString().split("T")[0]); setTime("12:00");
    }
    if (initialSchedule?.mode) setInterviewMode(initialSchedule.mode.toLowerCase().includes("virtual") || initialSchedule.mode.toLowerCase().includes("online") ? "Virtual" : "Physical");
    if (initialSchedule?.link) setMeetingLink(initialSchedule.link);
    if (initialSchedule?.location) setStreetAddress(initialSchedule.location);
    if (initialPanel?.members && initialPanel.members.length > 0) {
      const lead = initialPanel.members.find((m) => m.isLead);
      const regular = initialPanel.members.find((m) => !m.isLead && !m.isObserver);
      const observer = initialPanel.members.find((m) => m.isObserver);
      if (lead) setLeadPanelistId(lead.assessorId);
      if (regular) setPanelMemberId(regular.assessorId);
      if (observer) setInternalVerifierId(observer.assessorId);
    } else if (assessorOptions.length > 0) {
      setLeadPanelistId(assessorOptions[0]?.value || "");
      setPanelMemberId(assessorOptions[1]?.value || assessorOptions[0]?.value || "");
      setInternalVerifierId(assessorOptions[2]?.value || assessorOptions[0]?.value || "");
    }
  }, [
    isOpen,
    tradeName,
    initialSchedule,
    initialPanel,
    assessorOptions,
    setDate,
    setInternalVerifierId,
    setInterviewMode,
    setLeadPanelistId,
    setMeetingLink,
    setPanelMemberId,
    setSelectedTrade,
    setStreetAddress,
    setTime,
  ]);

  useEffect(() => {
    if (!sameAsCompanyAddress) return;
    const addr = centreProfile?.formattedAddress || centreProfile?.address?.address || centreProfile?.name || "Cstemp Centre";
    setStreetAddress(addr);
    if (centreProfile?.address?.state) setSelectedState(centreProfile.address.state);
    if (centreProfile?.address?.country) setSelectedCountry(centreProfile.address.country);
    if (centreProfile?.address?.lga) setSelectedLga(centreProfile.address.lga);
  }, [
    sameAsCompanyAddress,
    centreProfile,
    setSelectedCountry,
    setSelectedLga,
    setSelectedState,
    setStreetAddress,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadPanelistId) { toast({ type: "error", title: "Lead Panelist Required", description: "Please select a Lead Panelist." }); return; }
    if (!date) { toast({ type: "error", title: "Date Required", description: "Please specify the interview date." }); return; }
    setIsSubmitting(true);

    const leadAssessor = assessorOptions.find((a) => a.value === leadPanelistId) || { label: "Ngozi Eze", value: leadPanelistId, sectors: [{ id: "1", name: selectedTrade }] };
    const panelMemberAssessor = assessorOptions.find((a) => a.value === panelMemberId) || { label: "Chidi Okonkwo", value: panelMemberId, sectors: [{ id: "1", name: selectedTrade }] };
    const thirdAssessor = assessorOptions.find((a) => a.value !== leadPanelistId && a.value !== panelMemberId) || { label: "Amina Bello", value: "assessor-3", sectors: [{ id: "1", name: selectedTrade }] };
    const ivAssessor = assessorOptions.find((a) => a.value === internalVerifierId) || { label: "David Adeleke", value: internalVerifierId, sectors: [{ id: "1", name: selectedTrade }] };

    let scheduledAtIso = new Date().toISOString();
    try {
      const [h, m] = (time || "12:00").split(":");
      const d = new Date(date);
      d.setHours(parseInt(h || "12", 10)); d.setMinutes(parseInt(m || "0", 10)); d.setSeconds(0);
      scheduledAtIso = d.toISOString();
    } catch {}

    const mode = interviewMode === "Virtual" ? "online" : "physical";
    const location = mode === "physical" ? streetAddress || "Cstemp Centre" : undefined;
    const link = mode === "online" ? (meetingLink.startsWith("http") ? meetingLink : `https://${meetingLink}`) : undefined;

    const panelistData: ScheduledPanelistInfo = {
      trade: selectedTrade || tradeName,
      leadAssessor: {
        id: leadAssessor.value,
        name: leadAssessor.label,
        avatar: (leadAssessor as any)?.avatar || (leadAssessor as any)?.photo?.url || undefined,
        role: "Lead Panelist",
        tags: [selectedTrade, "RPL Coordinator"],
      },
      panelMembers: [
        {
          id: panelMemberAssessor.value,
          name: panelMemberAssessor.label,
          avatar: (panelMemberAssessor as any)?.avatar || (panelMemberAssessor as any)?.photo?.url || undefined,
          role: "Panel Member",
          tags: [selectedTrade],
          isHighlighted: true,
        },
        {
          id: thirdAssessor.value,
          name: thirdAssessor.label,
          avatar: (thirdAssessor as any)?.avatar || (thirdAssessor as any)?.photo?.url || undefined,
          role: "Panel Member",
          tags: [selectedTrade],
          isHighlighted: false,
        },
      ],
      internalVerifier: {
        id: ivAssessor.value,
        name: ivAssessor.label,
        avatar: (ivAssessor as any)?.avatar || (ivAssessor as any)?.photo?.url || undefined,
        role: "Internal Verifier",
        tags: ["IV", "RPL Quality Assessor"],
      },
      date,
      time: time || "12:00",
      mode: interviewMode === "Virtual" ? "virtual" : "physical",
      location: location || "Cstemp Centre",
      meetingLink: link,
      useCompanyAddress: sameAsCompanyAddress,
    };

    if (typeof window !== "undefined" && applicationId) {
      try {
        localStorage.setItem(`elimi_interview_schedule_${applicationId}`, JSON.stringify({ scheduledAt: scheduledAtIso, mode, location: location || "Cstemp Centre", useCentreAddress: sameAsCompanyAddress, link, status: "scheduled" }));
        localStorage.setItem(`elimi_interview_panel_${applicationId}`, JSON.stringify(panelistData));
      } catch {}
    }

    try {
      if (applicationId && !applicationId.startsWith("mock") && !applicationId.startsWith("sample")) {
        await curateInterviewPanelApi(applicationId, { assessorIds: [leadAssessor.value, panelMemberAssessor.value, thirdAssessor.value], leadAssessorId: leadAssessor.value, observerIvAssessorId: ivAssessor.value }).catch((e) => console.warn("Curate panel:", e));
        await scheduleInterviewApi(applicationId, { scheduledAt: scheduledAtIso, mode, location: mode === "physical" ? location : undefined, useCentreAddress: sameAsCompanyAddress, link: mode === "online" ? link : undefined }).catch((e) => console.warn("Schedule interview:", e));
        if (ivAssessor.value) await assignIvApi(applicationId, ivAssessor.value).catch((e) => console.warn("Assign IV:", e));
      }
      ["applications", "centre"].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
    } catch {}
    finally {
      setIsSubmitting(false); setScheduledResult(panelistData); setIsSuccessOpen(true);
    }
  };

  const handleContinue = () => { setIsSuccessOpen(false); if (scheduledResult) onSuccess(scheduledResult); onClose(); };

  return {
    isSuccessOpen, isSubmitting, selectedTrade, setSelectedTrade,
    leadPanelistId, setLeadPanelistId, panelMemberId, setPanelMemberId,
    internalVerifierId, setInternalVerifierId, date, setDate, time, setTime,
    interviewMode, setInterviewMode, sameAsCompanyAddress, setSameAsCompanyAddress,
    selectedCountry, setSelectedCountry, selectedState, setSelectedState,
    selectedLga, setSelectedLga, streetAddress, setStreetAddress, meetingLink, setMeetingLink,
    assessorOptions, isLoadingAssessors, countries, states, lgas,
    handleSubmit, handleContinue,
  };
}
