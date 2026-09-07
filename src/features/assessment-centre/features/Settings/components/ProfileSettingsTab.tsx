"use client";

import React from "react";
import { FiSave } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select, SelectOption } from "@/src/components/ui/select";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { DatePicker } from "@/src/components/ui/date-picker";
import { Button } from "@/src/components/ui/button";

interface ProfileSettingsTabProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  middleName: string;
  setMiddleName: (val: string) => void;
  dob: string;
  setDob: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  nationality: string;
  setNationality: (val: string) => void;
  profileEmail: string;
  setProfileEmail: (val: string) => void;
  profilePhone: string;
  setProfilePhone: (val: string) => void;
  profileCountry: string;
  setProfileCountry: (val: string) => void;
  profileState: string;
  setProfileState: (val: string) => void;
  profileLga: string;
  setProfileLga: (val: string) => void;
  profileStreet: string;
  setProfileStreet: (val: string) => void;
  emailNotifications: boolean;
  setEmailNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  sessionReminders: boolean;
  setSessionReminders: React.Dispatch<React.SetStateAction<boolean>>;
  countries: (string | SelectOption)[];
  profileStates: (string | SelectOption)[];
  profileCities: (string | SelectOption)[];
  handleSaveProfileSettings: () => void;
  isSavingProfile: boolean;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  firstName, setFirstName, lastName, setLastName, middleName, setMiddleName,
  dob, setDob, gender, setGender, nationality, setNationality,
  profileEmail, setProfileEmail, profilePhone, setProfilePhone,
  profileCountry, setProfileCountry, profileState, setProfileState,
  profileLga, setProfileLga, profileStreet, setProfileStreet,
  emailNotifications, setEmailNotifications, sessionReminders, setSessionReminders,
  countries, profileStates, profileCities,
  handleSaveProfileSettings, isSavingProfile,
}) => {
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Personal Details */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
          Personal Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name*" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Last Name*" placeholder="Surname" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Middle Name" placeholder="Other names" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
          <DatePicker label="Date Of Birth*" placeholder="dd/mm/yyyy" value={dob} onChange={(val) => setDob(val)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Gender*" placeholder="Select" options={["Male", "Female", "Other"]} value={gender} onChange={(e) => setGender(e.target.value)} />
          <Select label="Nationality*" placeholder="Select" options={countries} value={nationality} onChange={(e) => setNationality(e.target.value)} />
        </div>
      </div>

      {/* Contact Information */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email Address" placeholder="Select" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
          <PhoneInput label="Phone Number" value={profilePhone} country={profileCountry || "ng"} onChange={(val) => setProfilePhone(val)} />
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
            placeholder={profileCountry ? "Select state" : "Select country first"}
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
            placeholder={profileState ? "Select city" : "Select state first"}
            options={profileCities}
            value={profileLga}
            disabled={!profileState}
            onChange={(e) => setProfileLga(e.target.value)}
          />
          <Input label="Street Address*" placeholder="Street Address" value={profileStreet} onChange={(e) => setProfileStreet(e.target.value)} />
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
              <span className="font-bold text-sm text-neutral-primary">Email Notifications</span>
              <span className="text-xs text-gray-400 font-medium">Receive notification via email</span>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications((prev) => !prev)}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${emailNotifications ? "bg-[#a31d38]" : "bg-gray-300"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailNotifications ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-bold text-sm text-neutral-primary">Session Reminders</span>
              <span className="text-xs text-gray-400 font-medium">24h and 1h before sessions</span>
            </div>
            <button
              type="button"
              onClick={() => setSessionReminders((prev) => !prev)}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${sessionReminders ? "bg-[#a31d38]" : "bg-gray-300"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${sessionReminders ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <Button
          type="button"
          onClick={handleSaveProfileSettings}
          loading={isSavingProfile}
          variant="amber"
          size="md"
          rightIcon={<FiSave className="w-4 h-4" />}
          className="px-8 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
        >
          Save
        </Button>
      </div>
    </div>
  );
};
