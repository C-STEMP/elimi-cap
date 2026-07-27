"use client";

import React from "react";
import { RoleCard } from "@/components/ui/role-card";
import { useAppDispatch } from "@/store/hooks";
import { setRole } from "@/store/slices/authSlice";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

export interface RoleOption {
  id: string;
  title: string;
  description: string;
}

const ROLES: RoleOption[] = [
  {
    id: "candidate",
    title: "Candidate",
    description: "Lorem ipsum dolor",
  },
  {
    id: "assessor",
    title: "Assessor",
    description: "Competency assessment Portal",
  },
  {
    id: "assessment-centre",
    title: "Assessment Centre",
    description: "Lorem ipsum dolor",
  },
  {
    id: "awarding-body",
    title: "Awarding Body",
    description: "Lorem ipsum dolor",
  },
];

export interface RoleSelectionProps {
  onSelectRole?: (roleId: string) => void;
  onBack?: () => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  onSelectRole,
  onBack,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);

  const handleSelectRole = (roleId: string) => {
    setSelectedRole(roleId);
    dispatch(setRole(roleId));

    if (onSelectRole) {
      onSelectRole(roleId);

      if (roleId !== "candidate") {
        toast({
          type: "info",
          title: "Candidate Flow Active",
          description:
            "Please select 'Candidate' to continue assessment type selection.",
        });
      }
    } else {
      if (roleId === "candidate") {
        setTimeout(() => {
          router.push("/onboarding/assessment-type?from=role");
        }, 200);
      } else {
        toast({
          type: "info",
          title: "Candidate Flow Active",
          description:
            "Please select 'Candidate' to continue assessment type selection.",
        });
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/onboarding/welcome");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col justify-center select-text"
    >
      <div className="w-full flex justify-start mb-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-medium text-sm transition-colors cursor-pointer select-none focus:outline-none"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="w-full max-w-109.75 flex justify-start mb-6">
        <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
          <div className="w-1/3 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
        </div>
      </div>

      <div className="mb-6 text-left">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
          Select Your Role
        </h1>
        <p className="text-neutral-secondary text-xs xl:text-sm font-normal mt-1">
          Choose one.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 xl:gap-4">
        {ROLES.map((role, idx) => (
          <RoleCard
            key={role.id}
            id={role.id}
            index={idx}
            title={role.title}
            description={role.description}
            isSelected={selectedRole === role.id}
            onSelect={handleSelectRole}
          />
        ))}
      </div>
    </motion.div>
  );
};
