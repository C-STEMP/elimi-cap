"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { PhoneInput } from "@/components/ui/phone-input";
import { PassportUpload } from "@/components/ui/passport-upload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { InfoIcon } from "@/components/ui/info-icon";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { StatusModal } from "@/components/ui/status-modal";
import { useAppDispatch } from "@/store/hooks";
import { setSidebarVariant } from "@/store/slices/authSlice";
import {
  personalInfoSchema,
  extractZodErrors,
} from "@/lib/validation";

export interface PersonalInfoProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

const initialForm = {
  firstName: "",
  lastName: "",
  middleName: "",
  dob: "",
  gender: "",
  nationality: "",
  email: "",
  countryCode: "NGN",
  phoneNumber: "",
  state: "",
  lga: "",
  streetAddress: "",
  impairment: "",
};

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
  onBack,
  onSuccess,
}) => {
  const [form, setForm] = useState(initialForm);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    dispatch(setSidebarVariant("default"));
  }, [dispatch]);

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (!passportFile) {
      newErrors.passport = "Passport photograph is required";
      valid = false;
    }

    const result = personalInfoSchema.safeParse(form);
    if (!result.success) {
      Object.assign(newErrors, extractZodErrors(result));
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        type: "error",
        title: "Input Required",
        description: "Please upload your passport photograph and fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/onboarding/success");
      }
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className="w-full flex justify-start mb-1">
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="flex items-center gap-2 text-sm font-medium text-neutral-secondary hover:text-text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Joined Continuous Status Bar - Step 3 of 3 (Complete Profile) */}

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col place-self-end">
            <div className="w-full max-w-109.75 flex justify-start mb-6">
              <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
                <div className="w-5/6 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
                Personal Information
              </h1>
              <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
                Provide your details to complete your profile
              </p>
            </div>
          </div>

          <PassportUpload
            required
            error={errors.passport}
            onImageChange={(file) => {
              setPassportFile(file);
              if (errors.passport) {
                setErrors((prev) => ({ ...prev, passport: "" }));
              }
            }}
          />
        </div>

        {/* Personal Information Fields */}
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
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
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
              placeholder="yourname@email.com"
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
              countryCode={form.countryCode}
              onCountryCodeChange={(v) => update("countryCode", v)}
              phoneNumber={form.phoneNumber}
              error={errors.phoneNumber}
              onPhoneNumberChange={(v) => update("phoneNumber", v)}
            />
          </div>
        </div>

        {/* Section 3: Residential Address */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
            Residential Address <InfoIcon sectionName="Residential Address" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="sm:col-span-2">
              <Input
                label={
                  <span>
                    Residential Address
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
        </div>

        {/* Section 4: Accessibility */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
            Accessibility <InfoIcon sectionName="Accessibility" />
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <Select
              label={
                <span>
                  Do you have any impairment?
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={[
                "No",
                "Visual impairment",
                "Hearing impairment",
                "Mobility impairment",
                "Other",
              ]}
              value={form.impairment}
              error={errors.impairment}
              onChange={(e) => update("impairment", e.target.value)}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-100">
          <Button
            type="submit"
            variant="secondary"
            size="small"
            disabled={isSubmitting}
            className="px-8 h-11 bg-secondary hover:bg-secondary-hover text-white font-semibold text-sm rounded-lg flex items-center gap-2 shadow-sm cursor-pointer"
          >
            {isSubmitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                Continue
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Personal Information Saved"
        description="Your profile details have been saved successfully!"
        actionLabel="Continue"
        onAction={() => setShowSuccessModal(false)}
      />
    </motion.div>
  );
};
