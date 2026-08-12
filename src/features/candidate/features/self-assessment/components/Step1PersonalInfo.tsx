"use client";

import React, { useState } from "react";
import { FiCalendar, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { DatePicker } from "@/src/components/ui/date-picker";
import { PassportUpload } from "@/src/components/ui/passport-upload";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { InfoIcon } from "@/src/components/ui/info-icon";
import { StatusModal } from "@/components/status-modal";
import { useToast } from "@/src/components/ui/toast";
import { saveIcon } from "@/assets";
import {
  selfAssessmentStep1Schema,
  extractZodErrors,
} from "@/src/lib/validation";

interface Step1Props {
  onNext: () => void;
  onBack: () => void;
}

export const Step1PersonalInfo: React.FC<Step1Props> = ({ onNext, onBack }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    dob: "",
    email: "",
    phone: "",
    state: "",
    lga: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (!passportFile) {
      newErrors.passport = "Passport photograph is required";
      valid = false;
    }

    const result = selfAssessmentStep1Schema.safeParse(formData);
    if (!result.success) {
      Object.assign(newErrors, extractZodErrors(result));
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast({
        type: "error",
        title: "Input Required",
        description:
          "Please upload your passport photograph and fill in all required fields.",
      });
      return;
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto pb-12"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 pt-1">
          <h1 className="text-2xl xl:text-[26px] font-extrabold tracking-tight text-primary">
            Step 1 of 4: Personal Information
          </h1>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
            Let&apos;s begin with your personal information. These details will
            be used throughout your RPL application and help us identify you
            during the assessment process.
          </p>

          <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-neutral-primary mt-4 flex items-center gap-1.5">
            Personal Details <InfoIcon sectionName="Personal Details" />
          </h2>
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

      <form onSubmit={handleContinue} className="w-full flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={
              <span>
                First Name<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            error={errors.firstName}
            onChange={handleChange}
          />

          <Input
            label={
              <span>
                Last Name<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            name="lastName"
            placeholder="Surname"
            value={formData.lastName}
            error={errors.lastName}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Middle Name"
            name="middleName"
            placeholder="Other names"
            value={formData.middleName}
            onChange={handleChange}
          />

          <DatePicker
            label={
              <span>
                Date Of Birth
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            name="dob"
            placeholder="dd/mm/yyyy"
            maxYear={new Date().getFullYear() - 18}
            value={formData.dob}
            error={errors.dob}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, dob: val }));
              if (errors.dob) setErrors((prev) => ({ ...prev, dob: "" }));
            }}
          />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-neutral-primary flex items-center gap-1.5">
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
              name="email"
              placeholder="Select"
              value={formData.email}
              error={errors.email}
              onChange={handleChange}
            />

            <PhoneInput
              label={
                <span>
                  Phone Number
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              name="phone"
              value={formData.phone}
              error={errors.phone}
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, phone: val }));
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-neutral-primary flex items-center gap-1.5">
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
              name="state"
              value={formData.state}
              error={errors.state}
              onChange={handleSelectChange}
              options={["Lagos", "Abuja", "Oyo"]}
              placeholder="Select"
            />

            <Select
              label={
                <span>
                  Local Government Area (LGA)
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              name="lga"
              value={formData.lga}
              error={errors.lga}
              onChange={handleSelectChange}
              options={["Ikeja", "Eti-Osa", "Surulere"]}
              placeholder="Select"
            />
          </div>

          <Input
            label={
              <span>
                Residential Address
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            name="address"
            placeholder="Street Address"
            value={formData.address}
            error={errors.address}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowConfirmDraftModal(true)}
              className="px-5 h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
            >
              <span>Save As Draft</span>
              <Image
                src={saveIcon}
                alt="Save icon"
                width={20}
                height={20}
                className="w-5 h-5 shrink-0"
                style={{ width: "auto", height: "auto" }}
              />
            </button>

            <Button
              type="submit"
              variant="amber"
              size="md"
              rightIcon={<FiArrowRight className="w-4.5 h-4.5" />}
              className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Continue
            </Button>
          </div>
        </div>
      </form>

      <StatusModal
        isOpen={showConfirmDraftModal}
        variant="save-draft-confirm"
        onClose={() => setShowConfirmDraftModal(false)}
        onAction={() => {
          setShowConfirmDraftModal(false);
          setShowDraftModal(true);
        }}
      />

      <StatusModal
        isOpen={showDraftModal}
        variant="draft-saved"
        onClose={() => setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />
    </motion.div>
  );
};
