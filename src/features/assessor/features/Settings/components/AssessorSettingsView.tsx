"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiEye,
  FiSave,
  FiUpload,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { DatePicker } from "@/src/components/ui/date-picker";
import { Button } from "@/src/components/ui/button";
import { Avatar } from "@/src/components/ui/avatar";
import { useToast } from "@/src/components/ui/toast";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { ASSETS_URL } from "@/assets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  useGetAssessorProfileSectors,
  useUpdateAssessorProfileSectors,
  useGetAssessorProfile,
  usePatchAssessorProfile,
} from "@/src/features/shared/assessor/hooks";
import {
  useGetMeProfile,
  usePatchMeProfile,
} from "@/src/features/shared/account/hooks";
import { useAssessorOnboarding } from "@/src/features/assessor/features/Onboarding/hooks/useOnboarding";
import { useCountryStateCity } from "@/src/lib/hooks/useCountryStateCity";
import { formatToIsoDate } from "@/src/lib/validation";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { updateUser } from "@/src/store/slices/authSlice";
import { setAssessorPersonalInfo } from "@/src/store/slices/onboardingSlice";
import { CameraCaptureModal } from "@/src/components/ui/camera-capture-modal";
import { FiCamera } from "react-icons/fi";
import { QUALIFICATION_OPTIONS } from "@/src/features/assessor/features/Onboarding/pages/AssessorInformation";
import {
  CertificatePreviewModal,
  CertificatePreviewData,
} from "@/src/features/shared/settings/components/CertificatePreviewModal";

export type AssessorSettingsSubTab =
  | "profile"
  | "assessor"
  | "security"
  | "delete";

export const AssessorSettingsView: React.FC = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getOnboarding } = useAssessorOnboarding();
  const { data: meProfile } = useGetMeProfile();
  const patchMeProfileMutation = usePatchMeProfile();
  const { data: assessorProfile } = useGetAssessorProfile();
  const patchAssessorProfileMutation = usePatchAssessorProfile();
  const uploadFileMutation = useUploadFile();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewCertificate, setPreviewCertificate] =
    useState<CertificatePreviewData | null>(null);

  const authUser = useAppSelector((state) => state.auth.user);
  const assessorPersonalInfo = useAppSelector(
    (s) => s.onboarding.assessorPersonalInfo,
  );
  const personalInfo = useAppSelector(
    (s) => s.onboarding.personalInfo,
  );
  const savedAssessorDetails = useAppSelector(
    (s) => s.onboarding.assessorDetails,
  );

  const uploadedAvatar =
    meProfile?.photo?.url ||
    (meProfile as any)?.photoUrl ||
    (meProfile as any)?.avatar ||
    (assessorPersonalInfo as any)?.passportUrl ||
    (assessorPersonalInfo as any)?.passportPreview ||
    personalInfo?.passportUrl ||
    personalInfo?.passportPreview ||
    authUser?.avatar ||
    authUser?.avatarUrl ||
    authUser?.passportUrl;

  const [activeSubTab, setActiveSubTab] =
    useState<AssessorSettingsSubTab>("profile");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    uploadedAvatar || null,
  );

  React.useEffect(() => {
    if (uploadedAvatar) {
      setProfileImagePreview(uploadedAvatar);
    }
  }, [uploadedAvatar]);
  const [isVerified, setIsVerified] = useState(true);

  // Profile Information State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [stateOfResidence, setStateOfResidence] = useState("");
  const [lga, setLga] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  const { countries, states, cities } = useCountryStateCity(country, stateOfResidence);

  const [availabilityToggle, setAvailabilityToggle] = useState(true);
  const [emailNotificationsToggle, setEmailNotificationsToggle] = useState(true);
  const [remindersToggle, setRemindersToggle] = useState(false);

  const { data: sectorsData } = useGetAssessorProfileSectors();
  const updateSectorsMutation = useUpdateAssessorProfileSectors();
  const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>([]);

  const [assessorId, setAssessorId] = useState("");
  const [qualification, setQualification] = useState("");

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordSuccessOpen, setIsPasswordSuccessOpen] = useState(false);

  // ── Hydrate from API ───────────────────────────────────────────────────────
  React.useEffect(() => {
    // 1. Hydrate from /me/profile
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
        setEmailAddress(meProfile.contactInformation.emailAddress);
      if (meProfile.contactInformation?.phoneNumber?.number)
        setPhoneNumber(meProfile.contactInformation.phoneNumber.number);

      if (meProfile.residentialAddress?.country)
        setCountry(meProfile.residentialAddress.country);
      if (meProfile.residentialAddress?.state)
        setStateOfResidence(meProfile.residentialAddress.state);
      if (meProfile.residentialAddress?.lga)
        setLga(meProfile.residentialAddress.lga);
      if (meProfile.residentialAddress?.address)
        setStreetAddress(meProfile.residentialAddress.address);
    }

    // 2. Hydrate from /assessor/profile
    if (assessorProfile) {
      if (assessorProfile.assessorNo) setAssessorId(assessorProfile.assessorNo);
      if (assessorProfile.sectors?.length) {
        setSelectedSectorIds(assessorProfile.sectors.map((s) => s.id));
      }
      if (assessorProfile.qualifications?.length) {
        setQualification(assessorProfile.qualifications[0]);
      } else if (assessorProfile.certificates?.length) {
        const firstCert = assessorProfile.certificates[0].kind?.toUpperCase();
        if (firstCert && ["QAA", "IQM", "IV", "EV"].includes(firstCert)) {
          setQualification(firstCert);
        }
      }
    }

    // 3. Fallback to onboarding record if meProfile/assessorProfile still loading
    if (getOnboarding.data?.data) {
      const d = getOnboarding.data.data as any;

      const pd = d?.personalDetails;
      if (pd?.firstName && !firstName) setFirstName(pd.firstName);
      if (pd?.lastName && !lastName) setLastName(pd.lastName);
      if (pd?.middleName && !middleName) setMiddleName(pd.middleName);
      if (pd?.dob && !dob) setDob(pd.dob);
      if (pd?.gender && !gender) setGender(pd.gender);
      if (pd?.nationality && !nationality) setNationality(pd.nationality);

      const ci = d?.contactInformation;
      if (ci?.emailAddress && !emailAddress) setEmailAddress(ci.emailAddress);
      if (ci?.phoneNumber?.number && !phoneNumber) setPhoneNumber(ci.phoneNumber.number);

      const ra = d?.residentialAddress;
      if (ra?.country && !country) setCountry(ra.country);
      if (ra?.state && !stateOfResidence) setStateOfResidence(ra.state);
      if (ra?.lga && !lga) setLga(ra.lga);
      if (ra?.address && !streetAddress) setStreetAddress(ra.address);

      const ad = d?.assessorDetails;
      if (ad?.assessorNo && !assessorId) setAssessorId(ad.assessorNo);
      if (ad?.sectorIds?.length && selectedSectorIds.length === 0)
        setSelectedSectorIds(ad.sectorIds);
      if (ad?.qualification && !qualification) setQualification(ad.qualification);
      if (ad?.certifications?.qaa && !qualification) setQualification("QAA");
      else if (ad?.certifications?.iqm && !qualification) setQualification("IQM");
    }

    if (savedAssessorDetails?.qualification && !qualification) {
      setQualification(savedAssessorDetails.qualification);
    }
  }, [meProfile, assessorProfile, getOnboarding.data, savedAssessorDetails]);

  const processPicture = async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    setProfileImagePreview(localUrl);
    dispatch(updateUser({ avatar: localUrl, passportUrl: localUrl }));
    dispatch(
      setAssessorPersonalInfo({
        passportUrl: localUrl,
        passportPreview: localUrl,
        passportFileName: file.name,
      }),
    );

    try {
      const asset = await uploadFileMutation.mutateAsync({
        file,
        purpose: "passport",
      });
      if (asset?.url) {
        setProfileImagePreview(asset.url);
        dispatch(updateUser({ avatar: asset.url, passportUrl: asset.url }));
        dispatch(
          setAssessorPersonalInfo({
            passportUrl: asset.url,
            passportAssetId: asset.assetId,
            passportPreview: asset.url,
          }),
        );
        if (asset.assetId) {
          patchMeProfileMutation.mutate({
            photoAssetId: asset.assetId,
          });
        }
      }
    } catch {
      // Local preview remains
    }

    toast({
      type: "success",
      title: "Picture Updated",
      description: "Profile picture uploaded successfully.",
    });
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPicture(e.target.files[0]);
    }
  };

  const handleSaveProfile = () => {
    patchMeProfileMutation.mutate(
      {
        personalDetails: !isVerified
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
          emailAddress,
          phoneNumber: { countryCode: "+234", number: phoneNumber },
        },
        residentialAddress: {
          country,
          state: stateOfResidence,
          lga,
          address: streetAddress,
        },
      },
    );
  };

  const handleSaveAssessorDetails = () => {
    patchAssessorProfileMutation.mutate(
      {
        qualifications: qualification ? [qualification as any] : undefined,
        sectorIds: selectedSectorIds,
      },
      {
        onSuccess: () =>
          toast({
            type: "success",
            title: "Assessor Details Saved",
            description: "Your assessor information and sectors have been updated.",
          }),
        onError: (err: any) =>
          toast({
            type: "error",
            title: "Save Failed",
            description:
              err?.message || "Could not save assessor details. Please try again.",
          }),
      },
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        type: "error",
        title: "Fields Required",
        description: "Please fill in all password fields.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        type: "error",
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
      });
      return;
    }
    setIsPasswordSuccessOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          setIsCameraOpen(false);
          processPicture(file);
        }}
      />
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar matching Images 1-5 */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6 w-full">
          <div className="flex items-center gap-3.5">
            <Avatar
              src={profileImagePreview}
              name={[firstName, lastName].filter(Boolean).join(" ") || authUser?.fullName || "Assessor"}
              shape="rounded"
              className="w-24 h-24 border border-gray-200 shadow-xs shrink-0"
              alt="User Avatar"
            />

            <div className="flex flex-col items-start justify-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#a31d38] font-sans hover:bg-[#83172e] text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FiUpload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="bg-primary/10 hover:bg-primary/20 text-[#a31d38] p-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Take photo with camera"
                  aria-label="Take photo with camera"
                >
                  <FiCamera className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] font-sans text-gray-400 mt-1 font-medium">
                Upload or Snap
              </span>

              {isVerified ? (
                <div className="flex items-center gap-1 text-[11px] mt-2 font-bold text-[#1E7F4C]">
                  <FiCheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] mt-2 font-bold text-red-600">
                  <FiAlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Not Verified</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSubTab("profile")}
              className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                activeSubTab === "profile"
                  ? "bg-rose-50 text-rose-900 font-extrabold shadow-2xs"
                  : "text-gray-700 font-medium hover:bg-gray-50"
              }`}
            >
              Profile Information
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("assessor")}
              className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                activeSubTab === "assessor"
                  ? "bg-rose-50 text-rose-900 font-extrabold shadow-2xs"
                  : "text-gray-700 font-medium hover:bg-gray-50"
              }`}
            >
              Assessor Information
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("security")}
              className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                activeSubTab === "security"
                  ? "bg-rose-50 text-rose-900 font-extrabold shadow-2xs"
                  : "text-gray-700 font-medium hover:bg-gray-50"
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
                    label="First Name"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Middle Name"
                    placeholder="Middle name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                  <DatePicker
                    label="Date Of Birth"
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
                    options={["Nigerian", "Other"]}
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
                    placeholder="Email Address"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />

                  <PhoneInput
                    label="Phone Number"
                    value={phoneNumber}
                    country={country || "ng"}
                    onChange={(val) => setPhoneNumber(val)}
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
                    placeholder="Select"
                    options={countries}
                    value={country}
                    onChange={(e) => { setCountry(e.target.value); setStateOfResidence(""); setLga(""); }}
                  />
                  <Select
                    label="State of Residence*"
                    placeholder="Select"
                    options={states}
                    value={stateOfResidence}
                    onChange={(e) => { setStateOfResidence(e.target.value); setLga(""); }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Local Government Area (LGA)*"
                    placeholder="Select"
                    options={cities}
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                  />
                  <Input
                    label="Street Address*"
                    placeholder="Street Address"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Availability
                </h3>

                <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-neutral-primary">
                      Set your availability
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Toggle on and off to show you&apos;re available or not.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAvailabilityToggle((prev) => !prev)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      availabilityToggle ? "bg-[#a31d38]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        availabilityToggle ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
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

                    <button
                      type="button"
                      onClick={() => setEmailNotificationsToggle((prev) => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                        emailNotificationsToggle ? "bg-[#a31d38]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          emailNotificationsToggle ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-neutral-primary">
                        Reminders
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        24h and 1h before
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRemindersToggle((prev) => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                        remindersToggle ? "bg-[#a31d38]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          remindersToggle ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={handleSaveProfile}
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

          {/* SubTab 2: Assessor Information (Image 1) */}
          {activeSubTab === "assessor" && (
            <div className="w-full flex flex-col gap-8">
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Assessor Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Assessor ID"
                    placeholder="Assessor ID"
                    value={assessorId}
                    onChange={(e) => setAssessorId(e.target.value)}
                  />
                  <Select
                    label="Qualification"
                    placeholder="Select Qualification"
                    options={QUALIFICATION_OPTIONS}
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                  />
                </div>

                {sectorsData && sectorsData.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                      Sectors of Experience
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sectorsData.map((sector: any) => (
                        <button
                          key={sector.id}
                          type="button"
                          onClick={() =>
                            setSelectedSectorIds((prev) =>
                              prev.includes(sector.id)
                                ? prev.filter((id) => id !== sector.id)
                                : [...prev, sector.id],
                            )
                          }
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            selectedSectorIds.includes(sector.id)
                              ? "bg-[#a31d38] text-white border-[#a31d38]"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {sector.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
                  Certificates &amp; Qualification
                </h3>

                <div className="flex flex-col gap-3">
                  {(() => {
                    const certKindLabels: Record<
                      string,
                      { title: string; subtitle: string }
                    > = {
                      qaa: {
                        title: "QAA Competency Assessor Certificate",
                        subtitle: "Quality Assurance Assessor · Completed",
                      },
                      iqm: {
                        title: "IQM Certificate",
                        subtitle: "Internal Quality Manager · Completed",
                      },
                      iv: {
                        title: "IV Certificate",
                        subtitle: "Internal Verifier · Completed",
                      },
                      ev: {
                        title: "EV Certificate",
                        subtitle: "External Verifier · Completed",
                      },
                    };

                    const certificatesList = assessorProfile?.certificates?.length
                      ? assessorProfile.certificates
                      : [
                          ...(savedAssessorDetails?.qaaCertificateAssetId
                            ? [
                                {
                                  kind: "qaa",
                                  assetId: savedAssessorDetails.qaaCertificateAssetId,
                                  name:
                                    savedAssessorDetails.qaaCertificateName ||
                                    "QAA Certificate",
                                  url: "",
                                },
                              ]
                            : []),
                          ...(savedAssessorDetails?.iqmCertificateAssetId
                            ? [
                                {
                                  kind: "iqm",
                                  assetId: savedAssessorDetails.iqmCertificateAssetId,
                                  name:
                                    savedAssessorDetails.iqmCertificateName ||
                                    "IQM Certificate",
                                  url: "",
                                },
                              ]
                            : []),
                        ];

                    if (certificatesList.length === 0) {
                      return (
                        <div className="text-xs text-gray-400 font-medium p-4 text-center bg-[#F8F9FA] rounded-2xl border border-gray-100">
                          No uploaded certificates found.
                        </div>
                      );
                    }

                    return certificatesList.map((cert: any, idx: number) => {
                      const kindKey = (cert.kind || "").toLowerCase();
                      const meta = certKindLabels[kindKey] || {
                        title:
                          cert.name ||
                          `${cert.kind?.toUpperCase() || "Assessor"} Certificate`,
                        subtitle: "Uploaded Certificate · Verified",
                      };
                      return (
                        <div
                          key={cert.assetId || idx}
                          className="bg-[#F8F9FA] p-4.5 rounded-2xl border border-gray-100 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 font-bold text-xs">
                              <FiFileText className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-extrabold text-sm text-neutral-primary">
                                {meta.title}
                              </span>
                              <span className="text-xs text-gray-400 font-medium">
                                {meta.subtitle}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setPreviewCertificate({
                                title: meta.title,
                                subtitle: meta.subtitle,
                                url: cert.url || undefined,
                                assetId: cert.assetId || undefined,
                              })
                            }
                            className="w-9 h-9 rounded-xl bg-gray-200/70 hover:bg-[#FCE8EC] text-gray-600 hover:text-[#a31d38] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                            title="Preview Certificate"
                            aria-label="Preview Certificate"
                          >
                            <FiEye className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  leftIcon={<FiUpload className="w-4 h-4" />}
                  onClick={() =>
                    toast({
                      type: "info",
                      title: "Upload Certificate",
                      description: "Select a certificate file to upload.",
                    })
                  }
                  className="border-[#FBAB2A] text-[#FBAB2A] font-bold text-sm h-11 px-6 rounded-xl hover:bg-amber-50 cursor-pointer"
                >
                  Upload Certificate
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveAssessorDetails}
                  loading={updateSectorsMutation.isPending}
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

          {/* SubTab 3: Security (Images 2, 3, 4) */}
          {activeSubTab === "security" && (
            <div className="w-full flex flex-col gap-8">
              {/* Verification Status */}
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
                  Verification Status
                </h3>

                {isVerified ? (
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
                ) : (
                  <div className="bg-rose-50/80 p-4.5 rounded-2xl border border-rose-100 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-rose-800">
                        NIN Verification
                      </span>
                      <span className="text-xs text-rose-600 font-medium">
                        Not Verified
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVerified(true)}
                      className="border-rose-200 text-rose-700 font-bold text-xs bg-white hover:bg-rose-100 h-9 px-4 rounded-xl cursor-pointer"
                    >
                      Verify Now
                    </Button>
                  </div>
                )}
              </div>

              {/* Change Password */}
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4 lg:gap-6">
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
                        placeholder="••••••••••"
                        className="w-full bg-[#F8F9FA] border border-transparent focus:border-primary rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-primary outline-none font-medium"
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
                        placeholder="••••••••••"
                        className="w-full bg-[#F8F9FA] border border-transparent focus:border-primary rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-primary outline-none font-medium"
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
                        placeholder="••••••••••"
                        className="w-full bg-[#F8F9FA] border border-transparent focus:border-primary rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-primary outline-none font-medium"
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

                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    variant="amber"
                    size="md"
                    rightIcon={<FiSave className="w-4 h-4" />}
                    className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Password Changed Success Modal matching Image 4 */}
      {isPasswordSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center gap-4 shadow-2xl select-text"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg my-1">
              <FiCheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary">
              Congratulations
            </h3>
            <p className="text-xs sm:text-sm text-neutral-secondary">
              Your Password has been changed successfully
            </p>

            <Button
              variant="amber"
              size="md"
              onClick={() => setIsPasswordSuccessOpen(false)}
              className="w-full h-11 text-white font-bold text-sm rounded-xl shadow-lg mt-2 cursor-pointer"
            >
              Go To Dashboard
            </Button>
          </motion.div>
        </div>
      )}

      {/* In-App Certificate Preview Modal */}
      <CertificatePreviewModal
        isOpen={Boolean(previewCertificate)}
        data={previewCertificate}
        onClose={() => setPreviewCertificate(null)}
      />
    </div>
  );
};
