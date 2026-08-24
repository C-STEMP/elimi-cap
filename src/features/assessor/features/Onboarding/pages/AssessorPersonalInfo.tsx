"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { DatePicker } from "@/src/components/ui/date-picker";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { Button } from "@/src/components/ui/button";
import { PassportUpload } from "@/src/components/ui/passport-upload";
import type { StorageAsset } from "@/src/features/shared/storage/api";
import { useToast } from "@/src/components/ui/toast";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setSidebarVariant, updateUser } from "@/src/store/slices/authSlice";
import { setAssessorPersonalInfo } from "@/src/store/slices/onboardingSlice";
import { ASSESSOR_ROUTES } from "@/src/features/assessor/utils/assessorRoutes";
import { useAssessorOnboarding } from "../hooks/useOnboarding";
import { personalInfoSchema, extractZodErrors, formatToIsoDate } from "@/src/lib/validation";

export const AssessorPersonalInfo: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { getOnboarding, saveOnboarding } = useAssessorOnboarding();
  const saved = useAppSelector((s) => s.onboarding.assessorPersonalInfo);

  const authUser = useAppSelector((s) => s.auth.user);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportAssetId, setPassportAssetId] = useState<string>(
    saved.passportAssetId || "",
  );
  const [passportError, setPassportError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: saved.firstName || "",
    lastName: saved.lastName || "",
    middleName: saved.middleName || "",
    dob: saved.dob || "",
    gender: saved.gender || "",
    nationality: saved.nationality || "Nigerian",
    email: saved.email || authUser?.email || "",
    phoneNumber: saved.phoneNumber || "",
    country: saved.country || "Nigeria",
    state: saved.state || "",
    lga: saved.lga || "",
    streetAddress: saved.streetAddress || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { countries, states, cities } = useCountryStateCity(form.country, form.state);

  useEffect(() => {
    dispatch(setSidebarVariant("default"));
  }, [dispatch]);

  // Hydrate from API
  useEffect(() => {
    if (getOnboarding.data?.data) {
      const d = getOnboarding.data.data as any;
      const p = d?.personalDetails || {};
      const c = d?.contactInformation || {};
      const r = d?.residentialAddress || {};

      const next = {
        firstName: p.firstName || form.firstName,
        lastName: p.lastName || form.lastName,
        middleName: p.middleName || form.middleName,
        dob: p.dob || form.dob,
        gender: p.gender || form.gender,
        nationality: p.nationality || form.nationality || "Nigerian",
        email: c.emailAddress || form.email || authUser?.email || "",
        phoneNumber: c.phoneNumber?.number || form.phoneNumber,
        country: r.country || form.country || "Nigeria",
        state: r.state || form.state,
        lga: r.lga || form.lga,
        streetAddress: r.address || form.streetAddress,
      };
      setForm(next);
      dispatch(setAssessorPersonalInfo(next));
    } else if (authUser?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: authUser.email || "" }));
      dispatch(setAssessorPersonalInfo({ email: authUser.email }));
    }
  }, [getOnboarding.data, authUser?.email, dispatch]);

  const update = (field: keyof typeof form, value: string) => {
    const updatedValues: Partial<typeof form> = { [field]: value };
    if (field === "country") {
      updatedValues.state = "";
      updatedValues.lga = "";
    }
    if (field === "state") {
      updatedValues.lga = "";
    }

    setForm((prev) => ({ ...prev, ...updatedValues }));
    dispatch(setAssessorPersonalInfo(updatedValues));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (
      !passportFile &&
      !saved.passportFileName &&
      !saved.passportPreview &&
      !saved.passportAssetId
    ) {
      setPassportError("Passport photograph is required");
      valid = false;
    } else {
      setPassportError("");
    }

    const effectiveEmail = form.email.trim() || authUser?.email?.trim() || "";
    const result = personalInfoSchema.safeParse({
      ...form,
      email: effectiveEmail,
      impairment: "No",
    });
    if (!result.success) {
      Object.assign(newErrors, extractZodErrors(result));
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
        description: "Please upload your passport photo and fill in all required fields.",
      });
      return;
    }

    const effectiveEmail = form.email.trim() || authUser?.email?.trim() || "";

    setIsSubmitting(true);
    saveOnboarding.mutate(
      {
        personalDetails: {
          firstName: form.firstName,
          lastName: form.lastName,
          middleName: form.middleName,
          dob: formatToIsoDate(form.dob),
          gender: form.gender,
          nationality: form.nationality,
        },
        contactInformation: {
          emailAddress: effectiveEmail,
          phoneNumber: { countryCode: "+234", number: form.phoneNumber },
        },
        residentialAddress: {
          country: form.country,
          state: form.state,
          lga: form.lga,
          address: form.streetAddress,
        },
      },
      {
        onSettled: () => {
          setIsSubmitting(false);
          router.push(ASSESSOR_ROUTES.onboarding.assessorInfo);
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className="w-full flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
          <div className="flex flex-col w-full sm:w-auto">
            <div className="w-full max-w-109.75 flex justify-start mb-4 sm:mb-6">
              <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
                <div className="w-1/3 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
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

          <PassportUpload
            onImageChange={(file: File | null, asset?: StorageAsset | null) => {
              setPassportFile(file);
              if (file) {
                setPassportError("");
                const previewUrl = URL.createObjectURL(file);
                const finalUrl = asset?.url || previewUrl;
                dispatch(
                  setAssessorPersonalInfo({
                    passportFileName: file.name,
                    passportAssetId: asset?.assetId ?? "",
                    passportPreview: previewUrl,
                    passportUrl: finalUrl,
                  }),
                );
                dispatch(updateUser({ avatar: finalUrl, passportUrl: finalUrl }));
                setPassportAssetId(asset?.assetId ?? "");
              } else {
                setPassportAssetId("");
                dispatch(
                  setAssessorPersonalInfo({
                    passportFileName: "",
                    passportAssetId: "",
                    passportPreview: "",
                    passportUrl: "",
                  }),
                );
              }
            }}
            error={passportError}
            defaultImage={saved.passportPreview || saved.passportUrl}
          />
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={<span>First Name<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            error={errors.firstName}
          />
          <Input
            label={<span>Last Name<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder="Surname"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Middle Name"
            placeholder="Other names"
            value={form.middleName}
            onChange={(e) => update("middleName", e.target.value)}
          />
          <DatePicker
            label={<span>Date Of Birth<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder="dd/mm/yyyy"
            value={form.dob}
            onChange={(val) => update("dob", val)}
            error={errors.dob}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={<span>Gender<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder="Select"
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
            options={["Male", "Female", "Other"]}
            error={errors.gender}
          />
          <Select
            label={<span>Nationality<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder="Select"
            value={form.nationality}
            onChange={(e) => update("nationality", e.target.value)}
            options={countries.map((c) => c.label)}
            error={errors.nationality}
          />
        </div>

        {/* Contact Info */}
        <div className="pt-2">
          <h2 className="text-lg font-bold text-neutral-primary mb-3">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={<span>Email Address<span className="text-primary-solid ml-0.5">*</span></span>}
              placeholder="yourname@email.com"
              type="email"
              value={form.email || authUser?.email || ""}
              disabled={true}
              className="bg-gray-100/70 cursor-not-allowed opacity-80"
              helperText="Auto-filled from your registered account email."
            />
            <PhoneInput
              label={<span>Phone Number<span className="text-primary-solid ml-0.5">*</span></span>}
              placeholder="0000000000"
              value={form.phoneNumber}
              onChange={(val) => update("phoneNumber", val)}
              error={errors.phoneNumber}
            />
          </div>
        </div>

        {/* Residential Address */}
        <div className="pt-2">
          <h2 className="text-lg font-bold text-neutral-primary mb-3">
            Residential Address
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Select
              label={<span>Country<span className="text-primary-solid ml-0.5">*</span></span>}
              placeholder="Select"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              options={countries.map((c) => c.label)}
              error={errors.country}
            />
            <Select
              label={<span>State of Residence<span className="text-primary-solid ml-0.5">*</span></span>}
              placeholder="Select"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              options={states.map((s) => s.label)}
              error={errors.state}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={<span>Local Government Area (LGA)<span className="text-primary-solid ml-0.5">*</span></span>}
              placeholder="Select"
              value={form.lga}
              onChange={(e) => update("lga", e.target.value)}
              options={cities.length ? cities.map((c) => c.label) : ["Main LGA"]}
              error={errors.lga}
            />
            <Input
              label={<span>Street Address<span className="text-primary-solid ml-0.5">*</span></span>}
              placeholder="Street Address"
              value={form.streetAddress}
              onChange={(e) => update("streetAddress", e.target.value)}
              error={errors.streetAddress}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push(ASSESSOR_ROUTES.onboarding.roleSelection)}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="amber"
            size="md"
            loading={isSubmitting}
            rightIcon={<FiArrowRight className="w-4 h-4" />}
            className="px-8 h-11 font-bold text-sm rounded-xl shadow-lg cursor-pointer"
          >
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
