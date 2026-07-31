"use client";

import React, { useState } from "react";
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PassportUpload } from "@/components/ui/passport-upload";
import { PhoneInput } from "@/components/ui/phone-input";

interface Step1Props {
  onNext: () => void;
  onBack: () => void;
}

export const Step1PersonalInfo: React.FC<Step1Props> = ({
  onNext,
  onBack,
}) => {
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
    <div className="flex flex-col flex-1 p-6 sm:p-8 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex flex-col max-w-lg">
          <h3 className="text-[#A31D38] font-bold text-xl sm:text-2xl mb-1.5">
            Step 1 of 4: Personal Information
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Let's begin with your personal information. These details will be used
            throughout your RPL application and help us identify you during the
            assessment process.
          </p>
        </div>

        <PassportUpload />
      </div>

      <div className="space-y-4 mb-6">
        <h4 className="font-bold text-black text-sm sm:text-base">
          Personal Details
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={
              <span>
                First Name<span className="text-red-500">*</span>
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
                Last Name<span className="text-red-500">*</span>
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
                Date Of Birth<span className="text-red-500">*</span>
              </span>
            }
            name="dob"
            placeholder="dd/mm/yyyy"
            value={formData.dob}
            onChange={handleChange}
            suffix={<FiCalendar className="w-4 h-4 text-gray-400" />}
          />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h4 className="font-bold text-black text-sm sm:text-base">
          Contact Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={
              <span>
                Email Address<span className="text-red-500">*</span>
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
                Phone Number<span className="text-red-500">*</span>
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

      <div className="space-y-4 mb-8">
        <h4 className="font-bold text-black text-sm sm:text-base">
          Residential Address
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={
              <span>
                State of Residence<span className="text-red-500">*</span>
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
                Local Government Area (LGA)<span className="text-red-500">*</span>
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
              Residential Address<span className="text-red-500">*</span>
            </span>
          }
          name="address"
          placeholder="Street Address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-800 font-semibold"
        >
          &larr; Back
        </Button>

        <Button
          type="button"
          onClick={onNext}
          variant="amber"
          size="lg"
          rounded="xl"
          rightIcon={<FiArrowRight className="w-4 h-4 stroke-[2.5]" />}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
