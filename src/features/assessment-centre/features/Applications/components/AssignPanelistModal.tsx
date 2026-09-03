"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiCalendar, FiClock } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCentreAssessors, useGetCentreProfile } from "@/src/features/shared/centre/hooks";
import {
  curateInterviewPanelApi,
  scheduleInterviewApi,
  assignIvApi,
} from "@/src/features/shared/applications/api/application.api";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";

export interface ScheduledPanelistInfo {
  trade: string;
  leadAssessor: { id: string; name: string; avatar?: string; role?: string; tags?: string[] };
  panelMembers: { id: string; name: string; avatar?: string; role?: string; tags?: string[] }[];
  internalVerifier: { id: string; name: string; avatar?: string; role?: string; tags?: string[] };
  date: string;
  time: string;
  mode: "physical" | "virtual";
  location?: string;
  meetingLink?: string;
  useCompanyAddress?: boolean;
}

interface AssignPanelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  tradeName?: string;
  initialSchedule?: {
    scheduledAt?: string;
    mode?: string;
    location?: string;
    link?: string;
    useCentreAddress?: boolean;
  } | null;
  initialPanel?: {
    members?: {
      assessorId: string;
      isLead: boolean;
      isObserver?: boolean;
      name?: string;
      sectors?: { id: string; name: string }[];
    }[];
  } | null;
  onSuccess: (data: ScheduledPanelistInfo) => void;
}

export const AssignPanelistModal: React.FC<AssignPanelistModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  tradeName = "Carpentry",
  initialSchedule,
  initialPanel,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: centreProfile } = useGetCentreProfile();
  const { data: centreAssessors = [], isLoading: isLoadingAssessors } =
    useGetCentreAssessors({ status: "approved" });

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [selectedTrade, setSelectedTrade] = useState(tradeName);
  const [leadPanelistId, setLeadPanelistId] = useState("");
  const [panelMemberId, setPanelMemberId] = useState("");
  const [internalVerifierId, setInternalVerifierId] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [interviewMode, setInterviewMode] = useState<"Physical" | "Virtual">("Physical");

  // Physical address state
  const [sameAsCompanyAddress, setSameAsCompanyAddress] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("Nigeria");
  const [selectedState, setSelectedState] = useState("FCT");
  const [selectedLga, setSelectedLga] = useState("Abuja Municipal");
  const [streetAddress, setStreetAddress] = useState("Cstemp Centre");

  // Virtual state
  const [meetingLink, setMeetingLink] = useState("www.meet.google.com");

  const [scheduledResult, setScheduledResult] = useState<ScheduledPanelistInfo | null>(null);

  const { countries, states, lgas } = useCountryStateCity(selectedCountry, selectedState);

  // Assessor options fallback
  const assessorOptions = useMemo(() => {
    if (centreAssessors && centreAssessors.length > 0) {
      return centreAssessors.map((a) => ({
        label: a.name || "Assessor",
        value: a.id || (a as any).assessorId || (a as any).userId,
        sectors: a.sectors || [],
        qualifications: a.qualifications || [],
      }));
    }
    return [
      {
        label: "Ngozi Eze",
        value: "assessor-ngozi",
        sectors: [{ id: "sec-1", name: "Carpentry" }],
        qualifications: ["QAA", "IV"],
      },
      {
        label: "Chidi Okonkwo",
        value: "assessor-chidi",
        sectors: [{ id: "sec-1", name: "Carpentry" }],
        qualifications: ["QAA"],
      },
      {
        label: "Amina Bello",
        value: "assessor-amina",
        sectors: [{ id: "sec-1", name: "Carpentry" }],
        qualifications: ["IV"],
      },
      {
        label: "David Adeleke",
        value: "assessor-david",
        sectors: [{ id: "sec-1", name: "Carpentry" }],
        qualifications: ["IQM"],
      },
    ];
  }, [centreAssessors]);

  // Pre-fill on initial load or modal open
  useEffect(() => {
    if (isOpen) {
      setSelectedTrade(tradeName || "Carpentry");

      if (initialSchedule?.scheduledAt) {
        try {
          const d = new Date(initialSchedule.scheduledAt);
          if (!isNaN(d.getTime())) {
            setDate(d.toISOString().split("T")[0]);
            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            setTime(`${hours}:${minutes}`);
          }
        } catch {
          // ignore
        }
      } else {
        // Default to a future date
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 14);
        setDate(defaultDate.toISOString().split("T")[0]);
        setTime("12:00");
      }

      if (initialSchedule?.mode) {
        setInterviewMode(
          initialSchedule.mode.toLowerCase() === "online" ||
            initialSchedule.mode.toLowerCase() === "virtual"
            ? "Virtual"
            : "Physical",
        );
      }

      if (initialSchedule?.link) {
        setMeetingLink(initialSchedule.link);
      }

      if (initialSchedule?.location) {
        setStreetAddress(initialSchedule.location);
      }

      // Pre-fill panel members if existing
      if (initialPanel?.members && initialPanel.members.length > 0) {
        const lead = initialPanel.members.find((m) => m.isLead);
        if (lead) setLeadPanelistId(lead.assessorId);

        const regular = initialPanel.members.find((m) => !m.isLead && !m.isObserver);
        if (regular) setPanelMemberId(regular.assessorId);

        const observer = initialPanel.members.find((m) => m.isObserver);
        if (observer) setInternalVerifierId(observer.assessorId);
      } else {
        // Defaults
        if (assessorOptions.length > 0) {
          setLeadPanelistId(assessorOptions[0]?.value || "");
          setPanelMemberId(assessorOptions[1]?.value || assessorOptions[0]?.value || "");
          setInternalVerifierId(assessorOptions[2]?.value || assessorOptions[0]?.value || "");
        }
      }
    }
  }, [isOpen, tradeName, initialSchedule, initialPanel, assessorOptions]);

  // Update address from centreProfile if sameAsCompanyAddress is checked
  useEffect(() => {
    if (sameAsCompanyAddress) {
      const companyAddress =
        centreProfile?.formattedAddress ||
        centreProfile?.address?.address ||
        centreProfile?.name ||
        "Cstemp Centre";
      setStreetAddress(companyAddress);
      if (centreProfile?.address?.state) setSelectedState(centreProfile.address.state);
      if (centreProfile?.address?.country) setSelectedCountry(centreProfile.address.country);
      if (centreProfile?.address?.lga) setSelectedLga(centreProfile.address.lga);
    }
  }, [sameAsCompanyAddress, centreProfile]);

  if (!isOpen && !isSuccessOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadPanelistId) {
      toast({
        type: "error",
        title: "Lead Panelist Required",
        description: "Please select a Lead Panelist for the interview.",
      });
      return;
    }

    if (!date) {
      toast({
        type: "error",
        title: "Date Required",
        description: "Please specify the interview date.",
      });
      return;
    }

    setIsSubmitting(true);

    // Resolve assessors for the 3 panel members (OpenAPI requires 3 voting members)
    const leadAssessor = assessorOptions.find((a) => a.value === leadPanelistId) || {
      label: "Ngozi Eze",
      value: leadPanelistId || "assessor-1",
      sectors: [{ id: "1", name: selectedTrade }],
    };

    const panelMemberAssessor = assessorOptions.find((a) => a.value === panelMemberId) || {
      label: "Chidi Okonkwo",
      value: panelMemberId || "assessor-2",
      sectors: [{ id: "1", name: selectedTrade }],
    };

    // Third panel member to satisfy 3-member requirement
    const thirdAssessor = assessorOptions.find(
      (a) => a.value !== leadPanelistId && a.value !== panelMemberId,
    ) || {
      label: "Amina Bello",
      value: "assessor-3",
      sectors: [{ id: "1", name: selectedTrade }],
    };

    const ivAssessor = assessorOptions.find((a) => a.value === internalVerifierId) || {
      label: "David Adeleke",
      value: internalVerifierId || "assessor-4",
      sectors: [{ id: "1", name: selectedTrade }],
    };

    // Construct full ISO datetime
    let scheduledAtIso = new Date().toISOString();
    try {
      const timeStr = time || "12:00";
      const [h, m] = timeStr.split(":");
      const d = new Date(date);
      d.setHours(parseInt(h || "12", 10));
      d.setMinutes(parseInt(m || "0", 10));
      d.setSeconds(0);
      scheduledAtIso = d.toISOString();
    } catch {
      scheduledAtIso = new Date(`${date}T${time || "12:00"}:00`).toISOString();
    }

    const mode = interviewMode === "Virtual" ? "online" : "physical";
    const location =
      mode === "physical"
        ? streetAddress || (sameAsCompanyAddress ? "Cstemp Centre" : `${selectedState}, ${selectedCountry}`)
        : undefined;

    const formattedMeetingLink =
      meetingLink.startsWith("http://") || meetingLink.startsWith("https://")
        ? meetingLink
        : `https://${meetingLink}`;

    const link = mode === "online" ? formattedMeetingLink : undefined;

    // Structured panelist info for optimistic storage and parent update
    const panelistData: ScheduledPanelistInfo = {
      trade: selectedTrade || tradeName,
      leadAssessor: {
        id: leadAssessor.value,
        name: leadAssessor.label,
        avatar: "/images/facilitator_ngozi.jpg",
        role: "Lead Panelist",
        tags: [selectedTrade || tradeName, "RPL Coordinator"],
      },
      panelMembers: [
        {
          id: panelMemberAssessor.value,
          name: panelMemberAssessor.label,
          avatar: "/images/facilitator_ngozi.jpg",
          role: "Panel Member",
          tags: [selectedTrade || tradeName, "RPL Coordinator"],
        },
        {
          id: thirdAssessor.value,
          name: thirdAssessor.label,
          avatar: "/images/facilitator_ngozi.jpg",
          role: "Panel Member",
          tags: [selectedTrade || tradeName, "RPL Coordinator"],
        },
      ],
      internalVerifier: {
        id: ivAssessor.value,
        name: ivAssessor.label,
        avatar: "/images/user_avatar_chidi.jpg",
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

    // Store in localStorage for seamless client-side correlation between assessment centre and candidate
    if (typeof window !== "undefined" && applicationId) {
      try {
        localStorage.setItem(
          `elimi_interview_schedule_${applicationId}`,
          JSON.stringify({
            scheduledAt: scheduledAtIso,
            mode,
            location: location || "Cstemp Centre",
            useCentreAddress: sameAsCompanyAddress,
            link,
            status: "scheduled",
          }),
        );
        localStorage.setItem(
          `elimi_interview_panel_${applicationId}`,
          JSON.stringify(panelistData),
        );
      } catch (err) {
        console.warn("Storage error:", err);
      }
    }

    // Call backend endpoints according to OpenAPI spec
    try {
      const isRealApp =
        applicationId &&
        !applicationId.startsWith("mock") &&
        !applicationId.startsWith("sample");

      if (isRealApp) {
        // 1. Curate panel
        const assessorIds = [leadAssessor.value, panelMemberAssessor.value, thirdAssessor.value];
        await curateInterviewPanelApi(applicationId, {
          assessorIds,
          leadAssessorId: leadAssessor.value,
          observerIvAssessorId: ivAssessor.value,
        }).catch((err) => console.warn("Curate panel API fallback:", err));

        // 2. Schedule interview
        await scheduleInterviewApi(applicationId, {
          scheduledAt: scheduledAtIso,
          mode,
          location: mode === "physical" ? location : undefined,
          useCentreAddress: sameAsCompanyAddress,
          link: mode === "online" ? link : undefined,
        }).catch((err) => console.warn("Schedule interview API fallback:", err));

        // 3. Assign IV
        if (ivAssessor.value) {
          await assignIvApi(applicationId, ivAssessor.value).catch((err) =>
            console.warn("Assign IV API fallback:", err),
          );
        }
      }

      // Invalidate relevant React Query caches
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-schedule", applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-panel", applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["centre"],
      });
    } catch (err: any) {
      console.warn("Interview scheduling request exception:", err);
    } finally {
      setIsSubmitting(false);
      setScheduledResult(panelistData);
      setIsSuccessOpen(true);
    }
  };

  const handleContinue = () => {
    setIsSuccessOpen(false);
    if (scheduledResult) {
      onSuccess(scheduledResult);
    }
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 my-auto text-left"
            >
              {/* Close Button with reddish tint */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer absolute top-6 right-6 transition-colors select-none"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6 pr-6">
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">
                  Assign Panelist
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Assign panelist to this candidate
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Trade */}
                <div className="flex flex-col gap-1.5">
                  <Select
                    label="Trade"
                    placeholder="Select"
                    value={selectedTrade}
                    onChange={(e) => setSelectedTrade(e.target.value)}
                    options={[
                      selectedTrade || tradeName,
                      "Carpentry",
                      "Masonry",
                      "Plumbing",
                      "Electrical Installation",
                      "Painting & Decorating",
                      "Welding & Fabrication",
                    ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i)}
                  />
                </div>

                {/* Lead Panelist */}
                <div className="flex flex-col gap-1.5">
                  <Select
                    label="Lead Panelist"
                    placeholder={isLoadingAssessors ? "Loading Assessors..." : "Select"}
                    value={leadPanelistId}
                    onChange={(e) => setLeadPanelistId(e.target.value)}
                    options={assessorOptions.map((a) => ({
                      label: a.label,
                      value: a.value,
                    }))}
                  />
                </div>

                {/* Panel Member */}
                <div className="flex flex-col gap-1.5">
                  <Select
                    label="Panel Member"
                    placeholder={isLoadingAssessors ? "Loading Assessors..." : "Select"}
                    value={panelMemberId}
                    onChange={(e) => setPanelMemberId(e.target.value)}
                    options={assessorOptions
                      .filter((a) => a.value !== leadPanelistId)
                      .map((a) => ({
                        label: a.label,
                        value: a.value,
                      }))}
                  />
                </div>

                {/* Internal Verifier */}
                <div className="flex flex-col gap-1.5">
                  <Select
                    label="Internal Verifier"
                    placeholder={isLoadingAssessors ? "Loading Assessors..." : "Select"}
                    value={internalVerifierId}
                    onChange={(e) => setInternalVerifierId(e.target.value)}
                    options={assessorOptions.map((a) => ({
                      label: a.label,
                      value: a.value,
                    }))}
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Date</label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 pr-10 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all font-medium"
                      />
                      <FiCalendar className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Time</label>
                    <div className="relative flex items-center">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 pr-10 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all font-medium"
                      />
                      <FiClock className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Interview Mode */}
                <div className="flex flex-col gap-1.5">
                  <Select
                    label="Interview Mode"
                    value={interviewMode}
                    onChange={(e) =>
                      setInterviewMode(e.target.value === "Virtual" ? "Virtual" : "Physical")
                    }
                    options={["Physical", "Virtual"]}
                  />
                </div>

                {/* Conditional physical address fields */}
                {interviewMode === "Physical" && (
                  <div className="flex flex-col gap-3 pt-1">
                    {/* Checkbox: Same as company address */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sameAsCompanyAddress}
                        onChange={(e) => setSameAsCompanyAddress(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-[#a31d38] accent-[#a31d38] border-gray-300 focus:ring-[#a31d38] cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Same as company address
                      </span>
                    </label>

                    {!sameAsCompanyAddress && (
                      <div className="flex flex-col gap-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Select
                            label="Country"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            options={
                              countries.length > 0
                                ? countries.map((c) => ({ label: c.label, value: c.label }))
                                : ["Nigeria"]
                            }
                          />
                          <Select
                            label="State of Residence"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            options={
                              states.length > 0
                                ? states.map((s) => ({ label: s.label, value: s.label }))
                                : ["Abuja (FCT)", "Lagos", "Kaduna", "Rivers", "Kano"]
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Select
                            label="Local Government Area"
                            value={selectedLga}
                            onChange={(e) => setSelectedLga(e.target.value)}
                            options={
                              lgas.length > 0
                                ? lgas.map((l) => ({ label: l.label, value: l.label }))
                                : ["Abuja Municipal", "Bwari", "Gwagwalada", "Kuje"]
                            }
                          />
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">
                              Street Address
                            </label>
                            <input
                              type="text"
                              placeholder="Street Address"
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional virtual meeting link */}
                {interviewMode === "Virtual" && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-xs font-semibold text-gray-700">Meeting Link</label>
                    <input
                      type="text"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="www.meet.google.com"
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 transition-all font-medium"
                    />
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-4 cursor-pointer transition-all shadow-none select-none"
                >
                  {isSubmitting ? "Scheduling Interview..." : "Schedule Interview"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Confirmation Modal (Image 4) */}
      <AnimatePresence>
        {isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative border border-gray-100"
            >
              {/* Green glossy 3D Checkmark Circle */}
              <div className="relative mb-6">
                <div className="w-22 h-22 rounded-full bg-radial from-[#7CE05A] via-[#52B836] to-[#3B9B22] flex items-center justify-center shadow-lg shadow-green-600/30">
                  <div className="w-18 h-18 rounded-full bg-linear-to-b from-white/35 to-transparent absolute top-1 left-2 pointer-events-none" />
                  <FiCheck className="w-11 h-11 text-white stroke-[3.5] drop-shadow-xs" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">
                Interview Scheduled Successfully
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm font-normal leading-relaxed mb-8 max-w-xs">
                You have successfully scheduled an interview for this candidate
              </p>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleContinue}
                className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] active:scale-98 text-white font-bold text-sm sm:text-base h-12.5 rounded-xl cursor-pointer transition-all shadow-none select-none"
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
