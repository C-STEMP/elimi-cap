"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/dashboard/components/HeaderBanner";
import { ASSETS_URL } from "@/assets";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/components/ui/toast";
import {
  SettingsTab,
  VerificationStatus,
  ProfileFormData,
  SecurityFormData,
} from "../types/settings.types";
import { SettingsSidebar } from "../components/SettingsSidebar";
import { ProfileInfoTab } from "../components/ProfileInfoTab";
import { SecurityTab } from "../components/SecurityTab";
import { StatusModal } from "@/components/ui/status-modal";
import { DeleteAccountModal } from "../components/DeleteAccountModal";
import { SuccessModal } from "../components/SuccessModal";

export const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const firstName = user?.fullName?.split(" ")[0] || "Chidi";
  const lastName = user?.fullName?.split(" ")[1] || "Umeh";

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("verified");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [avatarSrc, setAvatarSrc] = useState<any>(ASSETS_URL.userAvatar);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: firstName,
    lastName: lastName,
    middleName: "Isaac",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    email: user?.email || "chidi.umeh@example.com",
    phone: user?.phoneNumber || "",
    country: "Nigeria",
    stateOfResidence: "",
    lga: "",
    residentialAddress: "",
    impairment: "",
    emailNotifications: true,
    sessionReminders: false,
  });

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

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
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
      className="w-full flex flex-col gap-4"
    >
      <HeaderBanner title="Settings" userName={firstName} />

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
    </motion.div>
  );
};
