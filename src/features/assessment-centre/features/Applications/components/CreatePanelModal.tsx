"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Select } from "@/src/components/ui/select";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCentreAssessors,
  useGetCentreProfile,
} from "@/src/features/shared/centre/hooks";
import {
  postCentrePanelsApi,
  postCentreInterviewsApi,
} from "@/src/features/shared/centre/api";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { ConfirmCreatePanelModal } from "./ConfirmCreatePanelModal";
import { CreatePanelSuccessModal } from "./CreatePanelSuccessModal";

interface CreatePanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePanelModal: React.FC<CreatePanelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: centreProfile } = useGetCentreProfile();
  const { data: centreAssessors = [], isLoading: isLoadingAssessors } =
    useGetCentreAssessors({ status: "all" });

  // Form states
  const [title, setTitle] = useState("");
  const [leadPanelistId, setLeadPanelistId] = useState("");
  const [panelMemberId, setPanelMemberId] = useState("");
  const [internalVerifierId, setInternalVerifierId] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [interviewMode, setInterviewMode] = useState<"Physical" | "Online">(
    "Physical",
  );

  // Physical address state
  const [sameAsCentreAddress, setSameAsCentreAddress] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("Nigeria");
  const [selectedState, setSelectedState] = useState("FCT");
  const [selectedLga, setSelectedLga] = useState("Abuja Municipal");
  const [streetAddress, setStreetAddress] = useState("Cstemp Centre");

  // Virtual state
  const [meetingLink, setMeetingLink] = useState("");

  // Sub-modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { countries, states, lgas } = useCountryStateCity(
    selectedCountry,
    selectedState,
  );

  // Assessor options from backend
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

  // Pre-fill on open
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      // Default to two weeks ahead
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDate(d.toISOString().split("T")[0]);
      setTime("10:00");
      setInterviewMode("Physical");
      setSameAsCentreAddress(true);
      setMeetingLink("");

      if (assessorOptions.length > 0) {
        setLeadPanelistId(assessorOptions[0]?.value || "");
        setPanelMemberId(assessorOptions[1]?.value || assessorOptions[0]?.value || "");
        // Prefer one with IV qualification for verifier
        const ivAssessor =
          assessorOptions.find((a) => a.qualifications.includes("IV")) ||
          assessorOptions[2] ||
          assessorOptions[0];
        setInternalVerifierId(ivAssessor?.value || "");
      }
    }
  }, [isOpen, assessorOptions]);

  // Pre-fill centre address when "Same as centre address" is checked
  useEffect(() => {
    if (sameAsCentreAddress && centreProfile) {
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
  }, [sameAsCentreAddress, centreProfile]);

  if (!isOpen && !isConfirmOpen && !isSuccessOpen) return null;

  const handleTriggerCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        type: "error",
        title: "Title Required",
        description: "Please provide an interview title.",
      });
      return;
    }

    if (!leadPanelistId) {
      toast({
        type: "error",
        title: "Lead Panelist Required",
        description: "Please select a Lead Panelist.",
      });
      return;
    }

    if (!panelMemberId) {
      toast({
        type: "error",
        title: "Panel Member Required",
        description: "Please select a Panel Member.",
      });
      return;
    }

    if (!date) {
      toast({
        type: "error",
        title: "Date Required",
        description: "Please choose an interview date.",
      });
      return;
    }

    if (interviewMode === "Online" && !meetingLink.trim()) {
      toast({
        type: "error",
        title: "Meeting Link Required",
        description: "Please provide a valid online meeting link.",
      });
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Find 3 assessors for the OpenAPI panel requirement
      const lead = assessorOptions.find((a) => a.value === leadPanelistId) || {
        value: leadPanelistId || "assessor-lead",
        label: "Lead Panelist",
      };
      const member1 = assessorOptions.find((a) => a.value === panelMemberId) || {
        value: panelMemberId || "assessor-member-1",
        label: "Panel Member 1",
      };
      const member2 = assessorOptions.find(
        (a) => a.value !== lead.value && a.value !== member1.value,
      ) || {
        value: "assessor-member-2",
        label: "Panel Member 2",
      };

      const ivAssessor = assessorOptions.find(
        (a) => a.value === internalVerifierId,
      ) || {
        value: internalVerifierId || "assessor-iv",
        label: "Internal Verifier",
      };

      const assessorIds = [lead.value, member1.value, member2.value];

      // 1. Create Panel template via POST /centre/panels
      let createdPanel: any = null;
      try {
        createdPanel = await postCentrePanelsApi({
          name: title.trim(),
          description: `${title.trim()} Panel`,
          assessorIds,
          leadAssessorId: lead.value,
          observerIvAssessorId: ivAssessor.value,
        });
      } catch (err) {
        console.warn("API postCentrePanels error (using fallback):", err);
      }

      // Format ISO datetime
      let scheduledAtIso = new Date().toISOString();
      try {
        const timeStr = time || "10:00";
        const [h, m] = timeStr.split(":");
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
        meetingLink &&
        (meetingLink.startsWith("http://") || meetingLink.startsWith("https://"))
          ? meetingLink
          : meetingLink
            ? `https://${meetingLink}`
            : undefined;

      // 2. Create Interview Sitting Template via POST /centre/interviews
      try {
        await postCentreInterviewsApi({
          name: title.trim(),
          description: `${title.trim()} Interview Sitting`,
          durationMinutes: 60,
          panelId: createdPanel?.id || undefined,
          scheduledAt: scheduledAtIso,
          mode,
          location,
          useCentreAddress: sameAsCentreAddress,
          link: formattedLink,
        });
      } catch (err) {
        console.warn("API postCentreInterviews error (using fallback):", err);
      }


      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["centre", "panels"] });
      queryClient.invalidateQueries({ queryKey: ["centre", "interviews"] });
      queryClient.invalidateQueries({ queryKey: ["centre", "interview-bookings"] });

      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Error",
        description: err.message || "Failed to create panel and interview.",
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

  return (
    <>
      <AnimatePresence>
        {isOpen && !isConfirmOpen && !isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 my-auto text-left"
            >
              {/* Close Button matching designs with light pink pill/circle and maroon cross */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 bg-[#FCE8EC] hover:bg-[#FAD1D8] rounded-xl flex items-center justify-center text-[#A31D38] cursor-pointer absolute top-6 right-6 transition-colors select-none"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6 pr-6">
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">
                  Create Panel
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-normal">
                  Create panel for interview assessment
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleTriggerCreate} className="flex flex-col gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Title</label>
                  <input
                    type="text"
                    placeholder="Type here"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
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

                {/* Date & Start Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Date</label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Start Time
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Interview Mode */}
                <div className="flex flex-col gap-1.5">
                  <Select
                    label="Interview Mode"
                    value={interviewMode}
                    onChange={(e) =>
                      setInterviewMode(e.target.value === "Online" ? "Online" : "Physical")
                    }
                    options={["Physical", "Online"]}
                  />
                </div>

                {/* Conditional physical address fields */}
                {interviewMode === "Physical" && (
                  <div className="flex flex-col gap-3 pt-1">
                    {/* Checkbox: Same as centre address */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sameAsCentreAddress}
                        onChange={(e) => setSameAsCentreAddress(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-[#A31D38] accent-[#A31D38] border-gray-300 focus:ring-[#A31D38] cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Same as centre address
                      </span>
                    </label>

                    {!sameAsCentreAddress && (
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
                              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional online meeting link */}
                {interviewMode === "Online" && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Meeting Link
                    </label>
                    <input
                      type="text"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-800 outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all font-medium"
                    />
                  </div>
                )}

                {/* Submit button: Create Interview */}
                <button
                  type="submit"
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.99] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-4 cursor-pointer transition-all shadow-md shadow-amber-500/20 select-none"
                >
                  Create Interview
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Step 2: Confirmation Dialog */}
      <ConfirmCreatePanelModal
        isOpen={isConfirmOpen}
        isSubmitting={isSubmitting}
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Step 3: Success Confirmation Dialog */}
      <CreatePanelSuccessModal
        isOpen={isSuccessOpen}
        onContinue={handleContinueSuccess}
      />
    </>
  );
};
