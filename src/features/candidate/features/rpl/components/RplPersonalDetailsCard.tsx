"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { DatePicker } from "@/src/components/ui/date-picker";
import { PassportUpload } from "@/src/components/ui/passport-upload";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPersonalInfo } from "@/store/slices/onboardingSlice";
import { GENDER_OPTIONS } from "@/features/candidate/utils";

interface RplPersonalDetailsCardProps {
  form: any;
  errors: Record<string, string>;
  update: (field: any, val: string) => void;
  countries: any[];
  passportDefaultImage: string;
  setPassportDefaultImage: (url: string) => void;
  passportError: string;
  setPassportError: (err: string) => void;
  setPassportFile: (file: File | null) => void;
}

export const RplPersonalDetailsCard: React.FC<RplPersonalDetailsCardProps> = ({
  form,
  errors,
  update,
  countries,
  passportDefaultImage,
  setPassportDefaultImage,
  passportError,
  setPassportError,
  setPassportFile,
}) => {
  const dispatch = useAppDispatch();
  const savedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl xl:text-[26px] font-extrabold tracking-tight text-primary">
            Step 1 of 4: Personal Information
          </h1>
          <p className="text-xs xl:text-sm text-neutral-secondary font-normal leading-relaxed">
            Provide your personal details to help us identify you and maintain your <br className="hidden sm:inline" /> official assessment records.
          </p>
        </div>

        <PassportUpload
          required
          defaultImage={passportDefaultImage}
          error={passportError}
          onImageChange={(file, asset) => {
            setPassportFile(file);
            const previewUrl = asset?.url || (file ? URL.createObjectURL(file) : "");
            if (file || previewUrl) {
              setPassportError("");
              setPassportDefaultImage(previewUrl || savedPersonalInfo.passportUrl || "");
              dispatch(
                setPersonalInfo({
                  passportAssetId: asset?.assetId || savedPersonalInfo.passportAssetId || "",
                  passportUrl: previewUrl || savedPersonalInfo.passportUrl || "",
                  passportFileName: file?.name ?? savedPersonalInfo.passportFileName ?? "",
                })
              );
            } else {
              setPassportDefaultImage("");
              dispatch(setPersonalInfo({ passportAssetId: "", passportUrl: "", passportFileName: "" }));
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
        <Input
          label={<span>First Name<span className="text-primary-solid ml-0.5">*</span></span>}
          type="text"
          placeholder="First name"
          value={form.firstName}
          error={errors.firstName}
          onChange={(e) => update("firstName", e.target.value)}
        />
        <Input
          label={<span>Last Name<span className="text-primary-solid ml-0.5">*</span></span>}
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
          label={<span>Date Of Birth<span className="text-primary-solid ml-0.5">*</span></span>}
          placeholder="dd/mm/yyyy"
          maxYear={new Date().getFullYear() - 18}
          value={form.dob}
          error={errors.dob}
          onChange={(val) => update("dob", val)}
        />
        <Select
          label={<span>Gender<span className="text-primary-solid ml-0.5">*</span></span>}
          placeholder="Select"
          options={GENDER_OPTIONS}
          value={form.gender}
          error={errors.gender}
          onChange={(e) => update("gender", e.target.value)}
        />
        <Select
          label={<span>Nationality<span className="text-primary-solid ml-0.5">*</span></span>}
          placeholder="Select"
          options={countries}
          value={form.nationality}
          error={errors.nationality}
          onChange={(e) => update("nationality", e.target.value)}
        />
      </div>
    </>
  );
};
