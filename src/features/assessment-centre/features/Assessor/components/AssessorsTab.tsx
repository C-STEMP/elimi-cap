"use client";

import React from "react";
import { motion } from "framer-motion";
import { AssessorsListView } from "./AssessorsListView";
import { AssessorProfileDetailView } from "./AssessorProfileDetailView";
import { RoleType } from "../../../utils/rbac";

interface AssessorsTabProps {
  activeRole: RoleType;
  selectedAssessorId: string | null;
  onSelectAssessor: (id: string | null) => void;
  onViewCandidate: (candidateId: string) => void;
}

export const AssessorsTab: React.FC<AssessorsTabProps> = ({
  activeRole,
  selectedAssessorId,
  onSelectAssessor,
  onViewCandidate,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {selectedAssessorId ? (
        <AssessorProfileDetailView
          assessorId={selectedAssessorId}
          onBack={() => onSelectAssessor(null)}
          onViewCandidate={onViewCandidate}
        />
      ) : (
        <AssessorsListView
          userRole={activeRole}
          onSelectAssessor={(id) => onSelectAssessor(id)}
        />
      )}
    </motion.div>
  );
};
