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
import { ASSETS_URL } from "@/assets";
import {
  selfAssessmentStep1Schema,
  extractZodErrors,
} from "@/src/lib/validation";

import { useAppSelector } from "@/store/hooks";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import { useCandidateProfile } from "@/src/features/shared/onboarding/hooks";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";

interface Step1Props {
  onNext: () => void;
  onBack: () => void;
  application?: any;
}

export const Step1PersonalInfo: React.FC<Step1Props> = ({
  onNext,
  onBack,
  application,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const savedPersonalInfo = useAppSelector((state) => state.onboarding.personalInfo);
  const user = useAppSelector((state) => state.auth.user);

  const { data: meProfile } = useGetMeProfile();
  const { data: candidateProfile } = useCandidateProfile(true);

  const profileAvatar =
    savedPersonalInfo.passportUrl ||
    savedPersonalInfo.passportPreview ||
    application?.personalInformation?.passportAsset?.url ||
    (application as any)?.personalInformation?.passportUrl ||
    (application as any)?.candidate?.avatar ||
    (application as any)?.candidate?.photoUrl ||
    meProfile?.photo?.url ||
    (candidateProfile as any)?.passportPhoto?.url ||
    (candidateProfile as any)?.photo?.url ||
    (candidateProfile as any)?.avatar ||
    user?.avatar ||
    user?.avatarUrl ||
    user?.passportUrl ||
    null;

  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(
    profileAvatar || null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName:
      savedPersonalInfo.firstName ||
      application?.personalInformation?.personalDetails?.firstName ||
      meProfile?.personalDetails?.firstName ||
      user?.fullName?.split(" ")[0] ||
      "",
    lastName:
      savedPersonalInfo.lastName ||
      application?.personalInformation?.personalDetails?.lastName ||
      meProfile?.personalDetails?.lastName ||
      (user?.fullName?.split(" ")?.length && user.fullName.split(" ").length > 1
        ? user.fullName.split(" ").slice(1).join(" ")
        : "") ||
      "",
    middleName:
      savedPersonalInfo.middleName ||
      application?.personalInformation?.personalDetails?.middleName ||
      meProfile?.personalDetails?.middleName ||
      "",
    dob:
      savedPersonalInfo.dob ||
      application?.personalInformation?.personalDetails?.dob ||
      meProfile?.personalDetails?.dob ||
      "",
    email:
      savedPersonalInfo.email ||
      application?.personalInformation?.contactInformation?.emailAddress ||
      meProfile?.contactInformation?.emailAddress ||
      user?.email ||
      "",
    phone:
      savedPersonalInfo.phoneNumber ||
      application?.personalInformation?.contactInformation?.phoneNumber?.number ||
      meProfile?.contactInformation?.phoneNumber?.number ||
      user?.phoneNumber ||
      "",
    country:
      savedPersonalInfo.country ||
      application?.personalInformation?.residentialAddress?.country ||
      meProfile?.residentialAddress?.country ||
      "Nigeria",
    state:
      savedPersonalInfo.state ||
      application?.personalInformation?.residentialAddress?.state ||
      meProfile?.residentialAddress?.state ||
      "",
    lga:
      savedPersonalInfo.lga ||
      application?.personalInformation?.residentialAddress?.lga ||
      meProfile?.residentialAddress?.lga ||
      "",
    address:
      savedPersonalInfo.streetAddress ||
      application?.personalInformation?.residentialAddress?.address ||
      meProfile?.residentialAddress?.address ||
      "",
  });

  const {
    countries,
    states,
    cities,
    isLoadingStates,
    isLoadingLgas,
  } = useCountryStateCity(formData.country, formData.state);

  React.useEffect(() => {
    const details =
      application?.personalInformation?.personalDetails ||
      meProfile?.personalDetails;
    const contact =
      application?.personalInformation?.contactInformation ||
      meProfile?.contactInformation;
    const address =
      application?.personalInformation?.residentialAddress ||
      meProfile?.residentialAddress;

    setFormData((prev) => ({
      firstName: prev.firstName || details?.firstName || "",
      lastName: prev.lastName || details?.lastName || "",
      middleName: prev.middleName || details?.middleName || "",
      dob: prev.dob || details?.dob || "",
      email: prev.email || contact?.emailAddress || "",
      phone: prev.phone || contact?.phoneNumber?.number || "",
      country: prev.country || address?.country || "Nigeria",
      state: prev.state || address?.state || "",
      lga: prev.lga || address?.lga || "",
      address: prev.address || address?.address || "",
    }));

    if (!passportPreview && profileAvatar) {
      setPassportPreview(profileAvatar);
    }
  }, [application, meProfile, profileAvatar, passportPreview]);

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

    const hasPassport = Boolean(
      passportFile ||
      passportPreview ||
      profileAvatar ||
      savedPersonalInfo.passportUrl ||
      savedPersonalInfo.passportAssetId ||
      application?.personalInformation?.passportAsset?.url
    );

    if (!hasPassport) {
      newErrors.passport = "Passport photograph is required";
      valid = false;
    }

    const result = selfAssessmentStep1Schema.safeParse(formData);
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

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        passport: "Passport photograph",
      };

      const missingLabels = Object.keys(formErrors)
        .filter((k) => k !== "passport")
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
          defaultImage={passportPreview || undefined}
          error={errors.passport}
          onImageChange={(file, asset) => {
            setPassportFile(file);
            if (asset?.url) {
              setPassportPreview(asset.url);
            }
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
                  Country
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              name="country"
              value={formData.country}
              error={errors.country}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, country: val, state: "", lga: "" }));
                if (errors.country) setErrors((prev) => ({ ...prev, country: "" }));
              }}
              options={countries}
              placeholder="Select country"
              autoComplete="off"
            />

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
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, state: val, lga: "" }));
                if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
              }}
              options={states}
              placeholder={
                isLoadingStates
                  ? "Loading states..."
                  : formData.country
                    ? "Select state"
                    : "Select country first"
              }
              disabled={isLoadingStates || !formData.country || states.length === 0}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, lga: val }));
                if (errors.lga) setErrors((prev) => ({ ...prev, lga: "" }));
              }}
              options={cities}
              placeholder={
                isLoadingLgas
                  ? "Loading LGAs..."
                  : formData.state
                    ? "Select city / LGA"
                    : "Select state first"
              }
              disabled={isLoadingLgas || !formData.state || cities.length === 0}
              autoComplete="off"
            />

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
                src={ASSETS_URL.saveIcon}
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
