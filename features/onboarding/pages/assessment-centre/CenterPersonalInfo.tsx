"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { InfoIcon } from "@/components/ui/info-icon";

export const CenterPersonalInfo: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    dob: "",
    gender: "",
    nationality: "",
    email: "",
    phoneNumber: "",
    country: "",
    state: "",
    lga: "",
    streetAddress: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = "First Name is required";
      valid = false;
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
      valid = false;
    }
    if (!form.dob) {
      newErrors.dob = "Date Of Birth is required";
      valid = false;
    }
    if (!form.gender) {
      newErrors.gender = "Gender is required";
      valid = false;
    }
    if (!form.nationality) {
      newErrors.nationality = "Nationality is required";
      valid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = "Email Address is required";
      valid = false;
    }
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
      valid = false;
    }
    if (!form.country) {
      newErrors.country = "Country is required";
      valid = false;
    }
    if (!form.state) {
      newErrors.state = "State of Residence is required";
      valid = false;
    }
    if (!form.lga) {
      newErrors.lga = "LGA is required";
      valid = false;
    }
    if (!form.streetAddress.trim()) {
      newErrors.streetAddress = "Street Address is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        type: "error",
        title: "Input Required",
        description:
          "Please fill in all required fields for Personal Information.",
      });
      return;
    }
    router.push("/onboarding/assessment-centre/verify-identity");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className="flex flex-col">
          <div className="w-full max-w-109.75 flex justify-start mb-6">
            <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
              <div className="w-2/3 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
              Personal Information
            </h1>
            <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
              Collect only essential information.
            </p>
          </div>
        </div>

        {/* Personal Details Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={
              <span>
                First Name<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            type="text"
            placeholder="First name"
            value={form.firstName}
            error={errors.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />

          <Input
            label={
              <span>
                Last Name<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            type="text"
            placeholder="Surname"
            value={form.lastName}
            error={errors.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />

          <Input
            label="Middle Name"
            type="text"
            placeholder="Other names"
            value={form.middleName}
            onChange={(e) => update("middleName", e.target.value)}
          />

          <DatePicker
            label={
              <span>
                Date Of Birth
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="dd/mm/yyyy"
            maxYear={new Date().getFullYear() - 18}
            value={form.dob}
            error={errors.dob}
            onChange={(val) => update("dob", val)}
          />

          <Select
            label={
              <span>
                Gender<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={["Male", "Female", "Prefer not to say"]}
            value={form.gender}
            error={errors.gender}
            onChange={(e) => update("gender", e.target.value)}
          />

          <Select
            label={
              <span>
                Nationality<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={[
              "Nigerian",
              "Ghanaian",
              "Kenyan",
              "South African",
              "Other",
            ]}
            value={form.nationality}
            error={errors.nationality}
            onChange={(e) => update("nationality", e.target.value)}
          />
        </div>

        {/* Section 2: Contact Information */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-primary flex items-center gap-1.5">
            Contact Information <InfoIcon sectionName="Contact Information" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={
                <span>
                  Email Address
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="email"
              placeholder="Select"
              value={form.email}
              error={errors.email}
              onChange={(e) => update("email", e.target.value)}
            />

            <PhoneInput
              label={
                <span>
                  Phone Number
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              value={form.phoneNumber}
              onChange={(v) => update("phoneNumber", v)}
              error={errors.phoneNumber}
              country="ng"
              preferredCountries={["ng", "gh", "ke", "za"]}
            />
          </div>
        </div>

        {/* Section 3: Residential Address */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-primary flex items-center gap-1.5">
            Residential Address <InfoIcon sectionName="Residential Address" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={
                <span>
                  Country<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={["Nigeria", "Ghana", "Kenya", "South Africa", "Other"]}
              value={form.country}
              error={errors.country}
              onChange={(e) => update("country", e.target.value)}
            />

            <Select
              label={
                <span>
                  State of Residence
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={[
                "Lagos",
                "Oyo",
                "FCT Abuja",
                "Rivers",
                "Ogun",
                "Enugu",
                "Kano",
                "Delta",
              ]}
              value={form.state}
              error={errors.state}
              onChange={(e) => update("state", e.target.value)}
            />

            <Select
              label={
                <span>
                  Local Government Area (LGA)
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={[
                "Ibadan North",
                "Ikeja",
                "Abuja Municipal",
                "Eti-Osa",
                "Port Harcourt",
                "Obafemi Owode",
              ]}
              value={form.lga}
              error={errors.lga}
              onChange={(e) => update("lga", e.target.value)}
            />

            <Input
              label={
                <span>
                  Street Address
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="text"
              placeholder="Street Address"
              value={form.streetAddress}
              error={errors.streetAddress}
              onChange={(e) => update("streetAddress", e.target.value)}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() =>
              router.push("/onboarding/assessment-centre/center-info")
            }
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="amber"
            size="md"
            rightIcon={<FiArrowRight className="w-4.5 h-4.5" />}
            className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
          >
            Verify Identity
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
