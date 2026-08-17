"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { DatePicker } from "@/src/components/ui/date-picker";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { PassportUpload } from "@/src/components/ui/passport-upload";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { InfoIcon } from "@/src/components/ui/info-icon";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";
import { StatusModal } from "@/components/status-modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarVariant, setRplStep } from "@/store/slices/authSlice";
import { setPersonalInfo } from "@/store/slices/onboardingSlice";
import {
  personalInfoSchema,
  extractZodErrors,
  formatToIsoDate,
} from "@/src/lib/validation";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { useOnboarding } from "@/src/features/candidate/features/Onboarding/hooks";

export interface RPLPersonalInfoProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const RPLPersonalInfo: React.FC<RPLPersonalInfoProps> = ({
  onBack,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { getOnboarding, saveOnboarding } = useOnboarding();

  const savedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);

  const [form, setForm] = useState({
    firstName: savedPersonalInfo.firstName ?? "",
    lastName: savedPersonalInfo.lastName ?? "",
    middleName: savedPersonalInfo.middleName ?? "",
    dob: savedPersonalInfo.dob ?? "",
    gender: savedPersonalInfo.gender ?? "",
    nationality: savedPersonalInfo.nationality ?? "",
    email: savedPersonalInfo.email ?? "",
    phoneNumber: savedPersonalInfo.phoneNumber ?? "",
    country: savedPersonalInfo.country || "Nigeria",
    state: savedPersonalInfo.state ?? "",
    lga: savedPersonalInfo.lga ?? "",
    streetAddress: savedPersonalInfo.streetAddress ?? "",
    completedBefore: "no",
    learnerId: "",
    impairment: savedPersonalInfo.impairment ?? "",
  });

  // Hydrate from getOnboarding API response if available
  useEffect(() => {
    if (getOnboarding.data?.data) {
      const apiData = getOnboarding.data.data as any;
      const pd = apiData?.personalDetails;
      const ci = apiData?.contactInformation;
      const ra = apiData?.residentialAddress;
      const acc = apiData?.accessibility;

      const hydrated = {
        firstName: pd?.firstName || savedPersonalInfo.firstName || "",
        lastName: pd?.lastName || savedPersonalInfo.lastName || "",
        middleName: pd?.middleName || savedPersonalInfo.middleName || "",
        dob: pd?.dob || savedPersonalInfo.dob || "",
        gender: pd?.gender || savedPersonalInfo.gender || "",
        nationality: pd?.nationality || savedPersonalInfo.nationality || "",
        email: ci?.emailAddress || savedPersonalInfo.email || "",
        phoneNumber: ci?.phoneNumber?.number || savedPersonalInfo.phoneNumber || "",
        country: ra?.country || savedPersonalInfo.country || "Nigeria",
        state: ra?.state || savedPersonalInfo.state || "",
        lga: ra?.lga || savedPersonalInfo.lga || "",
        streetAddress: ra?.address || savedPersonalInfo.streetAddress || "",
        completedBefore: "no",
        learnerId: "",
        impairment: acc?.impairment || savedPersonalInfo.impairment || "",
      };

      setForm(hydrated);
      dispatch(setPersonalInfo(hydrated));
    }
  }, [getOnboarding.data]);

  const [otherImpairment, setOtherImpairment] = useState("");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const handleSaveDraft = () => {
    setShowConfirmDraftModal(true);
  };

  const handleConfirmSaveDraft = () => {
    setShowConfirmDraftModal(false);
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
          emailAddress: form.email,
          phoneNumber: {
            countryCode: "+234",
            number: form.phoneNumber,
          },
        },
        residentialAddress: {
          country: form.country,
          state: form.state,
          lga: form.lga,
          address: form.streetAddress,
        },
      },
      {
        onSuccess: () => {
          setShowDraftModal(true);
        },
      },
    );
  };

  useEffect(() => {
    dispatch(setSidebarVariant("rpl-form"));
    dispatch(setRplStep(1));
  }, [dispatch]);

  // ── Country / State / City cascading selects ────────────────────────────
  const { countries, states, cities } = useCountryStateCity(
    form.country,
    form.state,
  );

  const update = (field: keyof typeof form, value: string) => {
    let nextState = "";
    let nextLga = "";
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country") {
        next.state = "";
        next.lga = "";
      }
      if (field === "state") {
        next.lga = "";
      }
      nextState = next.state;
      nextLga = next.lga;
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Dispatch to Redux immediately for full persistence across steps/pages
    dispatch(
      setPersonalInfo({
        [field]: value,
        state: nextState,
        lga: nextLga,
      } as any),
    );
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
      if (form.completedBefore !== "yes") {
        delete newErrors.learnerId;
      }
      if (Object.keys(newErrors).length > 0) {
        valid = false;
      }
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
        description:
          "Please upload your passport photograph and fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        type: "success",
        title: "Personal Information Saved",
        description: "Step 1 of 4 completed successfully!",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/rpl/experience-trade");
      }
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto pb-12"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-1 pt-1 w-full sm:w-auto">
          <h1 className="text-2xl xl:text-[26px] font-extrabold tracking-tight text-primary">
            Step 1 of 4: Personal Information
          </h1>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
            Establish the candidate's identity and eligibility.
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

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
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
            options={countries}
            value={form.nationality}
            error={errors.nationality}
            onChange={(e) => update("nationality", e.target.value)}
          />
        </div>

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
              value={form.phoneNumber}
              onChange={(v) => update("phoneNumber", v)}
              onCountryChange={(cName) => update("country", cName)}
              error={errors.phoneNumber}
              defaultCountry="NG"
            />
          </div>
        </div>

        {/* Section 3: Residential Address */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
            Street Address <InfoIcon sectionName="Residential Address" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={
                <span>
                  Country
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select country"
              options={countries}
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
              placeholder={
                form.country ? "Select state" : "Select country first"
              }
              options={states}
              value={form.state}
              error={errors.state}
              disabled={!form.country}
              onChange={(e) => update("state", e.target.value)}
            />

            <Select
              label={
                <span>
                  City / LGA
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder={form.state ? "Select city" : "Select state first"}
              options={cities}
              value={form.lga}
              error={errors.lga}
              disabled={!form.state}
              onChange={(e) => update("lga", e.target.value)}
            />

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

        {/* Section 4: Have You Completed An Assessment Before */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
            Have You Completed An Assessment Before{" "}
            <InfoIcon sectionName="Have You Completed An Assessment Before" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-text-dark font-medium text-xs xl:text-sm">
                Select An Option
                <span className="text-primary-solid ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 h-11 xl:h-12">
                <button
                  type="button"
                  onClick={() => update("completedBefore", "yes")}
                  className={`flex items-center justify-between px-4 h-full rounded-radius-200 border transition-all text-xs xl:text-sm font-medium cursor-pointer ${
                    form.completedBefore === "yes"
                      ? "bg-input-bg border-primary-solid text-text-dark"
                      : "bg-input-bg border-transparent text-text-dark/70 hover:text-text-dark"
                  }`}
                >
                  <span>Yes</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.completedBefore === "yes" ? "border-primary-solid bg-primary-solid" : "border-gray-400"}`}
                  >
                    {form.completedBefore === "yes" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    update("completedBefore", "no");
                    update("learnerId", "");
                  }}
                  className={`flex items-center justify-between px-4 h-full rounded-radius-200 border transition-all text-xs xl:text-sm font-medium cursor-pointer ${
                    form.completedBefore === "no"
                      ? "bg-input-bg border-primary-solid text-text-dark"
                      : "bg-input-bg border-transparent text-text-dark/70 hover:text-text-dark"
                  }`}
                >
                  <span>No</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.completedBefore === "no" ? "border-primary-solid bg-primary-solid" : "border-gray-400"}`}
                  >
                    {form.completedBefore === "no" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {form.completedBefore === "yes" && (
              <Input
                label={
                  <span>
                    If Yes, Enter Unique Learner ID
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                placeholder="000000000"
                value={form.learnerId}
                error={errors.learnerId}
                onChange={(e) => update("learnerId", e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Section 5: Accessibility */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
            Accessibility <InfoIcon sectionName="Accessibility" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              onChange={(e) => {
                const val = e.target.value;
                update("impairment", val);
                if (val !== "Other") {
                  setOtherImpairment("");
                }
              }}
            />

            {form.impairment === "Other" && (
              <Input
                label={
                  <span>
                    Specify Impairment
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                type="text"
                placeholder="Please specify your impairment"
                value={otherImpairment}
                error={errors.otherImpairment}
                onChange={(e) => {
                  setOtherImpairment(e.target.value);
                  if (errors.otherImpairment) {
                    setErrors((prev) => ({ ...prev, otherImpairment: "" }));
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 gap-4">
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-5 h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
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
              type="submit"
              variant="amber"
              size="md"
              loading={isSubmitting}
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
        onAction={handleConfirmSaveDraft}
      />

      <StatusModal
        isOpen={showDraftModal}
        variant="draft-saved"
        onClose={() => setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Personal Information Saved"
        description="Step 1 of 4 completed successfully!"
        actionLabel="Continue Application"
        onAction={() => setShowSuccessModal(false)}
      />
    </motion.div>
  );
};
