"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/dashboard/components/UpcomingCard";
import { FacilitatorCard } from "@/features/dashboard/components/FacilitatorCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  EvidenceRecord,
  INITIAL_EVIDENCES,
  MOCK_FACILITATOR,
} from "./utils/evidenceConstants";
import {
  UploadEvidenceModal,
  SelectedFileType,
} from "./components/UploadEvidenceModal";
import { DeleteEvidenceModal } from "./components/DeleteEvidenceModal";
import { PreviewEvidenceModal } from "./components/PreviewEvidenceModal";
import { ResourcesSection } from "./components/ResourcesSection";
import { EvidenceSection } from "./components/EvidenceSection";

export const EvidenceVaultPage: React.FC = () => {
  const { toast } = useToast();

  const [evidences, setEvidences] =
    useState<EvidenceRecord[]>(INITIAL_EVIDENCES);
  const [hasAttentionItem, setHasAttentionItem] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EvidenceRecord | null>(null);
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);

  const handleUploadSubmit = (
    docName: string,
    selectedFile: SelectedFileType | null,
  ) => {
    const newDocName =
      docName || (selectedFile ? selectedFile.name : "CV/Resume");
    const newItem: EvidenceRecord = {
      id: `ev-${Date.now()}`,
      name: newDocName,
      size: selectedFile ? `${selectedFile.size} / 5 mb` : "60 kb / 5 mb",
      status: "Approved",
      statusBg: "bg-[#D1FAE5]",
      statusText: "text-[#047857]",
    };

    setEvidences((prev) => [newItem, ...prev]);
    setIsUploadModalOpen(false);

    toast({
      type: "success",
      title: "Upload Successful",
      description: "You have successfully uploaded an evidence",
    });
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setEvidences((prev) => prev.filter((ev) => ev.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);

      toast({
        type: "success",
        title: "Evidence Deleted",
        description: "Your evidence was deleted successfully",
      });
    }
  };

  const handleToggleAttentionState = () => {
    if (!hasAttentionItem) {
      const updated = [...INITIAL_EVIDENCES];
      updated[0] = {
        ...updated[0],
        status: "Attention Required",
        statusBg: "bg-[#FCE7F3]",
        statusText: "text-[#BE185D]",
        issues: [
          "Lorem Ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor",
          "Lorem Ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor",
        ],
      };
      setEvidences(updated);
      setHasAttentionItem(true);
    } else {
      setEvidences(INITIAL_EVIDENCES);
      setHasAttentionItem(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col gap-2"
    >
      <HeaderBanner
        backHref="/dashboard/applications/carpentry-1"
        backTitle="Evidence Vault"
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: "Carpentry", href: "/dashboard/applications/carpentry-1" },
          { label: "Evidence Vault" },
        ]}
        showCreateButton={false}
        rightAction={
          <Button
            type="button"
            variant="amber"
            size="md"
            rightIcon={<FiPlus className="w-4 h-4 stroke-3" />}
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs"
          >
            Upload Evidence
          </Button>
        }
      />

      <div className="flex items-center gap-2 px-2 mb-2">
        <div className="flex items-center gap-2 bg-gray-200/60 p-1.5 rounded-xl text-xs flex-wrap">
          <span className="text-gray-500 font-semibold px-2">
            Preview Mode:
          </span>
          <button
            type="button"
            onClick={handleToggleAttentionState}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              hasAttentionItem
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {hasAttentionItem
              ? "Reset to All Approved"
              : "Show Attention Required Item (Image 3)"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          <ResourcesSection />
          <EvidenceSection
            evidences={evidences}
            onPreview={(item) => setPreviewItem(item)}
            onDelete={(item) => {
              setItemToDelete(item);
              setIsDeleteModalOpen(true);
            }}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
          <Button
            variant="secondary"
            size="lg"
            className="w-55! cursor-pointer place-self-end"
          >
            Submit
          </Button>
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <CalendarWidget />
          <UpcomingCard interview={null} />
          <FacilitatorCard facilitator={MOCK_FACILITATOR} />
        </div>
      </div>

      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSubmit={handleUploadSubmit}
      />

      <DeleteEvidenceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />

      <PreviewEvidenceModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </motion.div>
  );
};
