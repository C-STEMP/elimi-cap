"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFolder,
  FiUpload,
  FiDownload,
  FiX,
  FiFileText,
  FiCheck,
  FiEye,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import { CalendarWidget } from "@/features/dashboard/components/CalendarWidget";
import { UpcomingCard } from "@/features/dashboard/components/UpcomingCard";
import { FacilitatorCard, FacilitatorData } from "@/features/dashboard/components/FacilitatorCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ASSETS_URL } from "@/assets";

interface EvidenceRecord {
  id: string;
  name: string;
  size: string;
  status: "Approved" | "Attention Required" | "Pending";
  statusBg: string;
  statusText: string;
  issues?: string[];
}

const MOCK_FACILITATOR: FacilitatorData = {
  name: "Ngozi Eze",
  avatar: ASSETS_URL.userAvatar,
  role: "Facilitator · Carpentry (Level 3)",
  tags: ["Carpentry", "RPL Coordinator"],
};

const INITIAL_EVIDENCES: EvidenceRecord[] = [
  {
    id: "ev-1",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-2",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-3",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-4",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
  {
    id: "ev-5",
    name: "CV/Resume",
    size: "60 kb / 5 mb",
    status: "Approved",
    statusBg: "bg-[#D1FAE5]",
    statusText: "text-[#047857]",
  },
];

export const EvidenceVaultPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  // Evidence list state
  const [evidences, setEvidences] = useState<EvidenceRecord[]>(INITIAL_EVIDENCES);
  const [hasAttentionItem, setHasAttentionItem] = useState(false);

  // Modal open states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EvidenceRecord | null>(null);
  const [previewItem, setPreviewItem] = useState<EvidenceRecord | null>(null);

  // Upload modal form states
  const [docName, setDocName] = useState("");
  const [evidenceType, setEvidenceType] = useState("");
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    completed: boolean;
  } | null>(null);

  // Simulate file selection in upload modal (Matching Image 4)
  const handleSelectFileClick = () => {
    setSelectedFile({
      name: docName || "File Name",
      size: "5 mb",
      completed: true,
    });
  };

  const handleUploadSubmit = () => {
    const newDocName = docName || (selectedFile ? selectedFile.name : "CV/Resume");
    const newItem: EvidenceRecord = {
      id: `ev-${Date.now()}`,
      name: newDocName,
      size: "60 kb / 5 mb",
      status: "Approved",
      statusBg: "bg-[#D1FAE5]",
      statusText: "text-[#047857]",
    };

    setEvidences((prev) => [newItem, ...prev]);
    setIsUploadModalOpen(false);
    setDocName("");
    setEvidenceType("");
    setSelectedFile(null);

    // Toast matching Image 1 & 3
    toast({
      type: "success",
      title: "Upload Successful",
      description: "You have successfully uploaded an evidence",
    });
  };

  const handleOpenDeleteModal = (item: EvidenceRecord) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setEvidences((prev) => prev.filter((ev) => ev.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);

      // Toast matching Image 2
      toast({
        type: "success",
        title: "Evidence Deleted",
        description: "Your evidence was deleted successfully",
      });
    }
  };

  const toggleAttentionState = () => {
    if (!hasAttentionItem) {
      setEvidences((prev) => [
        {
          id: "ev-attention",
          name: "CV/Resume",
          size: "60 kb / 5 mb",
          status: "Attention Required",
          statusBg: "bg-[#FCE7F3]",
          statusText: "text-[#BE185D]",
          issues: [
            "The file is corrupted",
            "The CV does not show you have worked in the construction sector before",
          ],
        },
        ...prev.filter((i) => i.id !== "ev-attention"),
      ]);
      setHasAttentionItem(true);
    } else {
      setEvidences((prev) => prev.filter((i) => i.id !== "ev-attention"));
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
      {/* Header Banner with Back navigation and Breadcrumb trail */}
      <HeaderBanner
        backHref="/dashboard/applications/carpentry-1"
        backTitle="Evidence Vault"
        breadcrumbs={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: "Carpentry", href: "/dashboard/applications/carpentry-1" },
          { label: "Evidence Vault" },
        ]}
        showCreateButton={true}
        createButtonText="Create Application"
      />

      {/* Demo State Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 mb-2">
        <div className="flex items-center gap-2 bg-gray-200/60 p-1.5 rounded-xl text-xs flex-wrap">
          <span className="text-gray-500 font-semibold px-2">Preview Mode:</span>
          <button
            type="button"
            onClick={toggleAttentionState}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              hasAttentionItem
                ? "bg-[#FCE7F3] text-[#BE185D] shadow-2xs font-bold"
                : "bg-white text-gray-800 hover:text-gray-900"
            }`}
          >
            {hasAttentionItem ? "Hide Attention Required Item" : "Show Attention Required Item (Image 3)"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FiUpload className="w-4 h-4" />
            Upload Evidence
          </button>
        </div>
      </div>

      {/* Main Layout Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Content Area (8/9 Columns) */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          {/* Resources Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-900 font-bold text-xl lg:text-2xl tracking-tight">
              Resources
            </h2>

            {/* Resource Card 1: Self-Assessment Form Template */}
            <div className="bg-[#F5F6FA] rounded-[20px] p-5 flex items-center justify-between border border-gray-100/70 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center font-bold text-xs shrink-0 border border-[#fce3e7]">
                  <FiFileText className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#191918] font-bold text-base lg:text-xl">
                    Self-Assessment Form Template
                  </span>
                  <span className="text-gray-400 text-xs sm:text-sm font-normal">
                    5 mb
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  toast({
                    type: "info",
                    title: "Downloading Template",
                    description: "Self-Assessment Form Template download started.",
                  })
                }
                className="w-9 h-9 bg-gray-200/70 hover:bg-gray-300 rounded-xl flex items-center justify-center text-gray-700 cursor-pointer transition-colors"
                aria-label="Download template"
              >
                <FiDownload className="w-4.5 h-4.5 stroke-[2]" />
              </button>
            </div>

            {/* Resource Card 2: Third Party Reports */}
            <div className="bg-[#F5F6FA] rounded-[20px] p-5 flex items-center justify-between border border-gray-100/70 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center font-bold text-xs shrink-0 border border-[#fce3e7]">
                  <FiFileText className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#191918] font-bold text-base lg:text-xl">
                    Third Party Reports
                  </span>
                  <span className="text-gray-400 text-xs sm:text-sm font-normal">
                    5 mb
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  toast({
                    type: "info",
                    title: "Downloading Resource",
                    description: "Third Party Reports template download started.",
                  })
                }
                className="w-9 h-9 bg-gray-200/70 hover:bg-gray-300 rounded-xl flex items-center justify-center text-gray-700 cursor-pointer transition-colors"
                aria-label="Download third party reports"
              >
                <FiDownload className="w-4.5 h-4.5 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Evidence List Section (Matching Image 1, 2, 3) */}
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-900 font-bold text-xl lg:text-2xl tracking-tight">
              Evidence
            </h2>

            {evidences.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-[22px] p-12 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100/80 min-h-[300px]">
                <div className="w-20 h-20 rounded-full bg-[#fdf2f4] border border-[#fce3e7] flex items-center justify-center mb-4 shadow-xs">
                  <FiFolder className="w-9 h-9 text-[#e07b8d] stroke-[1.5]" />
                </div>
                <h3 className="text-gray-900 font-bold text-xl mb-2">
                  No Evidence yet
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-6 text-center">
                  Click &quot;Upload Evidence&quot; in the top header to upload all your evidence.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <FiUpload className="w-4 h-4" />
                  Upload Evidence
                </button>
              </div>
            ) : (
              /* Evidence Items Stack */
              <div className="flex flex-col gap-3.5">
                {evidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-[#F5F6FA] rounded-[20px] p-5 border border-gray-100/70 shadow-2xs flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center font-bold text-xs shrink-0 border border-[#fce3e7]">
                          <FiFileText className="w-6 h-6 stroke-[1.8]" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[#191918] font-bold text-base lg:text-xl">
                              {ev.name}
                            </span>
                            <span
                              className={`${ev.statusBg} ${ev.statusText} text-xs font-semibold px-3 py-1 rounded-full shadow-2xs`}
                            >
                              {ev.status}
                            </span>
                          </div>
                          <span className="text-gray-400 text-xs sm:text-sm font-normal">
                            {ev.size}
                          </span>
                        </div>
                      </div>

                      {/* Right Icons: View (eye) & Delete (trash) */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(ev)}
                          className="w-9 h-9 bg-gray-200/60 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 cursor-pointer transition-colors"
                          aria-label="View evidence"
                        >
                          <FiEye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(ev)}
                          className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer transition-colors"
                          aria-label="Delete evidence"
                        >
                          <FiTrash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>

                    {/* Alert Banner for Attention Required item (Image 3) */}
                    {ev.issues && ev.issues.length > 0 && (
                      <div className="bg-[#fce8eb] border border-[#f87171]/20 rounded-xl p-4 text-[#991b1b] text-xs sm:text-sm font-normal leading-relaxed">
                        <ul className="list-disc pl-4 space-y-1">
                          {ev.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                {/* Bottom Right Submit Button */}
                <div className="flex items-center justify-end mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        type: "success",
                        title: "Evidence Submitted",
                        description: "Your evidence files have been submitted for review.",
                      })
                    }
                    className="bg-[#fcd34d] hover:bg-[#fbab2a] text-white font-bold text-sm px-8 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column (3/4 Columns) */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <CalendarWidget />
          <UpcomingCard interview={null} />
          <FacilitatorCard facilitator={MOCK_FACILITATOR} />
        </div>
      </div>

      {/* Upload Evidence Modal (Matching Image 4) */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100"
            >
              {/* Soft Pink Close Square Button */}
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                }}
                className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer absolute top-6 right-6 transition-colors"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Title & Subtitle */}
              <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight text-center mb-1">
                Upload Evidence
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed mb-6 max-w-sm mx-auto">
                Name your file properly, so you can be sure you uploaded the right evidence
              </p>

              {/* Form Controls */}
              <div className="space-y-4 text-left">
                <Input
                  label="Document Name (optional)"
                  placeholder="Type The Document Name Here"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />

                <Select
                  label="Evidence Type"
                  placeholder="Select"
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  options={[
                    "Work Sample",
                    "Certificate / License",
                    "Reference Letter",
                    "Site Photo Evidence",
                    "Video Demonstration",
                  ]}
                />

                {/* Upload Dropzone */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
                    Upload Evidence
                  </label>
                  <div
                    onClick={handleSelectFileClick}
                    className="border-2 border-dashed border-[#F4B4C0] bg-[#FFF5F7] hover:bg-[#FFEBF0] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#BE185D] mb-2">
                      <FiUpload className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="font-semibold text-xs text-[#BE185D] mb-1">
                      Upload Evidence
                    </span>
                    <span className="text-[11px] text-gray-400">
                      JPG, PNG, PDF, Docs, Mp4, or WebP
                    </span>
                  </div>
                </div>

                {/* Completed File Card (Matching Image 4) */}
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#F5F6FA] rounded-2xl p-4 flex items-center justify-between border border-gray-200/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#fce3e7]">
                        <FiFileText className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold text-xs">
                          {selectedFile.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <span>{selectedFile.size}</span>
                          <span>•</span>
                          <span className="text-[#047857] font-semibold flex items-center gap-1">
                            <FiCheck className="w-3.5 h-3.5 stroke-[3] text-[#047857]" />
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Submit Upload Button */}
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleUploadSubmit}
                  className="w-full bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold text-sm sm:text-base h-12.5 rounded-xl mt-6 cursor-pointer"
                >
                  Upload
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Evidence Confirmation Modal (Matching Image 5) */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white rounded-[28px] p-8 sm:p-10 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative"
            >
              {/* Soft Pink Close Square Button */}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-9 h-9 bg-[#fdf2f4] hover:bg-[#fce3e7] rounded-xl flex items-center justify-center text-[#a31d38] cursor-pointer absolute top-6 right-6 transition-colors"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Large Red Trash Can Icon Illustration (Image 5) */}
              <div className="w-24 h-24 rounded-full bg-[#fee2e2] flex items-center justify-center mb-6 text-[#dc2626]">
                <FiTrash2 className="w-14 h-14" />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
                Delete Evidence
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm font-normal leading-relaxed mb-6 max-w-[260px]">
                Are you sure you want to delete this evidence? This action cannot be reversed.
              </p>

              {/* Dark Red Delete Evidence Button */}
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-sm sm:text-base py-3.5 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Delete Evidence
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Evidence File Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center">
                  <FiFileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{previewItem.name}</h4>
                  <span className="text-xs text-gray-400">{previewItem.size}</span>
                </div>
              </div>

              <div className="bg-[#F5F6FA] p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-gray-100 mb-6">
                <FiFileText className="w-12 h-12 text-[#a31d38] mb-2" />
                <span className="text-xs text-gray-500">Document Preview</span>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewItem(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
