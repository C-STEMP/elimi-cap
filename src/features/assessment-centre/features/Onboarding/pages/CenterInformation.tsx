"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiUpload } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { InfoIcon } from "@/src/components/ui/info-icon";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";

import { ASSESSMENT_CENTRE_ROUTES } from "@/features/assessment-centre/utils/centreRoutes";

import { useOnboarding } from "@/src/features/assessment-centre/features/Onboarding/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setCentreInformation } from "@/src/store/slices/onboardingSlice";

export const CenterInformation: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { getOnboarding, saveOnboarding } = useOnboarding();
  const uploadFileMutation = useUploadFile();
  const savedCentreInfo = useAppSelector((s) => s.onboarding.centreInformation);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    savedCentreInfo.logoPreview || null,
  );
  const [logoAssetId, setLogoAssetId] = useState<string | undefined>(
    savedCentreInfo.logoAssetId || undefined,
  );

  const [form, setForm] = useState({
    centerName: savedCentreInfo.centerName || "",
    regNo: savedCentreInfo.regNo || "",
    country: savedCentreInfo.country || "Nigeria",
    state: savedCentreInfo.state || "",
    lga: savedCentreInfo.lga || "",
    streetAddress: savedCentreInfo.streetAddress || "",
    supportEmail: savedCentreInfo.supportEmail || "",
    phoneNumber: savedCentreInfo.phoneNumber || "",
    bank: savedCentreInfo.bank || "",
    accountNumber: savedCentreInfo.accountNumber || "",
    nameOnAccount: savedCentreInfo.nameOnAccount || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hydrate from API when getOnboarding completes
  React.useEffect(() => {
    if (getOnboarding.data?.data) {
      const apiData = getOnboarding.data.data as any;
      const cInfo = apiData?.centre?.centreInformation;
      const cAddr = apiData?.centre?.centreResidentialAddress;
      const cSupp = apiData?.centre?.centreSupportInformation;
      const cAcc = apiData?.centre?.centreAccountDetails;

      setForm((prev) => {
        const next = {
          centerName: cInfo?.name || prev.centerName || "",
          regNo: cInfo?.registrationNo || prev.regNo || "",
          country: cAddr?.country || prev.country || "Nigeria",
          state: cAddr?.state || prev.state || "",
          lga: cAddr?.lga || prev.lga || "",
          streetAddress: cAddr?.address || prev.streetAddress || "",
          supportEmail: cSupp?.emailAddress || prev.supportEmail || "",
          phoneNumber: cSupp?.phoneNumber?.number || prev.phoneNumber || "",
          bank: cAcc?.bank || prev.bank || "",
          accountNumber: cAcc?.accountNo || prev.accountNumber || "",
          nameOnAccount: cAcc?.nameOfAccount || prev.nameOnAccount || "",
        };
        dispatch(setCentreInformation(next));
        return next;
      });

      if (cInfo?.logoAssetId) {
        setLogoAssetId(cInfo.logoAssetId);
        dispatch(setCentreInformation({ logoAssetId: cInfo.logoAssetId }));
      }
    }
  }, [getOnboarding.data, dispatch]);

  React.useEffect(() => {
    if (!form.country) {
      setForm((prev) => ({ ...prev, country: "Nigeria" }));
    }
  }, []);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const localUrl = URL.createObjectURL(file);
      setLogoPreview(localUrl);
      dispatch(setCentreInformation({ logoPreview: localUrl }));
      if (errors.logo) {
        setErrors((prev) => ({ ...prev, logo: "" }));
      }

      try {
        const asset = await uploadFileMutation.mutateAsync({
          file,
          purpose: "logo",
        });
        if (asset?.assetId) {
          setLogoAssetId(asset.assetId);
          dispatch(setCentreInformation({ logoAssetId: asset.assetId }));
        }
        if (asset?.url) {
          setLogoPreview(asset.url);
          dispatch(setCentreInformation({ logoPreview: asset.url }));
        }
      } catch {
        // Fallback to local preview
      }
    }
  };

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Reset dependent location fields
      if (field === "country") {
        next.state = "";
        next.lga = "";
      }
      if (field === "state") {
        next.lga = "";
      }
      dispatch(setCentreInformation(next));
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };


  // ── Country / State / City cascading selects ────────────────────────────
  const { countries, states, cities } = useCountryStateCity(
    form.country,
    form.state,
  );

  const validate = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (
      !logoFile &&
      !logoPreview &&
      !logoAssetId &&
      !savedCentreInfo.logoPreview &&
      !savedCentreInfo.logoAssetId
    ) {
      newErrors.logo = "Center logo is required";
      valid = false;
    }

    if (!form.centerName.trim()) {
      newErrors.centerName = "Name of Assessment Center is required";
      valid = false;
    }
    if (!form.regNo.trim()) {
      newErrors.regNo = "Registration No is required";
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
    if (!form.supportEmail.trim()) {
      newErrors.supportEmail = "Support Email Address is required";
      valid = false;
    }
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
      valid = false;
    }
    if (!form.bank) {
      newErrors.bank = "Bank is required";
      valid = false;
    }
    if (!form.accountNumber.trim()) {
      newErrors.accountNumber = "Account Number is required";
      valid = false;
    } else if (!/^\d{10}$/.test(form.accountNumber)) {
      newErrors.accountNumber = "Account Number must be exactly 10 digits";
      valid = false;
    }
    if (!form.nameOnAccount.trim()) {
      newErrors.nameOnAccount = "Name On Account is required";
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
          "Please upload your center logo and fill in all required fields.",
      });
      return;
    }

    saveOnboarding.mutate(
      {
        centre: {
          centreInformation: {
            name: form.centerName,
            registrationNo: form.regNo,
            logoAssetId,
          },
          centreResidentialAddress: {
            country: form.country,
            state: form.state,
            lga: form.lga,
            address: form.streetAddress,
          },
          centreSupportInformation: {
            emailAddress: form.supportEmail,
            phoneNumber: {
              countryCode: "+234",
              number: form.phoneNumber,
            },
          },
          centreAccountDetails: {
            bank: form.bank,
            accountNo: form.accountNumber,
            nameOfAccount: form.nameOnAccount,
          },
        },
      },
      {
        onSettled: () => {
          router.push(ASSESSMENT_CENTRE_ROUTES.onboarding.personalInfo);
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
                Center Information
              </h1>
              <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
                Collect only essential information.
              </p>
            </div>
          </div>

          {/* Top Right Logo Upload Card */}
          <div className="flex flex-col items-center sm:items-end gap-1 shrink-0">
            <label
              className={`relative w-32 h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all shrink-0 ${
                errors.logo
                  ? "border-red-500 bg-red-50/50"
                  : "border-red-300 bg-red-50/20 hover:bg-red-50/40"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                className="hidden"
                onChange={handleLogoChange}
              />
              {logoPreview ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <>
                  <FiUpload className="w-5 h-5 text-primary-solid mb-1.5" />
                  <span className="font-bold text-xs text-primary-solid">
                    Upload Logo
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                    5mb image max size
                  </span>
                </>
              )}
            </label>
            {errors.logo && (
              <span className="text-primary-solid text-xs font-semibold">
                {errors.logo}
              </span>
            )}
          </div>
        </div>

        {/* Center Details Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={
              <span>
                Name Of Assessment Center
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            type="text"
            placeholder="Type Here"
            value={form.centerName}
            error={errors.centerName}
            onChange={(e) => update("centerName", e.target.value)}
          />

          <Input
            label={
              <span>
                Registration No
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            type="text"
            placeholder="Type Here"
            value={form.regNo}
            error={errors.regNo}
            onChange={(e) => update("regNo", e.target.value)}
          />

          <Select
            label={
              <span>
                Country<span className="text-primary-solid ml-0.5">*</span>
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
            placeholder={form.country ? "Select state" : "Select country first"}
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

        {/* Section 2: Center Support Information */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-primary flex items-center gap-1.5">
            Center Support Information{" "}
            <InfoIcon sectionName="Center Support Information" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={
                <span>
                  Support Email Address
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="email"
              placeholder="Email Address"
              value={form.supportEmail}
              error={errors.supportEmail}
              onChange={(e) => update("supportEmail", e.target.value)}
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

        {/* Section 3: Account Details */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-primary flex items-center gap-1.5">
            Account Details <InfoIcon sectionName="Account Details" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={
                <span>
                  Bank<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={[
                "Access Bank",
                "GTBank",
                "First Bank",
                "Zenith Bank",
                "UBA",
                "Kuda Bank",
                "Moniepoint",
                "OPay",
                "Other",
              ]}
              value={form.bank}
              error={errors.bank}
              onChange={(e) => update("bank", e.target.value)}
            />

            <Input
              label={
                <span>
                  Account Number
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="text"
              inputMode="numeric"
              placeholder="0000000000"
              maxLength={10}
              value={form.accountNumber}
              error={errors.accountNumber}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, "");
                update("accountNumber", digits);
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label={
                <span>
                  Name On Account
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="text"
              placeholder="Type Here"
              value={form.nameOnAccount}
              error={errors.nameOnAccount}
              onChange={(e) => update("nameOnAccount", e.target.value)}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push("/onboarding/role-selection")}
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
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
