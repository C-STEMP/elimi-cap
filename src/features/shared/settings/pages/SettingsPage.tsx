"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { ASSETS_URL } from "@/assets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPersonalInfo } from "@/store/slices/onboardingSlice";
import { formatToIsoDate } from "@/src/lib/validation";
import { useToast } from "@/src/components/ui/toast";
import {
  SettingsTab,
  VerificationStatus,
  ProfileFormData,
  SecurityFormData,
} from "../types/settings.types";
import { SettingsSidebar } from "../components/SettingsSidebar";
import { ProfileInfoTab } from "../components/ProfileInfoTab";
import { SecurityTab } from "../components/SecurityTab";
import { StatusModal } from "@/components/status-modal";
import { DeleteAccountModal } from "../components/DeleteAccountModal";
import { SuccessModal } from "../components/SuccessModal";

import { useCandidateProfile } from "@/src/features/shared/onboarding/hooks";
import { markVerified, updateUser } from "@/store/slices/authSlice";
import { useUploadFile } from "@/src/features/shared/storage/hooks";

export const SettingsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const uploadFileMutation = useUploadFile();

  const user = useAppSelector((state) => state.auth.user);
  const personalInfo = useAppSelector((state) => state.onboarding.personalInfo);
  const assessorPersonalInfo = useAppSelector(
    (state) => state.onboarding.assessorPersonalInfo,
  );
  const centrePersonalInfo = useAppSelector(
    (state) => state.onboarding.centrePersonalInfo,
  );
  const savedRPLIdentity = useAppSelector((s) => s.onboarding.rplIdentity);
  const savedCentreIdentity = useAppSelector((s) => s.onboarding.centreIdentity);
  const savedAssessorIdentity = useAppSelector((s) => s.onboarding.assessorIdentity);

  const { data: candidateProfile } = useCandidateProfile(true);

  const isVerified = Boolean(
    user?.isVerified ||
    candidateProfile?.identityVerified ||
    savedRPLIdentity?.isVerified ||
    savedCentreIdentity?.isVerified ||
    savedAssessorIdentity?.isVerified ||
    user?.status === "active"
  );

  React.useEffect(() => {
    if (isVerified && !user?.isVerified) {
      dispatch(markVerified());
    }
  }, [isVerified, user?.isVerified, dispatch]);

  const verificationStatus: VerificationStatus = isVerified
    ? "verified"
    : "not_verified";

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const uploadedAvatar =
    personalInfo?.passportUrl ||
    personalInfo?.passportPreview ||
    (assessorPersonalInfo as any)?.passportUrl ||
    (assessorPersonalInfo as any)?.passportPreview ||
    (centrePersonalInfo as any)?.passportUrl ||
    (centrePersonalInfo as any)?.passportPreview ||
    (savedAssessorIdentity as any)?.passportUrl ||
    user?.avatar ||
    user?.avatarUrl ||
    user?.passportUrl;

  const [avatarSrc, setAvatarSrc] = useState<any>(
    uploadedAvatar || ASSETS_URL.userAvatar,
  );

  React.useEffect(() => {
    if (uploadedAvatar) {
      setAvatarSrc(uploadedAvatar);
    }
  }, [uploadedAvatar]);

  const nameParts = (user?.fullName || "").trim().split(/\s+/).filter(Boolean);
  const realFirstName =
    personalInfo.firstName ||
    centrePersonalInfo.firstName ||
    (nameParts.length > 0 ? nameParts[0] : "");
  const realLastName =
    personalInfo.lastName ||
    centrePersonalInfo.lastName ||
    (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
  const realMiddleName =
    personalInfo.middleName ||
    centrePersonalInfo.middleName ||
    (nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "");

  const realEmail =
    user?.email || personalInfo.email || centrePersonalInfo.email || "";
  const realPhone =
    user?.phoneNumber ||
    personalInfo.phoneNumber ||
    centrePersonalInfo.phoneNumber ||
    "";
  const realDob = personalInfo.dob || centrePersonalInfo.dob || "";
  const realGender = personalInfo.gender || centrePersonalInfo.gender || "";
  const realNationality =
    personalInfo.nationality || centrePersonalInfo.nationality || "";
  const realCountry =
    personalInfo.country || centrePersonalInfo.country || "Nigeria";
  const realState = personalInfo.state || centrePersonalInfo.state || "";
  const realLga = personalInfo.lga || centrePersonalInfo.lga || "";
  const realAddress =
    personalInfo.streetAddress || centrePersonalInfo.streetAddress || "";
  const realImpairment = personalInfo.impairment || "";

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: realFirstName,
    lastName: realLastName,
    middleName: realMiddleName,
    dateOfBirth: realDob,
    gender: realGender,
    nationality: realNationality,
    email: realEmail,
    phone: realPhone,
    country: realCountry,
    stateOfResidence: realState,
    lga: realLga,
    residentialAddress: realAddress,
    impairment: realImpairment,
    emailNotifications: true,
    sessionReminders: false,
  });

  React.useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      firstName: prev.firstName || realFirstName,
      lastName: prev.lastName || realLastName,
      middleName: prev.middleName || realMiddleName,
      dateOfBirth: prev.dateOfBirth || realDob,
      gender: prev.gender || realGender,
      nationality: prev.nationality || realNationality,
      email: realEmail || prev.email,
      phone: prev.phone || realPhone,
      country: prev.country || realCountry,
      stateOfResidence: prev.stateOfResidence || realState,
      lga: prev.lga || realLga,
      residentialAddress: prev.residentialAddress || realAddress,
      impairment: prev.impairment || realImpairment,
    }));
  }, [
    realFirstName,
    realLastName,
    realMiddleName,
    realDob,
    realGender,
    realNationality,
    realEmail,
    realPhone,
    realCountry,
    realState,
    realLga,
    realAddress,
    realImpairment,
  ]);

  const [securityForm, setSecurityForm] = useState<SecurityFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (field: keyof ProfileFormData, value: any) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (
    field: keyof SecurityFormData,
    value: string,
  ) => {
    setSecurityForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    setAvatarSrc(localUrl);
    dispatch(
      setPersonalInfo({
        passportUrl: localUrl,
        passportPreview: localUrl,
        passportFileName: file.name,
      }),
    );
    dispatch(updateUser({ avatar: localUrl, passportUrl: localUrl }));

    try {
      const asset = await uploadFileMutation.mutateAsync({
        file,
        purpose: "passport",
      });
      if (asset?.url) {
        setAvatarSrc(asset.url);
        dispatch(
          setPersonalInfo({
            passportUrl: asset.url,
            passportAssetId: asset.assetId,
            passportPreview: asset.url,
          }),
        );
        dispatch(updateUser({ avatar: asset.url, passportUrl: asset.url }));
      }
    } catch {
      // Local preview remains
    }

    toast({
      type: "success",
      title: "Profile Picture Updated",
      description: "Your new profile picture has been applied.",
    });
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    dispatch(
      setPersonalInfo({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        middleName: profileForm.middleName,
        dob: formatToIsoDate(profileForm.dateOfBirth),
        gender: profileForm.gender,
        nationality: profileForm.nationality,
        email: profileForm.email,
        phoneNumber: profileForm.phone,
        country: profileForm.country,
        state: profileForm.stateOfResidence,
        lga: profileForm.lga,
        streetAddress: profileForm.residentialAddress,
        impairment: profileForm.impairment,
      }),
    );
    setTimeout(() => {
      setIsSaving(false);
      toast({
        type: "success",
        title: "Settings Saved",
        description: "Your profile information has been saved successfully!",
      });
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col min-h-screen"
    >
      <HeaderBanner
        title="Settings"
        userName={realFirstName || user?.email?.split("@")[0] || "User"}
      />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
        {/* Left Sidebar Card */}
        <SettingsSidebar
          userAvatarSrc={avatarSrc}
          verificationStatus={verificationStatus}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
          onAvatarChange={handleAvatarChange}
        />

        {/* Right Active Tab Content Area */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === "profile" ? (
            <ProfileInfoTab
              formData={profileForm}
              onChange={handleProfileChange}
              onSave={handleSaveProfile}
              isSaving={isSaving}
            />
          ) : (
            <SecurityTab
              status={verificationStatus}
              onVerifyNow={() =>
                router.push("/dashboard/settings/nin-verification")
              }
              securityFormData={securityForm}
              onChangeSecurityForm={handleSecurityChange}
              onPasswordChangeSuccess={() => setIsSuccessModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={(password) => {
          setIsDeleteModalOpen(false);
          setIsConfirmDeleteOpen(true);
        }}
      />

      <StatusModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        type="error"
        title="Confirm Account Deletion"
        description="Are you sure you want to permanently delete your account? All your applications, certificates, and data will be permanently removed. This action cannot be undone."
        actionLabel="Yes, Delete My Account"
        onAction={() => {
          setIsConfirmDeleteOpen(false);
          toast({
            type: "error",
            title: "Account Deleted",
            description: "Your account has been permanently deleted.",
          });
          router.push("/signin");
        }}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
      </div>
    </motion.div>
  );
};
