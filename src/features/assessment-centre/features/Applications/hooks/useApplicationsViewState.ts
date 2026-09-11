"use client";

import { useState, useMemo } from "react";
import { useToast } from "@/src/components/ui/toast";
import {
  useApplication,
  useGetApplications,
} from "@/features/assessment-centre/features/Applications/hooks";
import {
  useGetCentreInterviews,
  useGetCentrePanels,
  useDeleteCentreInterview,
  useDeleteCentrePanel,
  useBulkCertifyApplications,
} from "@/src/features/shared/centre/hooks";
import {
  mapInterviewItem,
  mapApplicationItem,
  mapPanelItem,
  type PanelRowData,
} from "../utils/appViewHelpers";
import type { InterviewRowData } from "../components/ViewInterviewDetailModal";

export function useApplicationsViewState() {
  const { toast } = useToast();
  const { forwardToAwardingBody } = useApplication();
  const [activeFilterTab, setActiveFilterTab] = useState<string>("All");

  const appQueryParams = useMemo(() => {
    if (activeFilterTab === "IV Approved") {
      return { ivApproved: true, status: "in_progress" as const };
    }
    return undefined;
  }, [activeFilterTab]);

  const { data: remoteApps, isLoading } = useGetApplications(appQueryParams);
  const { data: remoteInterviews = [], isLoading: isLoadingInterviews } = useGetCentreInterviews();
  const { data: remotePanels = [], isLoading: isLoadingPanels } = useGetCentrePanels();
  const deleteInterviewMutation = useDeleteCentreInterview();
  const deletePanelMutation = useDeleteCentrePanel();
  const bulkCertifyMutation = useBulkCertifyApplications();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedInterviewIds, setSelectedInterviewIds] = useState<string[]>([]);
  const [selectedPanelIds, setSelectedPanelIds] = useState<string[]>([]);
  const [viewingInterview, setViewingInterview] = useState<InterviewRowData | null>(null);
  const [viewingPanel, setViewingPanel] = useState<PanelRowData | null>(null);

  const panelsList: PanelRowData[] = useMemo(
    () => remotePanels.map(mapPanelItem),
    [remotePanels],
  );

  const filteredPanels = useMemo(() => {
    if (!searchQuery.trim()) return panelsList;
    const q = searchQuery.toLowerCase();
    return panelsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.leadAssessor.toLowerCase().includes(q) ||
        p.panelMembers.toLowerCase().includes(q) ||
        p.internalVerifier.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [panelsList, searchQuery]);

  const interviewsList: InterviewRowData[] = useMemo(
    () => remoteInterviews.map((item) => mapInterviewItem(item, remotePanels)),
    [remoteInterviews, remotePanels],
  );

  const filteredInterviews = useMemo(() => {
    if (!searchQuery.trim()) return interviewsList;
    const q = searchQuery.toLowerCase();
    return interviewsList.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.leadPanelist.toLowerCase().includes(q) ||
        i.panelMember.toLowerCase().includes(q) ||
        i.internalVerifier.toLowerCase().includes(q) ||
        i.mode.toLowerCase().includes(q),
    );
  }, [interviewsList, searchQuery]);

  const applicationsList = useMemo(
    () => (remoteApps ?? []).map(mapApplicationItem),
    [remoteApps],
  );

  const filteredApplications = useMemo(
    () =>
      applicationsList.filter((app) => {
        const matchesTab =
          activeFilterTab === "All" ||
          (activeFilterTab === "IV Approved"
            ? Boolean((app as any).ivApproved || app.status === "IV Approved")
            : app.status === activeFilterTab);
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          app.candidateName.toLowerCase().includes(q) ||
          app.trade.toLowerCase().includes(q) ||
          app.assessmentType.toLowerCase().includes(q);
        return matchesTab && matchesSearch;
      }),
    [applicationsList, activeFilterTab, searchQuery],
  );

  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === filteredApplications.length ? [] : filteredApplications.map((a) => a.id),
    );

  const toggleSelectRow = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleSelectAllInterviews = () =>
    setSelectedInterviewIds(
      selectedInterviewIds.length === filteredInterviews.length
        ? []
        : filteredInterviews.map((i) => i.id),
    );

  const toggleSelectInterviewRow = (id: string) =>
    setSelectedInterviewIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleDeleteSelectedInterviews = async () => {
    if (selectedInterviewIds.length === 0) {
      toast({ type: "info", title: "No Interviews Selected", description: "Please select interview rows to delete." });
      return;
    }
    try {
      await Promise.all(selectedInterviewIds.map((id) => deleteInterviewMutation.mutateAsync(id)));
      setSelectedInterviewIds([]);
      toast({ type: "success", title: "Deleted", description: "Selected interviews have been removed." });
    } catch (err: any) {
      toast({ type: "error", title: "Delete Failed", description: err.message || "Failed to delete selected interviews." });
    }
  };

  const toggleSelectAllPanels = () =>
    setSelectedPanelIds(
      selectedPanelIds.length === filteredPanels.length
        ? []
        : filteredPanels.map((p) => p.id),
    );

  const toggleSelectPanelRow = (id: string) =>
    setSelectedPanelIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleDeleteSelectedPanels = async () => {
    if (selectedPanelIds.length === 0) {
      toast({ type: "info", title: "No Panels Selected", description: "Please select panel rows to delete." });
      return;
    }
    try {
      await Promise.all(selectedPanelIds.map((id) => deletePanelMutation.mutateAsync(id)));
      setSelectedPanelIds([]);
      toast({ type: "success", title: "Deleted", description: "Selected panels have been removed." });
    } catch (err: any) {
      toast({ type: "error", title: "Delete Failed", description: err?.message || "Failed to delete selected panels." });
    }
  };

  const handleNotifyAwardingBody = () => {
    if (selectedIds.length === 0) {
      toast({ type: "info", title: "No Candidates Selected", description: "Please select candidates to notify the Awarding Body." });
      return;
    }
    selectedIds.forEach((id) => forwardToAwardingBody.mutate(id));
  };

  const handleBulkCertify = async () => {
    if (selectedIds.length === 0) {
      toast({
        type: "info",
        title: "No Applications Selected",
        description: "Please select IV approved applications to mark as certified.",
      });
      return;
    }
    try {
      const res = await bulkCertifyMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
      toast({
        type: "success",
        title: "Certification Complete",
        description: `Successfully certified ${res.updated?.length || selectedIds.length} application(s).`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Certification Failed",
        description: err?.message || "Failed to certify selected applications.",
      });
    }
  };

  return {
    isLoading, isLoadingInterviews, isLoadingPanels,
    activeFilterTab, setActiveFilterTab,
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    isFilterModalOpen, setIsFilterModalOpen,
    selectedIds, selectedInterviewIds, selectedPanelIds,
    viewingInterview, setViewingInterview,
    viewingPanel, setViewingPanel,
    filteredInterviews, filteredPanels, filteredApplications,
    toggleSelectAll, toggleSelectRow,
    toggleSelectAllInterviews, toggleSelectInterviewRow,
    toggleSelectAllPanels, toggleSelectPanelRow,
    handleDeleteSelectedInterviews, handleDeleteSelectedPanels,
    handleNotifyAwardingBody,
    handleBulkCertify,
    isBulkCertifying: bulkCertifyMutation.isPending,
  };
}
