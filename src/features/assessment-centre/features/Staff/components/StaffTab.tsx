"use client";

import React from "react";
import { motion } from "framer-motion";
import { StaffListView } from "./StaffListView";
import { StaffDetailView } from "./StaffDetailView";
import { RoleType } from "../../../utils/rbac";

interface StaffTabProps {
  activeRole: RoleType;
  selectedStaffId: string | null;
  onSelectStaff: (id: string | null) => void;
  onOpenAddStaffModal: () => void;
}

export const StaffTab: React.FC<StaffTabProps> = ({
  activeRole,
  selectedStaffId,
  onSelectStaff,
  onOpenAddStaffModal,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {selectedStaffId ? (
        <StaffDetailView
          staffId={selectedStaffId}
          onBack={() => onSelectStaff(null)}
        />
      ) : (
        <StaffListView
          userRole={activeRole}
          onSelectStaff={(id) => onSelectStaff(id)}
          onAddStaff={onOpenAddStaffModal}
        />
      )}
    </motion.div>
  );
};
