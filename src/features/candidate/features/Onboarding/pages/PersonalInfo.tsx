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
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarVariant } from "@/store/slices/authSlice";
import { setPersonalInfo } from "@/store/slices/onboardingSlice";
import {
  personalInfoSchema,
  extractZodErrors,
  formatToIsoDate,
} from "@/src/lib/validation";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { useOnboarding } from "@/src/features/candidate/features/Onboarding/hooks";

import {
  IMPAIRMENT_OPTIONS,
  GENDER_OPTIONS,
} from "@/features/candidate/utils";

export interface PersonalInfoProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
  onBack,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { getOnboarding, saveOnboarding } = useOnboarding();

  const authUser = useAppSelector((s) => s.auth.user);
  const savedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);

  const initialEmail =
    savedPersonalInfo.email || authUser?.email || "";

  const [form, setForm] = useState({
    firstName: savedPersonalInfo.firstName ?? "",
    lastName: savedPersonalInfo.lastName ?? "",
    middleName: savedPersonalInfo.middleName ?? "",
    dob: savedPersonalInfo.dob ?? "",
    gender: savedPersonalInfo.gender ?? "",
    nationality: savedPersonalInfo.nationality ?? "",
    email: initialEmail,
    phoneNumber: savedPersonalInfo.phoneNumber ?? "",
    country: savedPersonalInfo.country || "Nigeria",
    state: savedPersonalInfo.state ?? "",
    lga: savedPersonalInfo.lga ?? "",
    streetAddress: savedPersonalInfo.streetAddress ?? "",
    impairment: savedPersonalInfo.impairment ?? "None / No impairment",
  });

  const [selectedImpairments, setSelectedImpairments] = useState<string[]>(() => {
    if (
      !savedPersonalInfo.impairment ||
      savedPersonalInfo.impairment === "No" ||
      savedPersonalInfo.impairment === "None"
    ) {
      return ["None / No impairment"];
    }
    return savedPersonalInfo.impairment
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  });

  const [otherImpairment, setOtherImpairment] = useState("");

  // Hydrate from getOnboarding API response
  useEffect(() => {
    if (getOnboarding.data?.data) {
      const apiData = getOnboarding.data.data as any;
      const pd = apiData?.personalDetails;
      const ci = apiData?.contactInformation;
      const ra = apiData?.residentialAddress;
      const acc = apiData?.accessibility;
      const passportAssetId: string = apiData?.passportAssetId ?? "";
      const passportUrl: string = apiData?.passportUrl ?? "";

      const hydratedEmail =
        ci?.emailAddress || savedPersonalInfo.email || authUser?.email || "";

      const rawImpairment =
        acc?.impairment || savedPersonalInfo.impairment || "None / No impairment";
      const parsedImpairments =
        rawImpairment === "No" || rawImpairment === "None" || !rawImpairment
          ? ["None / No impairment"]
          : rawImpairment.split(",").map((s: string) => s.trim()).filter(Boolean);

      const hydrated = {
        firstName: pd?.firstName || savedPersonalInfo.firstName || "",
        lastName: pd?.lastName || savedPersonalInfo.lastName || "",
        middleName: pd?.middleName || savedPersonalInfo.middleName || "",
        dob: pd?.dob || savedPersonalInfo.dob || "",
        gender: pd?.gender || savedPersonalInfo.gender || "",
        nationality: pd?.nationality || savedPersonalInfo.nationality || "",
        email: hydratedEmail,
        phoneNumber:
          ci?.phoneNumber?.number || savedPersonalInfo.phoneNumber || "",
        country: ra?.country || savedPersonalInfo.country || "Nigeria",
        state: ra?.state || savedPersonalInfo.state || "",
        lga: ra?.lga || savedPersonalInfo.lga || "",
        streetAddress: ra?.address || savedPersonalInfo.streetAddress || "",
        impairment: parsedImpairments.join(", "),
      };

      setForm(hydrated);
      setSelectedImpairments(parsedImpairments);
      dispatch(setPersonalInfo(hydrated));

      // Restore passport photo from API data
      if (passportAssetId || passportUrl) {
        dispatch(setPersonalInfo({ passportAssetId, passportUrl }));
        setPassportDefaultImage(
          passportUrl || savedPersonalInfo.passportUrl || "",
        );
      } else if (savedPersonalInfo.passportUrl) {
        setPassportDefaultImage(savedPersonalInfo.passportUrl);
      }
    } else if (authUser?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: authUser.email || "" }));
    }
  }, [getOnboarding.data, authUser?.email]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportDefaultImage, setPassportDefaultImage] = useState<string>(
    savedPersonalInfo.passportUrl || "",
  );
  const [passportError, setPassportError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { countries, states, cities, resolvedCountryCode } =
    useCountryStateCity(form.country, form.state);

  useEffect(() => {
    dispatch(setSidebarVariant("default"));
  }, [dispatch]);

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
    // Persist to Redux immediately
    dispatch(
      setPersonalInfo({ [field]: value, state: nextState, lga: nextLga } as any),
    );
  };

  const handleToggleImpairment = (option: string) => {
    let next: string[];
    const isExclusive =
      option === "None / No impairment" || option === "Prefer not to say";

    if (isExclusive) {
      next = [option];
      setOtherImpairment("");
    } else {
      const withoutExclusive = selectedImpairments.filter(
        (x) =>
          x !== "None / No impairment" &&
          x !== "Prefer not to say" &&
          x !== "None" &&
          x !== "No",
      );
      if (withoutExclusive.includes(option)) {
        next = withoutExclusive.filter((x) => x !== option);
        if (next.length === 0) next = ["None / No impairment"];
      } else {
        next = [...withoutExclusive, option];
      }
    }
    setSelectedImpairments(next);
    const joined = next.join(", ");
    update("impairment", joined);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    // Allow proceeding if an existing passport URL/file/asset is already present
    const hasPassport = Boolean(
      passportFile ||
      passportDefaultImage ||
      savedPersonalInfo.passportUrl ||
      savedPersonalInfo.passportAssetId
    );

    if (!hasPassport) {
      setPassportError("Passport photograph is required");
      valid = false;
    } else {
      setPassportError("");
    }

    if (selectedImpairments.length === 0) {
      newErrors.impairment = "Please select your impairment status";
      valid = false;
    } else if (
      selectedImpairments.includes("Other") &&
      !otherImpairment.trim()
    ) {
      newErrors.otherImpairment = "Please specify your impairment";
      valid = false;
    }

    const result = personalInfoSchema.safeParse(form);
    if (!result.success) {
      Object.assign(newErrors, extractZodErrors(result));
      valid = false;
    }

    setErrors(newErrors);
    return {
      valid: valid && Object.keys(newErrors).length === 0,
      hasPassport,
      errors: newErrors,
    };
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { valid, hasPassport, errors: formErrors } = validateForm();

    if (!valid) {
      const fieldLabels: Record<string, string> = {
        firstName: "First Name",
        lastName: "Last Name",
        dob: "Date of Birth",
        gender: "Gender",
        nationality: "Nationality",
        phoneNumber: "Phone Number",
        country: "Country",
        state: "State of Residence",
        lga: "City / LGA",
        streetAddress: "Residential Address",
        impairment: "Impairment status",
        otherImpairment: "Other impairment specification",
      };

      const missingLabels = Object.keys(formErrors)
        .map((k) => fieldLabels[k] || k)
        .filter(Boolean);

      let desc = "";
      if (!hasPassport && missingLabels.length > 0) {
        desc = `Please upload your passport photograph and fill in the required fields: ${missingLabels.slice(0, 3).join(", ")}${missingLabels.length > 3 ? "..." : "."}`;
      } else if (!hasPassport) {
        desc = "Please upload your passport photograph.";
      } else if (missingLabels.length === 1) {
        desc = `Please complete the required field: ${missingLabels[0]}.`;
      } else if (missingLabels.length <= 3) {
        desc = `Please fill in all required fields: ${missingLabels.join(", ")}.`;
      } else {
        desc = `Please complete the required fields: ${missingLabels.slice(0, 3).join(", ")}, and ${missingLabels.length - 3} more.`;
      }

      toast({
        type: "error",
        title: "Input Required",
        description: desc,
      });
      return;
    }

    setIsSubmitting(true);
    const resolvedImpairment = selectedImpairments
      .map((imp) => (imp === "Other" ? `Other: ${otherImpairment}` : imp))
      .join(", ");

    const hasImpairment =
      !selectedImpairments.includes("None / No impairment") &&
      !selectedImpairments.includes("Prefer not to say") &&
      !selectedImpairments.includes("None") &&
      !selectedImpairments.includes("No") &&
      selectedImpairments.length > 0;

    dispatch(
      setPersonalInfo({
        ...form,
        email: form.email || authUser?.email || "",
        impairment: resolvedImpairment,
        passportFileName:
          passportFile?.name ?? savedPersonalInfo.passportFileName,
      }),
    );

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
          emailAddress: form.email || authUser?.email || "",
          phoneNumber: {
            countryCode: resolvedCountryCode ? `+${resolvedCountryCode}` : "+234",
            number: form.phoneNumber,
          },
        },
        residentialAddress: {
          country: form.country,
          state: form.state,
          lga: form.lga,
          address: form.streetAddress,
        },
        accessibility: {
          hasImpairment,
          impairment: resolvedImpairment,
        },
        previousAssessmentStatus: {
          hasCompletedPreviousAssessment: false,
        },
      },
      {
        onSettled: () => {
          setIsSubmitting(false);
          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/onboarding/verify-identity");
          }
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
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Back button */}
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

        {/* Step progress + Passport Upload */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
          <div className="flex flex-col w-full sm:w-auto">
            <div className="w-full max-w-109.75 flex justify-start mb-4 sm:mb-6">
              <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
                <div className="w-1/2 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
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

          {/* Passport Upload */}
          <PassportUpload
            required
            defaultImage={passportDefaultImage}
            error={passportError}
            onImageChange={(file, asset) => {
              setPassportFile(file);
              const previewUrl =
                asset?.url || (file ? URL.createObjectURL(file) : "");
              if (file || previewUrl) {
                setPassportError("");
                setPassportDefaultImage(
                  previewUrl || savedPersonalInfo.passportUrl || "",
                );
                dispatch(
                  setPersonalInfo({
                    passportAssetId:
                      asset?.assetId ||
                      savedPersonalInfo.passportAssetId ||
                      "",
                    passportUrl:
                      previewUrl || savedPersonalInfo.passportUrl || "",
                    passportFileName:
                      file?.name ?? savedPersonalInfo.passportFileName ?? "",
                  }),
                );
              } else {
                setPassportDefaultImage("");
                dispatch(
                  setPersonalInfo({
                    passportAssetId: "",
                    passportUrl: "",
                    passportFileName: "",
                  }),
                );
              }
            }}
          />
        </div>

        {/* Section 1: Personal Information Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
            options={GENDER_OPTIONS}
            value={form.gender}
            error={errors.gender}
            onChange={(e) => update("gender", e.target.value)}
          />

          <Select
            label={
              <span>
                Nationality
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={countries}
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
              value={form.email || authUser?.email || ""}
              disabled={true}
              className="bg-gray-100/70 cursor-not-allowed opacity-80"
              helperText="Auto-filled from your registered account email."
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
              onCountryChange={(cName) => {
                update("country", cName);
                if (!form.nationality) {
                  update("nationality", cName);
                }
              }}
              error={errors.phoneNumber}
              country={
                resolvedCountryCode ? resolvedCountryCode.toLowerCase() : "ng"
              }
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

        {/* Section 4: Accessibility / Impairment (Comprehensive Multi-select) */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
            Accessibility <InfoIcon sectionName="Accessibility" />
          </h2>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs sm:text-sm font-medium text-text-dark">
              Do you have any impairment? (Select all that apply)
              <span className="text-primary-solid ml-0.5">*</span>
            </label>

            <div className="flex flex-wrap gap-2.5 w-full">
              {IMPAIRMENT_OPTIONS.map((opt) => {
                const isSelected = selectedImpairments.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleImpairment(opt)}
                    className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border text-left leading-snug wrap-break-word ${
                      isSelected
                        ? "bg-[#a31d38] text-white border-[#a31d38] shadow-xs"
                        : "bg-white text-neutral-primary border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-white text-[#a31d38] border-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <FiCheck className="w-3 h-3 stroke-3" />}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {errors.impairment && (
              <span className="text-primary-solid text-xs font-semibold mt-1">
                {errors.impairment}
              </span>
            )}

            {selectedImpairments.includes("Other") && (
              <div className="mt-2 max-w-md">
                <Input
                  label={
                    <span>
                      Specify Other Impairment
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
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="flex items-center gap-2 text-sm font-medium text-black hover:text-text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="secondary"
            size="md"
            loading={isSubmitting}
            className="px-6 h-11 text-white font-bold text-sm bg-secondary hover:bg-secondary-hover rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <span>Continue to Verification</span>
            <FiArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
