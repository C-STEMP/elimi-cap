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
import { useGetBanks, useResolveBankAccount } from "@/src/features/shared/reference/hooks";
import { patchCentreProfileApi } from "@/src/features/shared/centre/api";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setCentreInformation } from "@/src/store/slices/onboardingSlice";
import { SelectOption } from "@/src/components/ui/select";

export const CenterInformation: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { getOnboarding, saveOnboarding } = useOnboarding();
  const resolveAccountMutation = useResolveBankAccount();
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [accountResolveSuccess, setAccountResolveSuccess] = useState(false);
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

  const { data: remoteBanks = [], isLoading: isLoadingBanks } = useGetBanks(
    form.country ? form.country.toLowerCase() : "nigeria",
  );

  const bankOptions: (string | SelectOption)[] = React.useMemo(() => {
    if (remoteBanks && remoteBanks.length > 0) {
      return remoteBanks.map((b) => ({
        label: b.name,
        value: b.name,
      }));
    }
    return [
      "Access Bank",
      "Citibank",
      "Ecobank",
      "Fidelity Bank",
      "First Bank",
      "First City Monument Bank (FCMB)",
      "Globus Bank",
      "GTBank",
      "Heritage Bank",
      "Jaiz Bank",
      "Keystone Bank",
      "Kuda Bank",
      "Moniepoint MFB",
      "OPay",
      "Optimus Bank",
      "Palmpay",
      "Parallex Bank",
      "Polaris Bank",
      "Premium Trust Bank",
      "Providus Bank",
      "Rubies MFB",
      "Signature Bank",
      "Stanbic IBTC Bank",
      "Standard Chartered Bank",
      "Sterling Bank",
      "SunTrust Bank",
      "TAJ Bank",
      "Titan Trust Bank",
      "Union Bank",
      "UBA",
      "Unity Bank",
      "VFD Microfinance Bank",
      "Wema Bank",
      "Zenith Bank",
      "Other",
    ];
  }, [remoteBanks]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedBankCode = React.useMemo(() => {
    if (!form.bank) return null;
    const match = remoteBanks.find(
      (b) =>
        b.name.toLowerCase() === form.bank.toLowerCase() ||
        b.code === form.bank ||
        b.slug.toLowerCase() === form.bank.toLowerCase() ||
        form.bank.toLowerCase().includes(b.name.toLowerCase()) ||
        b.name.toLowerCase().includes(form.bank.toLowerCase()),
    );
    if (match?.code) return match.code;

    const NIGERIAN_BANK_CODES: Record<string, string> = {
      "access bank": "044",
      "citibank": "023",
      "ecobank": "050",
      "fidelity bank": "070",
      "first bank": "011",
      "first city monument bank": "214",
      "first city monument bank (fcmb)": "214",
      "fcmb": "214",
      "globus bank": "00103",
      "gtbank": "058",
      "guaranty trust bank": "058",
      "heritage bank": "030",
      "jaiz bank": "301",
      "keystone bank": "082",
      "kuda bank": "50211",
      "moniepoint mfb": "50515",
      "opay": "999992",
      "optimus bank": "107",
      "palmpay": "999991",
      "parallex bank": "526",
      "polaris bank": "076",
      "premium trust bank": "105",
      "providus bank": "101",
      "rubies mfb": "125",
      "signature bank": "106",
      "stanbic ibtc bank": "221",
      "stanbic ibtc": "221",
      "standard chartered bank": "068",
      "sterling bank": "232",
      "suntrust bank": "100",
      "taj bank": "302",
      "titan trust bank": "102",
      "union bank": "032",
      "uba": "033",
      "united bank for africa": "033",
      "unity bank": "215",
      "vfd microfinance bank": "566",
      "wema bank": "035",
      "zenith bank": "057",
    };
    return NIGERIAN_BANK_CODES[form.bank.toLowerCase().trim()] || null;
  }, [form.bank, remoteBanks]);

  // Auto-resolve account name with 500ms debounce
  React.useEffect(() => {
    const trimmedAcc = form.accountNumber.trim();
    if (trimmedAcc.length === 10 && selectedBankCode) {
      setIsResolvingAccount(true);
      setAccountResolveSuccess(false);

      const timer = setTimeout(() => {
        resolveAccountMutation.mutate(
          {
            accountNumber: trimmedAcc,
            bankCode: selectedBankCode,
          },
          {
            onSuccess: (data) => {
              setIsResolvingAccount(false);
              if (data?.accountName) {
                update("nameOnAccount", data.accountName);
                setAccountResolveSuccess(true);
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.nameOnAccount;
                  delete updated.accountNumber;
                  return updated;
                });
              }
            },
            onError: (err: any) => {
              setIsResolvingAccount(false);
              setAccountResolveSuccess(false);

              let userFriendlyMsg =
                "Could not verify account name. Please check your account number and selected bank.";
              const rawMsg = err?.message || "";

              if (
                rawMsg.toLowerCase().includes("not found") ||
                rawMsg.toLowerCase().includes("invalid account") ||
                rawMsg.toLowerCase().includes("could not resolve")
              ) {
                userFriendlyMsg =
                  "Account not found. Please double-check your 10-digit account number and bank.";
              } else if (rawMsg.toLowerCase().includes("timeout")) {
                userFriendlyMsg =
                  "Network timeout while verifying account name. You can enter the name manually.";
              }

              toast({
                type: "error",
                title: "Account Verification Failed",
                description: userFriendlyMsg,
              });
            },
          },
        );
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsResolvingAccount(false);
      setAccountResolveSuccess(false);
    }
  }, [form.accountNumber, selectedBankCode]);

  // Hydrate from API when getOnboarding completes
  React.useEffect(() => {
    if (getOnboarding.data?.data) {
      const apiData = getOnboarding.data.data as any;
      const cInfo = apiData?.centre?.centreInformation;
      const cAddr = apiData?.centre?.centreResidentialAddress;
      const cSupp = apiData?.centre?.centreSupportInformation;
      const cAcc = apiData?.centre?.centreAccountDetails;

      const next = {
        centerName: cInfo?.name || form.centerName || "",
        regNo: cInfo?.registrationNo || form.regNo || "",
        country: cAddr?.country || form.country || "Nigeria",
        state: cAddr?.state || form.state || "",
        lga: cAddr?.lga || form.lga || "",
        streetAddress: cAddr?.address || form.streetAddress || "",
        supportEmail: cSupp?.emailAddress || form.supportEmail || "",
        phoneNumber: cSupp?.phoneNumber?.number || form.phoneNumber || "",
        bank: cAcc?.bank || form.bank || "",
        accountNumber: cAcc?.accountNo || form.accountNumber || "",
        nameOnAccount: cAcc?.nameOfAccount || form.nameOnAccount || "",
      };
      setForm(next);
      dispatch(setCentreInformation(next));

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
          try {
            await patchCentreProfileApi({ logoAssetId: asset.assetId });
          } catch {
            // Non-blocking
          }
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
    const updatedValues: Partial<typeof form> = { [field]: value };
    if (field === "country" && form.country !== value) {
      updatedValues.state = "";
      updatedValues.lga = "";
    }
    if (field === "state" && form.state !== value) {
      updatedValues.lga = "";
    }

    setForm((prev) => ({ ...prev, ...updatedValues }));
    dispatch(setCentreInformation(updatedValues));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };


  // ── Country / State / City cascading selects ────────────────────────────
  const { countries, states, cities, isLoadingStates, isLoadingLgas } =
    useCountryStateCity(form.country, form.state);

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
              className={`relative w-32 h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all shrink-0 overflow-hidden group ${
                logoPreview ? "p-0" : "p-3"
              } ${
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
                <div className="relative w-full h-full">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1">
                    <FiUpload className="w-5 h-5" />
                    <span>Change</span>
                  </div>
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
            placeholder={
              isLoadingStates
                ? "Loading states..."
                : form.country
                  ? "Select state"
                  : "Select country first"
            }
            options={states}
            value={form.state}
            error={errors.state}
            disabled={isLoadingStates || !form.country || states.length === 0}
            onChange={(e) => update("state", e.target.value)}
          />

          <Select
            label={
              <span>
                City / LGA
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder={
              isLoadingLgas
                ? "Loading LGAs..."
                : form.state
                  ? "Select city / LGA"
                  : "Select state first"
            }
            options={cities}
            value={form.lga}
            error={errors.lga}
            disabled={isLoadingLgas || !form.state || cities.length === 0}
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
              placeholder={isLoadingBanks ? "Loading banks..." : "Select Bank"}
              options={bankOptions}
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
            <div className="flex flex-col gap-1">
              <Input
                label={
                  <span>
                    Name On Account
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                type="text"
                placeholder={
                  isResolvingAccount ? "Resolving account name..." : "Type Here"
                }
                value={form.nameOnAccount}
                error={errors.nameOnAccount}
                onChange={(e) => update("nameOnAccount", e.target.value)}
              />
              {isResolvingAccount && (
                <span className="text-xs text-amber-700 font-medium animate-pulse">
                  Resolving account name from bank...
                </span>
              )}
              {accountResolveSuccess && !isResolvingAccount && form.nameOnAccount && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  ✓ Verified account name
                </span>
              )}
            </div>
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
