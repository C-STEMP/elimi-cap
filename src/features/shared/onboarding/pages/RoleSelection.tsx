"use client";

import React from "react";
import { RoleCard } from "@/src/components/ui/role-card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setRole } from "@/store/slices/authSlice";
import { setOnboardingRole } from "@/store/slices/onboardingSlice";
import { useToast } from "@/src/components/ui/toast";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

import { useOnboarding } from "@/src/features/shared/onboarding/hooks";
import { type PersonaType } from "@/src/features/shared/onboarding/api";
import { getPersona, savePersona } from "@/src/lib/auth-storage";

export interface RoleOption {
  id: string;
  title: string;
  description: string;
}

const ROLES: RoleOption[] = [
  {
    id: "candidate",
    title: "Candidate/Learner",
    description: "Recognition of Prior Learning & Skills Assessment",
  },
  {
    id: "quality-assurance",
    title: "Quality Assurance",
    description: "Competency Assessment & Quality Assurance",
  },
  {
    id: "assessment-centre",
    title: "Assessment Centre",
    description: "Accredited Training & Assessment Centre",
  },
];

/** Maps internal role IDs → API persona strings */
const PERSONA_MAP: Record<string, PersonaType> = {
  candidate: "candidate",
  "assessment-centre": "centre",
  assessment_centre: "centre",
  "assessment-center": "centre",
  "awarding-body": "awarding_body",
  "quality-assurance": "assessor",
};

/** Maps API persona strings back → role IDs shown in the UI */
const PERSONA_TO_ROLE_ID: Record<string, string> = {
  candidate: "candidate",
  centre: "assessment-centre",
  assessor: "quality-assurance",
  awarding_body: "awarding-body",
};

/** Returns the route to push to after a role is confirmed */
function getDestinationForRole(roleId: string): string {
  if (roleId === "candidate") return "/onboarding/personal-info";
  if (
    roleId === "assessment-centre" ||
    roleId === "assessment_centre" ||
    roleId === "assessment-center"
  )
    return "/onboarding/assessment-centre/center-info";
  if (
    roleId === "quality-assurance" ||
    roleId === "assessor" ||
    roleId === "qaa"
  )
    return "/onboarding/assessor/personal-info";
  return "";
}

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
  const { startOnboarding } = useOnboarding();

  // ─── Resolve existing persona (Redux > localStorage) ─────────────────────
  const reduxRole = useAppSelector(
    (state) => state.onboarding.role || state.auth.user?.role || "",
  );

  // Read once on mount so it's stable for the render cycle
  const storedPersona =
    typeof window !== "undefined" ? getPersona() : null;

  // Convert stored persona → UI role ID (e.g. "centre" → "assessment-centre")
  const storedRoleId = storedPersona
    ? (PERSONA_TO_ROLE_ID[storedPersona] ?? storedPersona)
    : null;

  const currentRoleId = reduxRole || storedRoleId || null;

  const [selectedRole, setSelectedRole] = React.useState<string | null>(
    currentRoleId,
  );

  // Keep local state in sync if Redux hydrates after mount
  React.useEffect(() => {
    if (currentRoleId) setSelectedRole(currentRoleId);
  }, [currentRoleId]);

  // ─── Navigation helper ────────────────────────────────────────────────────
  const navigateToRole = (roleId: string) => {
    const dest = getDestinationForRole(roleId);
    if (dest) {
      setTimeout(() => router.push(dest), 150);
    } else {
      toast({
        type: "info",
        title: "Role Selected",
        description:
          "Flow for this role is currently in development. Please select Candidate/Learner or Assessment Centre.",
      });
    }
  };

  // ─── Handler ─────────────────────────────────────────────────────────────
  const handleSelectRole = (roleId: string) => {
    setSelectedRole(roleId);
    dispatch(setRole(roleId));
    dispatch(setOnboardingRole(roleId));

    const persona = PERSONA_MAP[roleId];
    if (!persona) {
      toast({
        type: "info",
        title: "Role Selected",
        description:
          "Flow for this role is currently in development. Please select Candidate/Learner or Assessment Centre.",
      });
      return;
    }

    // Persist persona locally immediately so the RouteGuard stays consistent
    savePersona(persona);

    // Call startOnboarding and navigate
    startOnboarding.mutate(persona, {
      onSuccess: () => {
        if (onSelectRole) onSelectRole(roleId);
        navigateToRole(roleId);
      },
      onError: (err: any) => {
        // If a conflict error (persona already exists on the backend) or any response, navigate to role flow
        const msg = err?.message?.toLowerCase() ?? "";
        const isConflict =
          msg.includes("already") ||
          msg.includes("conflict") ||
          msg.includes("exists") ||
          err?.statusCode === 409;

        if (isConflict) {
          if (onSelectRole) onSelectRole(roleId);
          navigateToRole(roleId);
        } else {
          if (onSelectRole) onSelectRole(roleId);
          navigateToRole(roleId);
        }
      },
    });
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

      {/* Spinner feedback while startOnboarding is in flight */}
      {startOnboarding.isPending && (
        <p className="mt-5 text-center text-xs font-semibold text-primary-solid animate-pulse">
          Setting up your account…
        </p>
      )}
    </motion.div>
  );
};
