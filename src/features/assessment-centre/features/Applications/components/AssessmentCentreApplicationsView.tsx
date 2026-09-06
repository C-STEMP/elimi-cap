"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiFilter, FiList, FiGrid, FiVideo, FiMapPin } from "react-icons/fi";
import { AssessmentCentreFilterModal } from "./AssessmentCentreFilterModal";
import {
  ViewInterviewDetailModal,
  type InterviewRowData,
} from "./ViewInterviewDetailModal";
import { useToast } from "@/src/components/ui/toast";

import {
  useApplication,
  useGetApplications,
} from "@/features/assessment-centre/features/Applications/hooks";
import {
  useGetCentreInterviews,
  useGetCentrePanels,
  useDeleteCentreInterview,
} from "@/src/features/shared/centre/hooks";

interface ApplicationsViewProps {
  onSelectCandidate: (candidateName: string, id?: string) => void;
  onSelectInterview?: (interview: InterviewRowData) => void;
  onOpenCreatePanel?: () => void;
  onOpenScheduleInterview?: () => void;
}

export const AssessmentCentreApplicationsView: React.FC<
  ApplicationsViewProps
> = ({
  onSelectCandidate,
  onSelectInterview,
  onOpenCreatePanel,
  onOpenScheduleInterview,
}) => {
  const { toast } = useToast();
  const { forwardToAwardingBody } = useApplication();
  const { data: remoteApps, isLoading } = useGetApplications();
  const { data: remoteInterviews = [], isLoading: isLoadingInterviews } =
    useGetCentreInterviews();
  const { data: remotePanels = [] } = useGetCentrePanels();
  const deleteInterviewMutation = useDeleteCentreInterview();

  const [activeFilterTab, setActiveFilterTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedInterviewIds, setSelectedInterviewIds] = useState<string[]>([]);
  const [viewingInterview, setViewingInterview] =
    useState<InterviewRowData | null>(null);

  const filterTabs = [
    "All",
    "Pending",
    "Ongoing",
    "Completed",
    "Archived",
    "Interviews",
  ];

  // Combined Interviews list from backend
  const interviewsList: InterviewRowData[] = React.useMemo(() => {
    return remoteInterviews.map((item) => {
      const matchedPanel =
        item.panel || remotePanels.find((p) => p.id === item.panelId);
      const lead =
        matchedPanel?.members?.find((m) => m.isLead)?.name ||
        matchedPanel?.members?.[0]?.name ||
        "—";
      const member =
        matchedPanel?.members?.find((m) => !m.isLead && !m.isObserver)?.name ||
        matchedPanel?.members?.[1]?.name ||
        "—";
      const iv =
        matchedPanel?.members?.find((m) => m.isObserver)?.name ||
        matchedPanel?.members?.[2]?.name ||
        "—";

      return {
        id: item.id,
        title: item.name,
        leadPanelist: lead,
        panelMember: member,
        internalVerifier: iv,
        mode:
          item.mode && item.mode.toLowerCase() === "online"
            ? "Online"
            : "Physical",
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
          : "—",
        scheduledAt: item.scheduledAt || undefined,
        location:
          item.location ||
          (item.useCentreAddress ? "Centre Address" : "Physical Location"),
        link: item.link || undefined,
      };
    });
  }, [remoteInterviews, remotePanels]);

  const filteredInterviews = useMemo(() => {
    if (!searchQuery.trim()) return interviewsList;
    const q = searchQuery.toLowerCase();
    return interviewsList.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.leadPanelist.toLowerCase().includes(q) ||
        item.panelMember.toLowerCase().includes(q) ||
        item.internalVerifier.toLowerCase().includes(q) ||
        item.mode.toLowerCase().includes(q),
    );
  }, [interviewsList, searchQuery]);

  const handleDeleteSelectedInterviews = async () => {
    if (selectedInterviewIds.length === 0) {
      toast({
        type: "info",
        title: "No Interviews Selected",
        description: "Please select interview rows to delete.",
      });
      return;
    }

    try {
      await Promise.all(
        selectedInterviewIds.map((id) => deleteInterviewMutation.mutateAsync(id)),
      );
      setSelectedInterviewIds([]);
      toast({
        type: "success",
        title: "Deleted",
        description: "Selected interviews have been removed.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Delete Failed",
        description: err.message || "Failed to delete selected interviews.",
      });
    }
  };

  const toggleSelectAllInterviews = () => {
    if (selectedInterviewIds.length === filteredInterviews.length) {
      setSelectedInterviewIds([]);
    } else {
      setSelectedInterviewIds(filteredInterviews.map((i: InterviewRowData) => i.id));
    }
  };

  const toggleSelectInterviewRow = (id: string) => {
    setSelectedInterviewIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const applicationsList = (remoteApps ?? []).map((app) => {
    const rawApp = app as any;
    return {
      id: app.id,
      candidateName:
        rawApp.candidate?.name ||
        `${rawApp.candidate?.firstName || ""} ${rawApp.candidate?.lastName || ""}`.trim() ||
        `Candidate (${app.candidateId?.slice(0, 8) || "N/A"})`,
      centreName:
        rawApp.centre?.name || rawApp.centreId || "—",
      facilitatorName:
        rawApp.facilitator?.name ||
        rawApp.assignedFacilitator?.name ||
        (rawApp.facilitator?.firstName
          ? `${rawApp.facilitator.firstName} ${rawApp.facilitator.lastName || ""}`.trim()
          : null) ||
        "—",
      trade: rawApp.trade?.name || app.type || "General",
      assessmentType: app.type || "RPL",
      status:
        app.status === "certified"
          ? "Completed"
          : (app as any).currentStageKey === "application_form" ||
              (app as any).currentStageKey === "application_review" ||
              app.status === "draft"
            ? "Pending"
            : app.status === "in_progress"
              ? "Ongoing"
              : app.status === "rejected" || app.status === "withdrawn"
                ? "Archived"
                : "Pending",
      submittedAt: rawApp.submittedAt
        ? new Date(rawApp.submittedAt).toLocaleDateString("en-GB")
        : new Date(app.createdAt).toLocaleDateString("en-GB"),
    };
  });

  const filteredApplications = applicationsList.filter((app) => {
    const matchesTab =
      activeFilterTab === "All" || app.status === activeFilterTab;
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.assessmentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map((a) => a.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleNotifyAwardingBody = () => {
    if (selectedIds.length === 0) {
      toast({
        type: "info",
        title: "No Candidates Selected",
        description: "Please select candidates to notify the Awarding Body.",
      });
      return;
    }

    selectedIds.forEach((id) => {
      forwardToAwardingBody.mutate(id);
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-[#F9A825]/10 text-[#F9A825]";
      case "Ongoing":
        return "bg-[#FCE8EB] text-[#A31D38]";
      case "Submitted":
      case "Completed":
      case "Approved":
        return "bg-[#1E7F4C]/10 text-[#1E7F4C]";
      case "Archived":
        return "bg-[#E5E7EB] text-[#4B5563]";
      default:
        return "bg-[#E5E7EB] text-[#6B7280]";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto no-scrollbar max-w-xl">
        {filterTabs.map((tab) => {
          const isActive = activeFilterTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilterTab(tab)}
              className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#a31d38] text-white shadow-xs"
                  : "text-gray-600 hover:text-black hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-5">
        <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">
          {activeFilterTab === "All"
            ? "Applications"
            : activeFilterTab === "Interviews"
              ? "Interviews"
              : `RPL ${activeFilterTab} Applications`}
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a31d38]/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <span>Filter</span>
              <FiFilter className="w-4 h-4 text-gray-500" />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List View"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#FCE8EC] text-[#a31d38] shadow-2xs"
                    : "bg-[#EAEBED] text-gray-700 hover:text-neutral-primary"
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {activeFilterTab === "Interviews" ? (
          <div className="flex items-center justify-end gap-5 text-xs font-semibold text-gray-500 pt-1">
            <button
              type="button"
              disabled={selectedInterviewIds.length !== 1}
              onClick={() => {
                const target = interviewsList.find(
                  (i) => i.id === selectedInterviewIds[0],
                );
                if (target) setViewingInterview(target);
              }}
              className="hover:underline cursor-pointer disabled:opacity-40 disabled:hover:no-underline transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={selectedInterviewIds.length === 0}
              onClick={handleDeleteSelectedInterviews}
              className="hover:underline cursor-pointer text-gray-500 hover:text-red-600 disabled:opacity-40 disabled:hover:no-underline transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-5 text-xs font-semibold text-gray-600 pt-1">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="hover:underline cursor-pointer transition-colors"
            >
              Select All
            </button>
          </div>
        )}

        {activeFilterTab === "Interviews" ? (
          viewMode === "list" ? (
            <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] text-gray-600 font-bold border-b border-gray-100 whitespace-nowrap">
                  <tr>
                    <th className="p-4 w-10 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={
                          filteredInterviews.length > 0 &&
                          selectedInterviewIds.length === filteredInterviews.length
                        }
                        onChange={toggleSelectAllInterviews}
                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-4 whitespace-nowrap">Title</th>
                    <th className="p-4 whitespace-nowrap">Lead Panelist</th>
                    <th className="p-4 whitespace-nowrap">Panel Member</th>
                    <th className="p-4 whitespace-nowrap">Internal Verifier</th>
                    <th className="p-4 whitespace-nowrap">Interview Mode</th>
                    <th className="p-4 whitespace-nowrap">Created At</th>
                    <th className="p-4 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {isLoadingInterviews ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
                        <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
                        <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
                        <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
                        <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
                        <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-20" /></td>
                        <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-20" /></td>
                        <td className="p-4 text-right"><div className="h-3.5 bg-gray-200 rounded w-10 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredInterviews.length > 0 ? (
                    filteredInterviews.map((item: InterviewRowData) => {
                      const isSelected = selectedInterviewIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectInterviewRow(item.id)}
                              className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                          </td>
                          <td
                            onClick={() =>
                              onSelectInterview
                                ? onSelectInterview(item)
                                : setViewingInterview(item)
                            }
                            className="p-4 font-semibold text-black cursor-pointer hover:text-primary transition-colors"
                          >
                            {item.title}
                          </td>
                          <td className="p-4 font-normal text-gray-600">
                            {item.leadPanelist}
                          </td>
                          <td className="p-4 font-normal text-gray-600">
                            {item.panelMember}
                          </td>
                          <td className="p-4 font-normal text-gray-600">
                            {item.internalVerifier}
                          </td>
                          <td className="p-4 font-normal text-gray-600">
                            <span className="inline-flex items-center gap-1.5">
                              {item.mode.toLowerCase() === "online" ? (
                                <FiVideo className="w-3.5 h-3.5 text-[#A31D38]" />
                              ) : (
                                <FiMapPin className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              <span>{item.mode}</span>
                            </span>
                          </td>
                          <td className="p-4 font-normal text-gray-600">
                            {item.createdAt}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                onSelectInterview
                                  ? onSelectInterview(item)
                                  : setViewingInterview(item)
                              }
                              className="font-semibold text-black underline underline-offset-2 hover:text-primary transition-colors cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-8 text-center text-gray-400 font-normal"
                      >
                        No interviews found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingInterviews ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs flex flex-col gap-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-100 rounded w-36" />
                  </div>
                ))
              ) : filteredInterviews.length > 0 ? (
                filteredInterviews.map((item: InterviewRowData) => {
                  const isSelected = selectedInterviewIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3 relative group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectInterviewRow(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#a31d38] cursor-pointer"
                        />
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {item.mode}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span
                          onClick={() =>
                            onSelectInterview
                              ? onSelectInterview(item)
                              : setViewingInterview(item)
                          }
                          className="font-bold text-sm text-black cursor-pointer hover:text-primary transition-colors"
                        >
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">
                          Lead: {item.leadPanelist}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">
                          Member: {item.panelMember}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">
                          IV: {item.internalVerifier}
                        </span>
                        <span className="text-xs text-gray-400">
                          Created: {item.createdAt}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onSelectInterview
                            ? onSelectInterview(item)
                            : setViewingInterview(item)
                        }
                        className="text-xs lg:text-sm text-black font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer mt-auto self-start"
                      >
                        View
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full p-8 text-center text-gray-400 font-normal">
                  No interviews found.
                </div>
              )}
            </div>
          )
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F8F9FA] text-gray-600 font-bold border-b border-gray-100 whitespace-nowrap">
                <tr>
                  <th className="p-4 w-10 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        filteredApplications.length > 0 &&
                        selectedIds.length === filteredApplications.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-4 whitespace-nowrap">Candidate Name</th>
                  <th className="p-4 whitespace-nowrap">Centre Name</th>
                  <th className="p-4 whitespace-nowrap">Facilitator</th>
                  <th className="p-4 whitespace-nowrap">Trade</th>
                  <th className="p-4 whitespace-nowrap">Assessment Type</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Submitted at</th>
                  <th className="p-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
                      <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
                      <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
                      <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
                      <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-16" /></td>
                      <td className="p-4"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
                      <td className="p-4"><div className="h-3.5 bg-gray-200 rounded w-20" /></td>
                      <td className="p-4 text-right"><div className="h-3.5 bg-gray-200 rounded w-10 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelectRow(app.id)}
                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                      </td>
                      <td
                        onClick={() => onSelectCandidate(app.candidateName, app.id)}
                        className="p-4 font-semibold text-black cursor-pointer hover:text-primary transition-colors"
                      >
                        {app.candidateName}
                      </td>
                      <td className="p-4 font-normal text-gray-600">
                        {app.centreName}
                      </td>
                      <td className="p-4 font-normal text-gray-600">
                        {app.facilitatorName}
                      </td>
                      <td className="p-4 font-normal text-gray-600">
                        {app.trade}
                      </td>
                      <td className="p-4 font-normal text-gray-600">
                        {app.assessmentType}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(
                            app.status,
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 font-normal text-gray-600">
                        {app.submittedAt}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectCandidate(app.candidateName, app.id)}
                          className="font-semibold text-black underline underline-offset-2 hover:text-primary transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-8 text-center text-gray-400 font-normal"
                    >
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs flex flex-col gap-3 animate-pulse">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded mt-1" />
                    <div className="h-5 bg-gray-200 rounded-full w-20" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-3.5 bg-gray-200 rounded w-36" />
                    <div className="h-3 bg-gray-100 rounded w-28" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                    <div className="h-3 bg-gray-100 rounded w-20" />
                  </div>
                  <div className="h-3.5 bg-gray-200 rounded w-12 mt-auto" />
                </div>
              ))
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((app) => {
                const isSelected = selectedIds.includes(app.id);
                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl p-5 border border-black/20 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(app.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#a31d38] focus:ring-0 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(
                          app.status,
                        )}`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span
                        onClick={() => onSelectCandidate(app.candidateName, app.id)}
                        className="font-bold text-sm text-black cursor-pointer hover:text-primary transition-colors"
                      >
                        {app.candidateName}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        Centre: {app.centreName}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        Facilitator: {app.facilitatorName}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        Trade: {app.trade}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        Type: {app.assessmentType}
                      </span>
                      <span className="text-xs text-gray-400">
                        Submitted: {app.submittedAt}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectCandidate(app.candidateName, app.id)}
                      className="text-xs lg:text-sm text-black font-bold underline hover:text-[#a31d38] transition-colors cursor-pointer mt-auto self-start"
                    >
                      View
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-8 text-center text-gray-400 font-normal">
                No applications found.
              </div>
            )}
          </div>
        )}
      </div>

      <AssessmentCentreFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      <ViewInterviewDetailModal
        isOpen={Boolean(viewingInterview)}
        interview={viewingInterview}
        onClose={() => setViewingInterview(null)}
      />
    </div>
  );
};
