"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { markEvidenceUploaded } from "@/store/slices/applicationSlice";
import { EvidenceRecord } from "../utils/evidenceConstants";
import {
  UploadEvidenceModal,
  SelectedFileType,
} from "../components/UploadEvidenceModal";
import { DeleteEvidenceModal } from "../components/DeleteEvidenceModal";
import { PreviewEvidenceModal } from "../components/PreviewEvidenceModal";
import { ResourcesSection } from "../components/ResourcesSection";
import { EvidenceSection } from "../components/EvidenceSection";

interface EvidenceVaultPageProps {
  applicationId?: string;
}

export const EvidenceVaultPage: React.FC<EvidenceVaultPageProps> = ({
  applicationId,
}) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const reduxApp = useAppSelector((state) =>
    state.application.applications.find((a) => a.id === applicationId),
  );

  const fallbackApp = {
    id: applicationId || "app-1786013185522",
    title: "National Vocational Qualification in Carpentry",
    subtitle: "NSQ Level 3",
    status: "evidence_upload" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selfAssessmentCompleted: true,
    paymentCompleted: true,
    evidenceUploaded: false,
  };

  const application = reduxApp || fallbackApp;

  const [evidences, setEvidences] = useState<EvidenceRecord[]>([]);

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

  const handleSubmit = () => {
    dispatch(markEvidenceUploaded(application.id));
    toast({
      type: "success",
      title: "Evidence Submitted",
      description: "Your evidence has been submitted for review.",
    });
    // Navigate back to application details page
    router.push(`/dashboard/applications/${application.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col min-h-screen"
    >
      <HeaderBanner
        backHref={`/dashboard/applications/${application.id}`}
        backTitle="Evidence Vault"
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          {
            label: application.title,
            href: `/dashboard/applications/${application.id}`,
          },
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

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">

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
            onClick={handleSubmit}
            disabled={evidences.length === 0}
          >
            Submit
          </Button>
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <CalendarWidget />
          <UpcomingCard
            interview={{
              title: "Panel Interview",
              date: "22-07-2026",
              time: "12:00PM",
            }}
          />
        </div>
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
