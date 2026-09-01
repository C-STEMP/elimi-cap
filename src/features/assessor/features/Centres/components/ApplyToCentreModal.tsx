"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useRequestToJoinCentre } from "../hooks";
import { useGetCentres } from "@/src/features/shared/reference/hooks";

interface ApplyToCentreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES = ["QAA Assessor", "Internal Verifier"];

export const ApplyToCentreModal: React.FC<ApplyToCentreModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [role, setRole] = useState("");
  const [centre, setCentre] = useState("");
  const [errors, setErrors] = useState<{ role?: string; centre?: string }>({});

  const { data: remoteCentres = [], isLoading: isLoadingCentres } =
    useGetCentres();
  const requestMutation = useRequestToJoinCentre();

  const centreOptions: SelectOption[] = React.useMemo(() => {
    const list = Array.isArray(remoteCentres)
      ? remoteCentres
      : (remoteCentres as any)?.data || [];

    const seen = new Set<string>();
    const uniqueOptions: SelectOption[] = [];

    for (const c of list) {
      if (!c || !c.name) continue;
      const normalized = c.name.trim().toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueOptions.push({
          label: c.name.trim(),
          value: c.id,
        });
      }
    }
    return uniqueOptions;
  }, [remoteCentres]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { role?: string; centre?: string } = {};
    if (!role) newErrors.role = "Role is required";
    if (!centre) newErrors.centre = "Center is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const r = role.toLowerCase();
    let preferredRole: "facilitator" | "panelist" | "lead_panelist" | "observer" | "iv" | "unit_assessor" = "unit_assessor";
    if (r.includes("internal") || r.includes("verifier") || r.includes("iv")) {
      preferredRole = "iv";
    } else {
      preferredRole = "unit_assessor";
    }

    requestMutation.mutate(
      {
        centreId: centre,
        preferredRole,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-6 shadow-2xl relative select-text"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="text-center flex flex-col gap-1 pr-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
            Apply To Centre
          </h2>
          <p className="text-xs sm:text-sm text-neutral-secondary">
            Send a request to join a centre
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label={
              <span>
                Role<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (errors.role) setErrors((p) => ({ ...p, role: "" }));
            }}
            options={ROLES}
            error={errors.role}
          />

          <Select
            label={
              <span>
                Center<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder={
              isLoadingCentres ? "Loading centres..." : "Select Centre"
            }
            loading={isLoadingCentres}
            value={centre}
            onChange={(e) => {
              setCentre(e.target.value);
              if (errors.centre) setErrors((p) => ({ ...p, centre: "" }));
            }}
            options={centreOptions}
            error={errors.centre}
          />

          <Button
            type="submit"
            variant="amber"
            size="md"
            loading={requestMutation.isPending}
            className="w-full h-12 text-white font-bold text-sm rounded-xl shadow-lg mt-2 cursor-pointer"
          >
            Send Join Request
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
