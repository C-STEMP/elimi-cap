"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { ASSETS_URL } from "@/assets";

import { useAddStaff } from "@/features/assessment-centre/features/Staff/hooks";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded?: (staff: { name: string; email: string; role: string }) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onStaffAdded,
}) => {
  const { toast } = useToast();
  const addStaffMutation = useAddStaff();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        type: "error",
        title: "Name Required",
        description: "Please enter staff name.",
      });
      return;
    }
    if (!email.trim()) {
      toast({
        type: "error",
        title: "Email Required",
        description: "Please enter staff email address.",
      });
      return;
    }
    if (!role) {
      toast({
        type: "error",
        title: "Role Required",
        description: "Please select a staff role.",
      });
      return;
    }

    const mappedRole =
      role.toLowerCase().includes("super")
        ? "super_admin"
        : role.toLowerCase().includes("admin")
        ? "regular_admin"
        : "staff";

    addStaffMutation.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        role: mappedRole,
      },
      {
        onSuccess: () => {
          setStep("success");
          onStaffAdded?.({ name, email, role });
        },
      },
    );
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setRole("");
    setStep("form");
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300 select-none"
        onClick={handleReset}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative flex flex-col items-center"
        >
          {/* Close Button */}
          {step === "form" && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-6 right-6 w-11 h-11 rounded bg-red-50 text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
              aria-label="Close modal"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}

          {step === "form" ? (
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col items-center gap-5"
            >
              <div className="flex flex-col items-center text-center gap-1 lg:mt-8">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Add Staff
                </h3>
                <p className="text-xs lg:text-base text-neutral-secondary font-normal">
                  Create a new staff account
                </p>
              </div>

              <div className="w-full flex flex-col gap-4 mt-2">
                <Input
                  label="Staff Name"
                  type="text"
                  placeholder="Type Here"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Type Here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Select
                  label="Role"
                  placeholder="Select"
                  options={["Super Admin", "Regular Admin", "Regular Staff"]}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] mt-4 transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Add Staff
              </Button>
            </form>
          ) : (
            <div className="w-full flex flex-col items-center text-center">
              <div className="mt-2 mb-4 relative flex items-center justify-center">
                <Image
                  src={ASSETS_URL.successCheckmarkImg}
                  alt="Staff Added Successfully"
                  width={160}
                  height={160}
                  className="w-36 h-36 object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>

              <h3 className="text-black font-extrabold text-xl sm:text-2xl mb-2 tracking-tight">
                Staff Added Successfully
              </h3>

              <p className="text-neutral-secondary text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                You have successfully created a staff account
              </p>

              <Button
                type="button"
                onClick={handleReset}
                variant="amber"
                size="lg"
                className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] transition-all shadow-lg cursor-pointer rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
