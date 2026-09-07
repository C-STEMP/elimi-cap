"use client";

import React from "react";
import { motion } from "framer-motion";
import { AssessorApplicantProfileView } from "../../Assessor/components/AssessorApplicantProfileView";
import { AssessorRequestListView } from "./AssessorRequestListView";

interface AssessorRequestTabProps {
  selectedAssessorRequestId: string | null;
  onSelectAssessorRequest: (id: string | null) => void;
}

export const AssessorRequestTab: React.FC<AssessorRequestTabProps> = ({
  selectedAssessorRequestId,
  onSelectAssessorRequest,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {selectedAssessorRequestId ? (
        <AssessorApplicantProfileView
          applicantId={selectedAssessorRequestId}
          onBack={() => onSelectAssessorRequest(null)}
        />
      ) : (
        <AssessorRequestListView
          onSelectAssessorRequest={(id) => onSelectAssessorRequest(id)}
        />
      )}
    </motion.div>
  );
};
