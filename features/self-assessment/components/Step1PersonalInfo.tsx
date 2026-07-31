"use client";

import React, { useState } from "react";
import { FiCalendar, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PassportUpload } from "@/components/ui/passport-upload";
import { PhoneInput } from "@/components/ui/phone-input";
import { InfoIcon } from "@/components/ui/info-icon";
import { StatusModal } from "@/components/ui/status-modal";
import { ASSETS_URL } from "@/assets";

interface Step1Props {
  onNext: () => void;
  onBack: () => void;
}

export const Step1PersonalInfo: React.FC<Step1Props> = ({
  onNext,
  onBack,
}) => {
  const router = useRouter();
  const [showDraftModal, setShowDraftModal] = useState(false);

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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (e: { target: { name: string; value: string } }) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
            Let&apos;s begin with your personal information. These details will be used
            throughout your RPL application and help us identify you during the
            assessment process.
          </p>

          <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-neutral-primary mt-4 flex items-center gap-1.5">
            Personal Details <InfoIcon sectionName="Personal Details" />
          </h2>
        </div>

        <PassportUpload />
      </div>

      <div className="w-full flex flex-col gap-5">
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

          <Input
            label={
              <span>
                Date Of Birth<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            name="dob"
            placeholder="dd/mm/yyyy"
            value={formData.dob}
            onChange={handleChange}
            suffix={<FiCalendar className="w-4 h-4 text-gray-400" />}
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
                  Email Address<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="email"
              name="email"
              placeholder="Select"
              value={formData.email}
              onChange={handleChange}
            />

            <PhoneInput
              label={
                <span>
                  Phone Number<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              name="phone"
              value={formData.phone}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, phone: val }))
              }
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
                  State of Residence<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              name="state"
              value={formData.state}
              onChange={handleSelectChange}
              options={["Lagos", "Abuja", "Oyo"]}
              placeholder="Select"
            />

            <Select
              label={
                <span>
                  Local Government Area (LGA)<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              name="lga"
              value={formData.lga}
              onChange={handleSelectChange}
              options={["Ikeja", "Eti-Osa", "Surulere"]}
              placeholder="Select"
            />
          </div>

          <Input
            label={
              <span>
                Residential Address<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            name="address"
            placeholder="Street Address"
            value={formData.address}
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
              onClick={() => setShowDraftModal(true)}
              className="px-5 h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span>Save As Draft</span>
              <Image
                src={ASSETS_URL.saveIcon}
                alt="Save icon"
                width={20}
                height={20}
                className="w-5 h-5 shrink-0"
              />
            </button>

            <Button
              type="button"
              onClick={onNext}
              variant="amber"
              size="md"
              rightIcon={<FiArrowRight className="w-4.5 h-4.5" />}
              className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>

      <StatusModal
        isOpen={showDraftModal}
        variant="draft-saved"
        onClose={() => setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />
    </motion.div>
  );
};

