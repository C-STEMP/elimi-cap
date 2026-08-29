"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiSave,
  FiCalendar,
  FiShield,
} from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { DatePicker } from "@/src/components/ui/date-picker";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { ASSETS_URL } from "@/assets";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { formatToIsoDate } from "@/src/lib/validation";
import { useOnboarding } from "@/features/assessment-centre/features/Onboarding/hooks";
import {
  useGetCentrePricing,
  useSetCentrePricing,
  useGetCentreProfile,
  usePatchCentreProfile,
} from "@/src/features/shared/centre/hooks";
import {
  useGetMeProfile,
  usePatchMeProfile,
  useGetDeletionEligibility,
} from "@/src/features/shared/account/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { useGetBanks, useResolveBankAccount } from "@/src/features/shared/reference/hooks";
import { SelectOption } from "@/src/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  setCentreInformation,
  setCentrePersonalInfo,
} from "@/src/store/slices/onboardingSlice";

export type SettingsSubTab =
  | "profile"
  | "centre"
  | "pricing"
  | "security"
  | "delete";

export const SettingsView: React.FC = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { getOnboarding } = useOnboarding();
  const { data: meProfile } = useGetMeProfile();
  const { data: centreProfile } = useGetCentreProfile();
  const { data: pricingList = [] } = useGetCentrePricing();
  const setCentrePricingMutation = useSetCentrePricing();
  const uploadFileMutation = useUploadFile();
  const patchMeProfileMutation = usePatchMeProfile();
  const patchCentreProfileMutation = usePatchCentreProfile();

  const savedCentreInfo = useAppSelector(
    (s) => s.onboarding.centreInformation,
  );
  const savedCentrePersonalInfo = useAppSelector(
    (s) => s.onboarding.centrePersonalInfo,
  );

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("centre");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);
  const savedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);

  const uploadedAvatar =
    meProfile?.photo?.url ||
    centreProfile?.logo?.url ||
    (savedCentrePersonalInfo as any)?.passportUrl ||
    savedCentreInfo?.logoPreview ||
    savedPersonalInfo?.passportUrl ||
    authUser?.avatar ||
    (authUser as any)?.avatarUrl ||
    (authUser as any)?.passportUrl;

  const [logoPreview, setLogoPreview] = useState<string | null>(
    savedCentreInfo.logoPreview || uploadedAvatar || null,
  );

  React.useEffect(() => {
    if (uploadedAvatar && !logoPreview) {
      setLogoPreview(uploadedAvatar);
    }
  }, [uploadedAvatar, logoPreview]);

  const [firstName, setFirstName] = useState(
    savedCentrePersonalInfo.firstName || "",
  );
  const [lastName, setLastName] = useState(
    savedCentrePersonalInfo.lastName || "",
  );
  const [middleName, setMiddleName] = useState(
    savedCentrePersonalInfo.middleName || "",
  );
  const [dob, setDob] = useState(savedCentrePersonalInfo.dob || "");
  const [gender, setGender] = useState(savedCentrePersonalInfo.gender || "");
  const [nationality, setNationality] = useState(
    savedCentrePersonalInfo.nationality || "",
  );
  const [profileEmail, setProfileEmail] = useState(
    savedCentrePersonalInfo.email || "",
  );
  const [profilePhone, setProfilePhone] = useState(
    savedCentrePersonalInfo.phoneNumber || "",
  );
  const [profileCountry, setProfileCountry] = useState(
    savedCentrePersonalInfo.country || "Nigeria",
  );
  const [profileState, setProfileState] = useState(
    savedCentrePersonalInfo.state || "",
  );
  const [profileLga, setProfileLga] = useState(
    savedCentrePersonalInfo.lga || "",
  );
  const [profileStreet, setProfileStreet] = useState(
    savedCentrePersonalInfo.streetAddress || "",
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(false);

  const [centreName, setCentreName] = useState(
    savedCentreInfo.centerName || "",
  );
  const [regNo, setRegNo] = useState(savedCentreInfo.regNo || "");
  const [centreCountry, setCentreCountry] = useState(
    savedCentreInfo.country || "Nigeria",
  );
  const [centreState, setCentreState] = useState(
    savedCentreInfo.state || "",
  );
  const [centreLga, setCentreLga] = useState(savedCentreInfo.lga || "");
  const [centreStreet, setCentreStreet] = useState(
    savedCentreInfo.streetAddress || "",
  );
  const [supportEmail, setSupportEmail] = useState(
    savedCentreInfo.supportEmail || "",
  );
  const [supportPhone, setSupportPhone] = useState(
    savedCentreInfo.phoneNumber || "",
  );
  const [bank, setBank] = useState(savedCentreInfo.bank || "");
  const [accountNumber, setAccountNumber] = useState(
    savedCentreInfo.accountNumber || "",
  );
  const [accountName, setAccountName] = useState(
    savedCentreInfo.nameOnAccount || "",
  );
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [accountResolveSuccess, setAccountResolveSuccess] = useState(false);

  const resolveAccountMutation = useResolveBankAccount();

  const { data: remoteBanks = [], isLoading: isLoadingBanks } = useGetBanks(
    centreCountry ? centreCountry.toLowerCase() : "nigeria",
  );

  const selectedBankCode = React.useMemo(() => {
    if (!bank) return null;
    const match = remoteBanks.find(
      (b) =>
        b.name.toLowerCase() === bank.toLowerCase() ||
        b.code === bank ||
        b.slug.toLowerCase() === bank.toLowerCase() ||
        bank.toLowerCase().includes(b.name.toLowerCase()) ||
        b.name.toLowerCase().includes(bank.toLowerCase()),
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
    return NIGERIAN_BANK_CODES[bank.toLowerCase().trim()] || null;
  }, [bank, remoteBanks]);

  // Auto-resolve account name with 500ms debounce
  React.useEffect(() => {
    const trimmedAcc = accountNumber.trim();
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
                setAccountName(data.accountName);
                setAccountResolveSuccess(true);
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
  }, [accountNumber, selectedBankCode]);

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

  const [rplCurrency, setRplCurrency] = useState("NGN (₦)");
  const [rplAmount, setRplAmount] = useState("45000");
  const [standardCurrency, setStandardCurrency] = useState("NGN (₦)");
  const [standardAmount, setStandardAmount] = useState("65000");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hydrate from backend APIs (meProfile, centreProfile, getOnboarding)
  React.useEffect(() => {
    // 1. Personal details from /me/profile
    if (meProfile) {
      if (meProfile.personalDetails?.firstName)
        setFirstName(meProfile.personalDetails.firstName);
      if (meProfile.personalDetails?.lastName)
        setLastName(meProfile.personalDetails.lastName);
      if (meProfile.personalDetails?.middleName)
        setMiddleName(meProfile.personalDetails.middleName);
      if (meProfile.personalDetails?.dob)
        setDob(meProfile.personalDetails.dob);
      if (meProfile.personalDetails?.gender)
        setGender(meProfile.personalDetails.gender);
      if (meProfile.personalDetails?.nationality)
        setNationality(meProfile.personalDetails.nationality);

      if (meProfile.contactInformation?.emailAddress)
        setProfileEmail(meProfile.contactInformation.emailAddress);
      if (meProfile.contactInformation?.phoneNumber?.number)
        setProfilePhone(meProfile.contactInformation.phoneNumber.number);

      if (meProfile.residentialAddress?.country)
        setProfileCountry(meProfile.residentialAddress.country);
      if (meProfile.residentialAddress?.state)
        setProfileState(meProfile.residentialAddress.state);
      if (meProfile.residentialAddress?.lga)
        setProfileLga(meProfile.residentialAddress.lga);
      if (meProfile.residentialAddress?.address)
        setProfileStreet(meProfile.residentialAddress.address);
    }

    // 2. Centre details from /centre/profile
    if (centreProfile) {
      if (centreProfile.name) setCentreName(centreProfile.name);
      if (centreProfile.registrationNo) setRegNo(centreProfile.registrationNo);
      if (centreProfile.logo?.url) setLogoPreview(centreProfile.logo.url);
      if (centreProfile.address?.country) setCentreCountry(centreProfile.address.country);
      if (centreProfile.address?.state) setCentreState(centreProfile.address.state);
      if (centreProfile.address?.lga) setCentreLga(centreProfile.address.lga);
      if (centreProfile.address?.address) setCentreStreet(centreProfile.address.address);
      if (centreProfile.supportContact?.emailAddress)
        setSupportEmail(centreProfile.supportContact.emailAddress);
      if (centreProfile.supportContact?.phoneNumber?.number)
        setSupportPhone(centreProfile.supportContact.phoneNumber.number);
      if (centreProfile.accountDetails?.bank) setBank(centreProfile.accountDetails.bank);
      if (centreProfile.accountDetails?.accountNo)
        setAccountNumber(centreProfile.accountDetails.accountNo);
      if (centreProfile.accountDetails?.nameOfAccount)
        setAccountName(centreProfile.accountDetails.nameOfAccount);
    }

    // 3. Fallback to onboarding record
    if (getOnboarding.data?.data) {
      const apiData = getOnboarding.data.data as any;

      // Centre details
      const cInfo = apiData?.centre?.centreInformation;
      const cAddr = apiData?.centre?.centreResidentialAddress;
      const cSupp = apiData?.centre?.centreSupportInformation;
      const cAcc = apiData?.centre?.centreAccountDetails;

      if (cInfo?.name && !centreName) setCentreName(cInfo.name);
      if (cInfo?.registrationNo && !regNo) setRegNo(cInfo.registrationNo);
      if (cAddr?.country && !centreCountry) setCentreCountry(cAddr.country);
      if (cAddr?.state && !centreState) setCentreState(cAddr.state);
      if (cAddr?.lga && !centreLga) setCentreLga(cAddr.lga);
      if (cAddr?.address && !centreStreet) setCentreStreet(cAddr.address);
      if (cSupp?.emailAddress && !supportEmail) setSupportEmail(cSupp.emailAddress);
      if (cSupp?.phoneNumber?.number && !supportPhone)
        setSupportPhone(cSupp.phoneNumber.number);
      if (cAcc?.bank && !bank) setBank(cAcc.bank);
      if (cAcc?.accountNo && !accountNumber) setAccountNumber(cAcc.accountNo);
      if (cAcc?.nameOfAccount && !accountName) setAccountName(cAcc.nameOfAccount);

      // Owner profile details
      const owner = apiData?.owner;
      const pd = owner?.personalDetails;
      const ci = owner?.contactInformation;
      const ra = owner?.residentialAddress;

      if (pd?.firstName && !firstName) setFirstName(pd.firstName);
      if (pd?.lastName && !lastName) setLastName(pd.lastName);
      if (pd?.middleName && !middleName) setMiddleName(pd.middleName);
      if (pd?.dob && !dob) setDob(pd.dob);
      if (pd?.gender && !gender) setGender(pd.gender);
      if (pd?.nationality && !nationality) setNationality(pd.nationality);
      if (ci?.emailAddress && !profileEmail) setProfileEmail(ci.emailAddress);
      if (ci?.phoneNumber?.number && !profilePhone) setProfilePhone(ci.phoneNumber.number);
      if (ra?.country && !profileCountry) setProfileCountry(ra.country);
      if (ra?.state && !profileState) setProfileState(ra.state);
      if (ra?.lga && !profileLga) setProfileLga(ra.lga);
      if (ra?.address && !profileStreet) setProfileStreet(ra.address);
    }
  }, [meProfile, centreProfile, getOnboarding.data]);

  // Hydrate Pricing list
  React.useEffect(() => {
    if (pricingList.length > 0) {
      const rpl = pricingList.find((p) => p.applicationType === "RPL");
      const nsq = pricingList.find((p) => p.applicationType === "NSQ");
      if (rpl?.price) {
        setRplAmount((Number(rpl.price.amountMinorUnits) / 100).toString());
        setRplCurrency(
          rpl.price.currency === "USD" ? "USD ($)" : "NGN (₦)",
        );
      }
      if (nsq?.price) {
        setStandardAmount(
          (Number(nsq.price.amountMinorUnits) / 100).toString(),
        );
        setStandardCurrency(
          nsq.price.currency === "USD" ? "USD ($)" : "NGN (₦)",
        );
      }
    }
  }, [pricingList]);

  const handleSaveProfileSettings = () => {
    patchMeProfileMutation.mutate(
      {
        personalDetails: !(meProfile?.identityVerified || authUser?.isVerified)
          ? {
              firstName,
              lastName,
              middleName: middleName?.trim() || undefined,
              dob: formatToIsoDate(dob) || "2000-01-01",
              gender,
              nationality,
            }
          : undefined,
        contactInformation: {
          emailAddress: profileEmail,
          phoneNumber: {
            countryCode: "+234",
            number: profilePhone,
          },
        },
        residentialAddress: {
          country: profileCountry,
          state: profileState,
          lga: profileLga,
          address: profileStreet,
        },
      },
      {
        onSuccess: () => {
          dispatch(
            setCentrePersonalInfo({
              firstName,
              lastName,
              middleName,
              dob,
              gender,
              nationality,
              email: profileEmail,
              phoneNumber: profilePhone,
              country: profileCountry,
              state: profileState,
              lga: profileLga,
              streetAddress: profileStreet,
            }),
          );
        },
      },
    );
  };

  const handleSaveCentreSettings = () => {
    patchCentreProfileMutation.mutate(
      {
        name: centreName,
        address: {
          country: centreCountry,
          state: centreState,
          lga: centreLga,
          address: centreStreet,
        },
        supportContact: {
          emailAddress: supportEmail,
          phoneNumber: {
            countryCode: "+234",
            number: supportPhone,
          },
        },
        accountDetails: {
          bank,
          accountNo: accountNumber,
          nameOfAccount: accountName,
        },
      },
      {
        onSuccess: () => {
          dispatch(
            setCentreInformation({
              centerName: centreName,
              regNo,
              country: centreCountry,
              state: centreState,
              lga: centreLga,
              streetAddress: centreStreet,
              supportEmail,
              phoneNumber: supportPhone,
              bank,
              accountNumber,
              nameOnAccount: accountName,
            }),
          );
          toast({
            type: "success",
            title: "Centre Details Saved",
            description: "Your centre profile has been updated successfully.",
          });
        },
        onError: () => {
          toast({
            type: "error",
            title: "Save Failed",
            description: "Could not save centre details. Please try again.",
          });
        },
      },
    );
  };

  const handleSavePricingSettings = () => {
    if (rplAmount) {
      setCentrePricingMutation.mutate({
        applicationType: "RPL",
        price: {
          amountMinorUnits: (Number(rplAmount) * 100).toString(),
          currency: rplCurrency.includes("USD") ? "USD" : "NGN",
        },
      });
    }
    if (standardAmount) {
      setCentrePricingMutation.mutate({
        applicationType: "NSQ",
        price: {
          amountMinorUnits: (Number(standardAmount) * 100).toString(),
          currency: standardCurrency.includes("USD") ? "USD" : "NGN",
        },
      });
    }
  };

  const handlePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const localUrl = URL.createObjectURL(file);
      setLogoPreview(localUrl);

      try {
        const asset = await uploadFileMutation.mutateAsync({
          file,
          purpose: activeSubTab === "centre" ? "logo" : "passport",
        });
        if (asset?.url) setLogoPreview(asset.url);
        if (asset?.assetId) {
          if (activeSubTab === "centre") {
            patchCentreProfileMutation.mutate({
              logoAssetId: asset.assetId,
            });
          } else {
            patchMeProfileMutation.mutate({
              photoAssetId: asset.assetId,
            });
          }
        }
      } catch {
        // Fallback to local preview
      }
    }
  };


  const {
    countries,
    states: profileStates,
    cities: profileCities,
  } = useCountryStateCity(profileCountry, profileState);

  const { states: centreStates, cities: centreCities } = useCountryStateCity(
    centreCountry,
    centreState,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6 w-full">
          <div className="flex items-center gap-3.5">
            <div className="relative w-29 h-29 flex items-center justify-center rounded-xl overflow-hidden shrink-0 bg-primary/10 shadow-xs">
              <Image
                src={logoPreview || ASSETS_URL.cstempLogo}
                alt="User Avatar"
                fill
                sizes="100px"
                className="object-cover"
                priority
                loading="eager"
              />
            </div>

            <div className="flex flex-col items-start justify-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary font-sans hover:bg-[#721328] text-white text-[11px] font-semibold px-4 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Change Picture
              </button>
              <span className="text-[10px] font-sans text-[#191913] mt-1 font-medium">
                JPG or PNG 10mb
              </span>

              <div className="flex items-center gap-1 text-[11px] lg:mt-3 font-medium text-[#1E7F4C]">
                <FiCheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSubTab("centre")}
              className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                activeSubTab === "centre"
                  ? "bg-primary/10 text-black font-semibold shadow-2xs"
                  : "text-black font-medium hover:bg-gray-50"
              }`}
            >
              Centre Information
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("profile")}
              className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                activeSubTab === "profile"
                  ? "bg-primary/10 text-black font-semibold shadow-2xs"
                  : "text-black font-medium hover:bg-gray-50"
              }`}
            >
              Profile Information
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("pricing")}
              className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                activeSubTab === "pricing"
                  ? "bg-[#FDF2F4] text-neutral-primary font-extrabold shadow-2xs"
                  : "text-neutral-secondary hover:text-neutral-primary hover:bg-gray-50"
              }`}
            >
              Pricing
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("security")}
              className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                activeSubTab === "security"
                  ? "bg-[#FDF2F4] text-neutral-primary font-extrabold shadow-2xs"
                  : "text-neutral-secondary hover:text-neutral-primary hover:bg-gray-50"
              }`}
            >
              Security
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full text-left p-3.5 rounded-2xl text-red-600 font-semibold hover:bg-red-50 transition-all cursor-pointer mt-2"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
          {/* SubTab 1: Profile Information (Image 5) */}
          {activeSubTab === "profile" && (
            <div className="w-full flex flex-col gap-8">
              {/* Personal Details */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Personal Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name*"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    label="Last Name*"
                    placeholder="Surname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Middle Name"
                    placeholder="Other names"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                  <DatePicker
                    label="Date Of Birth*"
                    placeholder="dd/mm/yyyy"
                    value={dob}
                    onChange={(val) => setDob(val)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Gender*"
                    placeholder="Select"
                    options={["Male", "Female", "Other"]}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <Select
                    label="Nationality*"
                    placeholder="Select"
                    options={countries}
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    placeholder="Select"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                  />
                  <PhoneInput
                    label="Phone Number"
                    value={profilePhone}
                    country={profileCountry || "ng"}
                    onChange={(val) => setProfilePhone(val)}
                  />
                </div>
              </div>

              {/* Residential Address */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Residential Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Country*"
                    placeholder="Select country"
                    options={countries}
                    value={profileCountry}
                    onChange={(e) => {
                      setProfileCountry(e.target.value);
                      setProfileState("");
                      setProfileLga("");
                    }}
                  />
                  <Select
                    label="State of Residence*"
                    placeholder={
                      profileCountry ? "Select state" : "Select country first"
                    }
                    options={profileStates}
                    value={profileState}
                    disabled={!profileCountry}
                    onChange={(e) => {
                      setProfileState(e.target.value);
                      setProfileLga("");
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="City / LGA*"
                    placeholder={
                      profileState ? "Select city" : "Select state first"
                    }
                    options={profileCities}
                    value={profileLga}
                    disabled={!profileState}
                    onChange={(e) => setProfileLga(e.target.value)}
                  />
                  <Input
                    label="Street Address*"
                    placeholder="Street Address"
                    value={profileStreet}
                    onChange={(e) => setProfileStreet(e.target.value)}
                  />
                </div>
              </div>

              {/* Notification Preference */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Notification Preference
                </h3>

                <div className="flex flex-col gap-3">
                  <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-neutral-primary">
                        Email Notifications
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        Receive notification via email
                      </span>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setEmailNotifications((prev) => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                        emailNotifications ? "bg-[#a31d38]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          emailNotifications ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-neutral-primary">
                        Session Reminders
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        24h and 1h before sessions
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSessionReminders((prev) => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                        sessionReminders ? "bg-[#a31d38]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          sessionReminders ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={handleSaveProfileSettings}
                  loading={patchMeProfileMutation.isPending}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSave className="w-4 h-4" />}
                  className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* SubTab 2: Centre Information (Image 1) */}
          {activeSubTab === "centre" && (
            <div className="w-full flex flex-col gap-8">
              {/* Centre Information */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Centre Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Name Of Assessment Center*"
                    placeholder="Type Here"
                    value={centreName}
                    onChange={(e) => setCentreName(e.target.value)}
                  />
                  <Input
                    label="Registration No*"
                    placeholder="Type Here"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Country*"
                    placeholder="Select country"
                    options={countries}
                    value={centreCountry}
                    onChange={(e) => {
                      setCentreCountry(e.target.value);
                      setCentreState("");
                      setCentreLga("");
                    }}
                  />
                  <Select
                    label="State of Residence*"
                    placeholder={
                      centreCountry ? "Select state" : "Select country first"
                    }
                    options={centreStates}
                    value={centreState}
                    disabled={!centreCountry}
                    onChange={(e) => {
                      setCentreState(e.target.value);
                      setCentreLga("");
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="City / LGA*"
                    placeholder={
                      centreState ? "Select city" : "Select state first"
                    }
                    options={centreCities}
                    value={centreLga}
                    disabled={!centreState}
                    onChange={(e) => setCentreLga(e.target.value)}
                  />
                  <Input
                    label="Street Address*"
                    placeholder="Street Address"
                    value={centreStreet}
                    onChange={(e) => setCentreStreet(e.target.value)}
                  />
                </div>
              </div>

              {/* Center Support Information */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Center Support Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Support Email Address*"
                    placeholder="Email Address"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />

                  <PhoneInput
                    label={
                      <span>
                        Phone Number<span className="text-primary-solid ml-0.5">*</span>
                      </span>
                    }
                    value={supportPhone}
                    country={centreCountry || "ng"}
                    onChange={(val) => setSupportPhone(val)}
                  />
                </div>
              </div>

              {/* Account Details */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Account Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Bank*"
                    placeholder={isLoadingBanks ? "Loading banks..." : "Select Bank"}
                    options={bankOptions}
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                  />
                  <Input
                    label="Account Number*"
                    placeholder="0000000000"
                    inputMode="numeric"
                    // maxLength={10}
                    value={accountNumber}
                    onChange={(e) =>
                      setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Input
                    label="Name On Account*"
                    placeholder={
                      isResolvingAccount ? "Resolving account name..." : "Type Here"
                    }
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                  {isResolvingAccount && (
                    <span className="text-xs text-amber-700 font-medium animate-pulse">
                      Resolving account name from bank...
                    </span>
                  )}
                  {accountResolveSuccess && !isResolvingAccount && accountName && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      ✓ Verified account name
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={handleSaveCentreSettings}
                  loading={patchCentreProfileMutation.isPending}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSave className="w-4 h-4" />}
                  className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* SubTab 3: Pricing (Image 2) */}
          {activeSubTab === "pricing" && (
            <div className="w-full flex flex-col gap-8">
              {/* Recognition of Prior Learning(RPL) */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Recognition of Prior Learning(RPL)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Currency"
                    placeholder="Select"
                    options={["NGN (₦)", "USD ($)"]}
                    value={rplCurrency}
                    onChange={(e) => setRplCurrency(e.target.value)}
                  />
                  <Input
                    label="Amount"
                    type="number"
                    placeholder="00"
                    value={rplAmount}
                    onChange={(e) => setRplAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Standard Skill Assessment */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
                  Standard Skill Assessment
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Currency"
                    placeholder="Select"
                    options={["NGN (₦)", "USD ($)"]}
                    value={standardCurrency}
                    onChange={(e) => setStandardCurrency(e.target.value)}
                  />
                  <Input
                    label="Amount"
                    type="number"
                    placeholder="00"
                    value={standardAmount}
                    onChange={(e) => setStandardAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={handleSavePricingSettings}
                  loading={setCentrePricingMutation.isPending}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSave className="w-4 h-4" />}
                  className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* SubTab 4: Security (Images 3 & 4) */}
          {activeSubTab === "security" && (
            <div className="w-full flex flex-col gap-8">
              {/* Verification Status */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
                  Verification Status
                </h3>

                <div className="bg-emerald-50/80 p-4.5 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-emerald-800">
                      NIN Verification
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">
                      Verification Complete
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-100/80 px-3 py-1.5 rounded-full">
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
                  Change Password
                </h3>

                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                      Password
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-input-bg border border-transparent focus:border-primary rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-primary outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-primary cursor-pointer"
                      >
                        {showCurrentPassword ? (
                          <FiEye className="w-4 h-4 text-text-dark/70" />
                        ) : (
                          <Image
                            src={ASSETS_URL.eyeClosedIcon}
                            alt="Hide password"
                            width={16}
                            height={16}
                            className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                      New Password
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-input-bg border border-transparent focus:border-primary rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-primary outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-primary cursor-pointer"
                      >
                        {showNewPassword ? (
                          <FiEye className="w-4 h-4 text-text-dark/70" />
                        ) : (
                          <Image
                            src={ASSETS_URL.eyeClosedIcon}
                            alt="Hide password"
                            width={16}
                            height={16}
                            className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                      Confirm Password
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-input-bg border border-transparent focus:border-primary rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-primary outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-primary cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <FiEye className="w-4 h-4 text-text-dark/70" />
                        ) : (
                          <Image
                            src={ASSETS_URL.eyeClosedIcon}
                            alt="Hide password"
                            width={16}
                            height={16}
                            className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={() => {
                    toast({
                      type: "success",
                      title: "Password Updated",
                      description:
                        "Your password has been changed successfully.",
                    });
                  }}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSave className="w-4 h-4" />}
                  className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Change Password
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
