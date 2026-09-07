"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useToast } from "@/src/components/ui/toast";
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
} from "@/src/features/shared/account/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { useGetBanks, useResolveBankAccount } from "@/src/features/shared/reference/hooks";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  setCentreInformation,
  setCentrePersonalInfo,
} from "@/src/store/slices/onboardingSlice";
import { NIGERIAN_BANK_CODES, FALLBACK_BANKS } from "../utils/bankHelpers";

export type SettingsSubTab = "profile" | "centre" | "pricing" | "security" | "delete";

export function useSettingsViewState() {
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

  const savedCentreInfo = useAppSelector((s) => s.onboarding.centreInformation);
  const savedCentrePersonalInfo = useAppSelector((s) => s.onboarding.centrePersonalInfo);
  const authUser = useAppSelector((state) => state.auth.user);
  const savedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("centre");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    savedCentreInfo.logoPreview || uploadedAvatar || null
  );

  useEffect(() => {
    if (uploadedAvatar && !logoPreview) setLogoPreview(uploadedAvatar);
  }, [uploadedAvatar, logoPreview]);

  // Personal profile fields
  const [firstName, setFirstName] = useState(savedCentrePersonalInfo.firstName || "");
  const [lastName, setLastName] = useState(savedCentrePersonalInfo.lastName || "");
  const [middleName, setMiddleName] = useState(savedCentrePersonalInfo.middleName || "");
  const [dob, setDob] = useState(savedCentrePersonalInfo.dob || "");
  const [gender, setGender] = useState(savedCentrePersonalInfo.gender || "");
  const [nationality, setNationality] = useState(savedCentrePersonalInfo.nationality || "");
  const [profileEmail, setProfileEmail] = useState(savedCentrePersonalInfo.email || "");
  const [profilePhone, setProfilePhone] = useState(savedCentrePersonalInfo.phoneNumber || "");
  const [profileCountry, setProfileCountry] = useState(savedCentrePersonalInfo.country || "Nigeria");
  const [profileState, setProfileState] = useState(savedCentrePersonalInfo.state || "");
  const [profileLga, setProfileLga] = useState(savedCentrePersonalInfo.lga || "");
  const [profileStreet, setProfileStreet] = useState(savedCentrePersonalInfo.streetAddress || "");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(false);

  // Centre fields
  const [centreName, setCentreName] = useState(savedCentreInfo.centerName || "");
  const [regNo, setRegNo] = useState(savedCentreInfo.regNo || "");
  const [centreCountry, setCentreCountry] = useState(savedCentreInfo.country || "Nigeria");
  const [centreState, setCentreState] = useState(savedCentreInfo.state || "");
  const [centreLga, setCentreLga] = useState(savedCentreInfo.lga || "");
  const [centreStreet, setCentreStreet] = useState(savedCentreInfo.streetAddress || "");
  const [supportEmail, setSupportEmail] = useState(savedCentreInfo.supportEmail || "");
  const [supportPhone, setSupportPhone] = useState(savedCentreInfo.phoneNumber || "");
  const [bank, setBank] = useState(savedCentreInfo.bank || "");
  const [accountNumber, setAccountNumber] = useState(savedCentreInfo.accountNumber || "");
  const [accountName, setAccountName] = useState(savedCentreInfo.nameOnAccount || "");
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [accountResolveSuccess, setAccountResolveSuccess] = useState(false);

  const resolveAccountMutation = useResolveBankAccount();
  const { data: remoteBanks = [] } = useGetBanks(centreCountry ? centreCountry.toLowerCase() : "nigeria");

  const selectedBankCode = useMemo(() => {
    if (!bank) return null;
    const match = remoteBanks.find(
      (b) =>
        b.name.toLowerCase() === bank.toLowerCase() ||
        b.code === bank ||
        b.slug.toLowerCase() === bank.toLowerCase() ||
        bank.toLowerCase().includes(b.name.toLowerCase()) ||
        b.name.toLowerCase().includes(bank.toLowerCase())
    );
    if (match?.code) return match.code;
    return NIGERIAN_BANK_CODES[bank.toLowerCase().trim()] || null;
  }, [bank, remoteBanks]);

  useEffect(() => {
    const trimmed = accountNumber.trim();
    if (trimmed.length === 10 && selectedBankCode) {
      setIsResolvingAccount(true);
      setAccountResolveSuccess(false);
      const timer = setTimeout(() => {
        resolveAccountMutation.mutate(
          { accountNumber: trimmed, bankCode: selectedBankCode },
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
              toast({ type: "error", title: "Account Verification Failed", description: "Could not verify account name. Please check account number and bank." });
            },
          }
        );
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsResolvingAccount(false);
      setAccountResolveSuccess(false);
    }
  }, [accountNumber, selectedBankCode]);

  const bankOptions = useMemo(() => {
    if (remoteBanks && remoteBanks.length > 0) {
      return remoteBanks.map((b) => ({ label: b.name, value: b.name }));
    }
    return FALLBACK_BANKS;
  }, [remoteBanks]);

  // Pricing & Security
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

  // Hydrations
  useEffect(() => {
    if (meProfile) {
      const pd = meProfile.personalDetails;
      const ci = meProfile.contactInformation;
      const ra = meProfile.residentialAddress;
      if (pd?.firstName) setFirstName(pd.firstName);
      if (pd?.lastName) setLastName(pd.lastName);
      if (pd?.middleName) setMiddleName(pd.middleName);
      if (pd?.dob) setDob(pd.dob);
      if (pd?.gender) setGender(pd.gender);
      if (pd?.nationality) setNationality(pd.nationality);
      if (ci?.emailAddress) setProfileEmail(ci.emailAddress);
      if (ci?.phoneNumber?.number) setProfilePhone(ci.phoneNumber.number);
      if (ra?.country) setProfileCountry(ra.country);
      if (ra?.state) setProfileState(ra.state);
      if (ra?.lga) setProfileLga(ra.lga);
      if (ra?.address) setProfileStreet(ra.address);
    }
    if (centreProfile) {
      if (centreProfile.name) setCentreName(centreProfile.name);
      if (centreProfile.registrationNo) setRegNo(centreProfile.registrationNo);
      if (centreProfile.logo?.url) setLogoPreview(centreProfile.logo.url);
      if (centreProfile.address?.country) setCentreCountry(centreProfile.address.country);
      if (centreProfile.address?.state) setCentreState(centreProfile.address.state);
      if (centreProfile.address?.lga) setCentreLga(centreProfile.address.lga);
      if (centreProfile.address?.address) setCentreStreet(centreProfile.address.address);
      if (centreProfile.supportContact?.emailAddress) setSupportEmail(centreProfile.supportContact.emailAddress);
      if (centreProfile.supportContact?.phoneNumber?.number) setSupportPhone(centreProfile.supportContact.phoneNumber.number);
      if (centreProfile.accountDetails?.bank) setBank(centreProfile.accountDetails.bank);
      if (centreProfile.accountDetails?.accountNo) setAccountNumber(centreProfile.accountDetails.accountNo);
      if (centreProfile.accountDetails?.nameOfAccount) setAccountName(centreProfile.accountDetails.nameOfAccount);
    }
  }, [meProfile, centreProfile]);

  useEffect(() => {
    if (pricingList.length > 0) {
      const rpl = pricingList.find((p) => p.applicationType === "RPL");
      const nsq = pricingList.find((p) => p.applicationType === "NSQ");
      if (rpl?.price) {
        setRplAmount((Number(rpl.price.amountMinorUnits) / 100).toString());
        setRplCurrency(rpl.price.currency === "USD" ? "USD ($)" : "NGN (₦)");
      }
      if (nsq?.price) {
        setStandardAmount((Number(nsq.price.amountMinorUnits) / 100).toString());
        setStandardCurrency(nsq.price.currency === "USD" ? "USD ($)" : "NGN (₦)");
      }
    }
  }, [pricingList]);

  const handleSaveProfileSettings = () => {
    patchMeProfileMutation.mutate(
      {
        personalDetails: !(meProfile?.identityVerified || authUser?.isVerified)
          ? { firstName, lastName, middleName: middleName?.trim() || undefined, dob: formatToIsoDate(dob) || "2000-01-01", gender, nationality }
          : undefined,
        contactInformation: { emailAddress: profileEmail, phoneNumber: { countryCode: "+234", number: profilePhone } },
        residentialAddress: { country: profileCountry, state: profileState, lga: profileLga, address: profileStreet },
      },
      {
        onSuccess: () => {
          dispatch(setCentrePersonalInfo({ firstName, lastName, middleName, dob, gender, nationality, email: profileEmail, phoneNumber: profilePhone, country: profileCountry, state: profileState, lga: profileLga, streetAddress: profileStreet }));
          toast({ type: "success", title: "Profile Saved", description: "Your profile information has been updated." });
        },
      }
    );
  };

  const handleSaveCentreSettings = () => {
    patchCentreProfileMutation.mutate(
      {
        name: centreName,
        address: { country: centreCountry, state: centreState, lga: centreLga, address: centreStreet },
        supportContact: { emailAddress: supportEmail, phoneNumber: { countryCode: "+234", number: supportPhone } },
        accountDetails: { bank, accountNo: accountNumber, nameOfAccount: accountName },
      },
      {
        onSuccess: () => {
          dispatch(setCentreInformation({ centerName: centreName, regNo, country: centreCountry, state: centreState, lga: centreLga, streetAddress: centreStreet, supportEmail, phoneNumber: supportPhone, bank, accountNumber, nameOnAccount: accountName }));
          toast({ type: "success", title: "Centre Details Saved", description: "Your centre profile has been updated." });
        },
      }
    );
  };

  const handleSavePricingSettings = () => {
    if (rplAmount) {
      setCentrePricingMutation.mutate({
        applicationType: "RPL",
        price: { amountMinorUnits: (Number(rplAmount) * 100).toString(), currency: rplCurrency.includes("USD") ? "USD" : "NGN" },
      });
    }
    if (standardAmount) {
      setCentrePricingMutation.mutate({
        applicationType: "NSQ",
        price: { amountMinorUnits: (Number(standardAmount) * 100).toString(), currency: standardCurrency.includes("USD") ? "USD" : "NGN" },
      });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
      try {
        const asset = await uploadFileMutation.mutateAsync({ file, purpose: activeSubTab === "centre" ? "logo" : "passport" });
        if (asset?.url) setLogoPreview(asset.url);
        if (asset?.assetId) {
          if (activeSubTab === "centre") patchCentreProfileMutation.mutate({ logoAssetId: asset.assetId });
          else patchMeProfileMutation.mutate({ photoAssetId: asset.assetId });
        }
      } catch {}
    }
  };

  const { countries, states: profileStates, cities: profileCities } = useCountryStateCity(profileCountry, profileState);
  const { states: centreStates, cities: centreCities } = useCountryStateCity(centreCountry, centreState);

  return {
    meProfile, authUser, activeSubTab, setActiveSubTab, isDeleteModalOpen, setIsDeleteModalOpen,
    logoPreview, fileInputRef, handlePictureChange,
    firstName, setFirstName, lastName, setLastName, middleName, setMiddleName,
    dob, setDob, gender, setGender, nationality, setNationality,
    profileEmail, setProfileEmail, profilePhone, setProfilePhone,
    profileCountry, setProfileCountry, profileState, setProfileState,
    profileLga, setProfileLga, profileStreet, setProfileStreet,
    emailNotifications, setEmailNotifications, sessionReminders, setSessionReminders,
    centreName, setCentreName, regNo, setRegNo, centreCountry, setCentreCountry,
    centreState, setCentreState, centreLga, setCentreLga, centreStreet, setCentreStreet,
    supportEmail, setSupportEmail, supportPhone, setSupportPhone,
    bank, setBank, accountNumber, setAccountNumber, accountName, setAccountName,
    isResolvingAccount, accountResolveSuccess, bankOptions,
    rplCurrency, setRplCurrency, rplAmount, setRplAmount,
    standardCurrency, setStandardCurrency, standardAmount, setStandardAmount,
    currentPassword, setCurrentPassword, newPassword, setNewPassword,
    confirmPassword, setConfirmPassword, showCurrentPassword, setShowCurrentPassword,
    showNewPassword, setShowNewPassword, showConfirmPassword, setShowConfirmPassword,
    handleSaveProfileSettings, handleSaveCentreSettings, handleSavePricingSettings,
    countries, profileStates, profileCities, centreStates, centreCities,
    isSavingProfile: patchMeProfileMutation.isPending,
    isSavingCentre: patchCentreProfileMutation.isPending,
    isSavingPricing: setCentrePricingMutation.isPending,
  };
}
