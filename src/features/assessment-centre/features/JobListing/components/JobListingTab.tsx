"use client";

import React from "react";
import { motion } from "framer-motion";
import { AssessorApplicantProfileView } from "../../Assessor/components/AssessorApplicantProfileView";
import { JobListingDetailView } from "./JobListingDetailView";
import { JobListingsView } from "./JobListingsView";

interface JobListingTabProps {
  selectedJobId: string | null;
  selectedApplicantId: string | null;
  onSelectJob: (id: string | null) => void;
  onSelectApplicant: (id: string | null) => void;
  onOpenPostJobModal: () => void;
}

export const JobListingTab: React.FC<JobListingTabProps> = ({
  selectedJobId,
  selectedApplicantId,
  onSelectJob,
  onSelectApplicant,
  onOpenPostJobModal,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {selectedApplicantId ? (
        <AssessorApplicantProfileView
          applicantId={selectedApplicantId}
          onBack={() => onSelectApplicant(null)}
          isAssessorRequest={false}
        />
      ) : selectedJobId ? (
        <JobListingDetailView
          jobId={selectedJobId}
          onBack={() => onSelectJob(null)}
          onSelectApplicant={(id) => onSelectApplicant(id)}
        />
      ) : (
        <JobListingsView
          onSelectJob={(id) => onSelectJob(id)}
          onPostRequest={onOpenPostJobModal}
        />
      )}
    </motion.div>
  );
};
