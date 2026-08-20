"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiList,
  FiGrid,
  FiCheckCircle,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { Select } from "@/src/components/ui/select";
import { ApplyToCentreModal } from "./ApplyToCentreModal";

export interface AssessorCentreItem {
  id: string;
  centreId?: string;
  name: string;
  role: string;
  candidateAssigned: number | string;
  status: "Active" | "Inactive" | "Pending";
  joinedAt: string;
}

interface AssessorCentresViewProps {
  centres: AssessorCentreItem[];
  onSelectCentre: (centre: AssessorCentreItem) => void;
  onApplyToCentre: () => void;
}

export const AssessorCentresView: React.FC<AssessorCentresViewProps> = ({
  centres,
  onSelectCentre,
  onApplyToCentre,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const filteredCentres = centres.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleApplySuccess = () => {
    setIsApplyModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 select-text min-h-125">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-primary focus:outline-none focus:ring-2 focus:ring-primary-solid/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="w-36">
            <Select
              placeholder="Status"
              value={statusFilter === "All" ? "" : statusFilter}
              onChange={(e) => setStatusFilter(e.target.value || "All")}
              options={["Active", "Inactive", "Pending"]}
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-red-50 text-red-700 font-bold shadow-2xs"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-red-50 text-red-700 font-bold shadow-2xs"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto max-w-full rounded-2xl border border-gray-100">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-gray-50/70 text-gray-500 font-semibold border-b border-gray-100">
              <th className="p-3.5 rounded-l-xl">Centre Name</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Candidate Assigned</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Joined at</th>
              <th className="p-3.5 rounded-r-xl text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCentres.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-gray-50/60 transition-colors"
              >
                <td className="p-3.5 font-medium text-neutral-primary">
                  {c.name}
                </td>
                <td className="p-3.5 text-gray-600">{c.role}</td>
                <td className="p-3.5 text-gray-600">{c.candidateAssigned}</td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      c.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : c.status === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3.5 text-gray-500">{c.joinedAt}</td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectCentre(c)}
                    className="font-bold text-xs text-neutral-primary hover:text-primary-solid underline cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ApplyToCentreModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={handleApplySuccess}
      />

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center gap-4 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg my-1">
              <FiCheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
              Request to Join Sent Successfully
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary">
              You have successfully sent a request to join a centre
            </p>

            <Button
              variant="amber"
              size="md"
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full h-11 text-white font-bold text-sm rounded-xl shadow-lg mt-2 cursor-pointer"
            >
              Continue
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
