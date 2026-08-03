"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiSave,
  FiCalendar,
  FiShield,
} from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { ASSETS_URL } from "@/assets";

export type SettingsSubTab =
  | "profile"
  | "centre"
  | "pricing"
  | "security"
  | "delete";

export const SettingsView: React.FC = () => {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("centre");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCountry, setProfileCountry] = useState("");
  const [profileState, setProfileState] = useState("");
  const [profileLga, setProfileLga] = useState("");
  const [profileStreet, setProfileStreet] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(false);

  // Centre Form States
  const [centreName, setCentreName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [centreCountry, setCentreCountry] = useState("");
  const [centreState, setCentreState] = useState("");
  const [centreLga, setCentreLga] = useState("");
  const [centreStreet, setCentreStreet] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  // Pricing Form States
  const [rplCurrency, setRplCurrency] = useState("");
  const [rplAmount, setRplAmount] = useState("45000");
  const [standardCurrency, setStandardCurrency] = useState("");
  const [standardAmount, setStandardAmount] = useState("65000");

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveSettings = () => {
    toast({
      type: "success",
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Header Banner */}
      <div className="w-full bg-[#a31d38] text-white rounded-3xl p-6 sm:p-8 xl:p-10 flex items-center justify-between gap-4 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Settings
        </h1>
      </div>

      {/* Main Settings Grid Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation Card */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl p-6 shadow-2xs border border-gray-100/80 flex flex-col gap-6 w-full">
          {/* Logo Container Box */}
          <div className="flex items-center gap-3 bg-[#F8F9FA] p-3.5 rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-xl bg-[#80152B] p-2 flex items-center justify-center shrink-0 border border-white/20">
              <span className="text-white font-extrabold text-[10px] text-center leading-tight tracking-tighter uppercase">
                C-STEMP
                <br />
                <span className="text-[7px] font-medium opacity-80">
                  BUILDING PEOPLE
                </span>
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <button
                type="button"
                className="bg-[#a31d38] hover:bg-[#85162d] text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer w-fit"
              >
                Change logo
              </button>
              <span className="text-[10px] text-gray-400 font-medium">
                JPG or PNG 10mb
              </span>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit mt-0.5">
                <FiCheckCircle className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation Items */}
          <div className="flex flex-col gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSubTab("profile")}
              className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                activeSubTab === "profile"
                  ? "bg-[#FDF2F4] text-neutral-primary font-extrabold shadow-2xs"
                  : "text-neutral-secondary hover:text-neutral-primary hover:bg-gray-50"
              }`}
            >
              Profile Information
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("centre")}
              className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                activeSubTab === "centre"
                  ? "bg-[#FDF2F4] text-neutral-primary font-extrabold shadow-2xs"
                  : "text-neutral-secondary hover:text-neutral-primary hover:bg-gray-50"
              }`}
            >
              Centre Information
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
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
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
                    options={["Nigerian", "Other"]}
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    placeholder="Select"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Select"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Residential Address */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
                  Residential Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Country*"
                    placeholder="Select"
                    options={["Nigeria"]}
                    value={profileCountry}
                    onChange={(e) => setProfileCountry(e.target.value)}
                  />
                  <Select
                    label="State of Residence*"
                    placeholder="Select"
                    options={["Lagos", "Abuja", "Rivers"]}
                    value={profileState}
                    onChange={(e) => setProfileState(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Local Government Area (LGA)*"
                    placeholder="Select"
                    options={["Ikeja", "Surulere", "Eti-Osa"]}
                    value={profileLga}
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
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
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
                  onClick={handleSaveSettings}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSave className="w-4 h-4" />}
                  className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
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
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
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
                    placeholder="Select"
                    options={["Nigeria"]}
                    value={centreCountry}
                    onChange={(e) => setCentreCountry(e.target.value)}
                  />
                  <Select
                    label="State of Residence*"
                    placeholder="Select"
                    options={["Lagos", "Abuja", "Rivers"]}
                    value={centreState}
                    onChange={(e) => setCentreState(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Local Government Area (LGA)*"
                    placeholder="Select"
                    options={["Ikeja", "Surulere", "Eti-Osa"]}
                    value={centreLga}
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
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
                  Center Support Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Support Email Address*"
                    placeholder="Email Address"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                      Phone Number*
                    </label>
                    <div className="flex items-center gap-2">
                      <select className="w-20 bg-input-bg border border-transparent rounded-xl px-2.5 py-2.5 text-xs font-bold text-neutral-primary outline-none cursor-pointer">
                        <option value="NGN">NGN</option>
                        <option value="USD">USD</option>
                      </select>
                      <input
                        type="text"
                        placeholder="000000000"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        className="flex-1 bg-input-bg border border-transparent focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-neutral-primary outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
                  Account Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Bank*"
                    placeholder="Select"
                    options={[
                      "GTBank",
                      "Access Bank",
                      "Zenith Bank",
                      "First Bank",
                    ]}
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                  />
                  <Input
                    label="Account Number*"
                    placeholder="000000000"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>

                <Input
                  label="Name On Account*"
                  placeholder="Type Here"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={handleSaveSettings}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSave className="w-4 h-4" />}
                  className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
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
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-extrabold text-neutral-primary tracking-tight">
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                      Amount
                    </label>
                    <input
                      type="number"
                      placeholder="00"
                      value={rplAmount}
                      onChange={(e) => setRplAmount(e.target.value)}
                      className="w-full bg-input-bg border border-transparent focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-neutral-primary outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Standard Skill Assessment */}
              <div className="flex flex-col gap-4">
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
                      Amount
                    </label>
                    <input
                      type="number"
                      placeholder="00"
                      value={standardAmount}
                      onChange={(e) => setStandardAmount(e.target.value)}
                      className="w-full bg-input-bg border border-transparent focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-neutral-primary outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={handleSaveSettings}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSave className="w-4 h-4" />}
                  className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
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
              <div className="flex flex-col gap-4">
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
              <div className="flex flex-col gap-4">
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
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
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
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
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
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
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
                      description: "Your password has been changed successfully.",
                    });
                  }}
                  variant="amber"
                  size="md"
                  rightIcon={<FiSave className="w-4 h-4" />}
                  className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Change Password
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
