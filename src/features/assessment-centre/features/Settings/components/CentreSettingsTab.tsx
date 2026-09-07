"use client";

import React from "react";
import { FiSave } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select, SelectOption } from "@/src/components/ui/select";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { Button } from "@/src/components/ui/button";

interface CentreSettingsTabProps {
  centreName: string;
  setCentreName: (val: string) => void;
  regNo: string;
  setRegNo: (val: string) => void;
  centreCountry: string;
  setCentreCountry: (val: string) => void;
  centreState: string;
  setCentreState: (val: string) => void;
  centreLga: string;
  setCentreLga: (val: string) => void;
  centreStreet: string;
  setCentreStreet: (val: string) => void;
  supportEmail: string;
  setSupportEmail: (val: string) => void;
  supportPhone: string;
  setSupportPhone: (val: string) => void;
  bank: string;
  setBank: (val: string) => void;
  accountNumber: string;
  setAccountNumber: (val: string) => void;
  accountName: string;
  setAccountName: (val: string) => void;
  isResolvingAccount: boolean;
  accountResolveSuccess: boolean;
  bankOptions: (string | SelectOption)[];
  countries: (string | SelectOption)[];
  centreStates: (string | SelectOption)[];
  centreCities: (string | SelectOption)[];
  handleSaveCentreSettings: () => void;
  isSavingCentre: boolean;
}

export const CentreSettingsTab: React.FC<CentreSettingsTabProps> = ({
  centreName, setCentreName, regNo, setRegNo,
  centreCountry, setCentreCountry, centreState, setCentreState,
  centreLga, setCentreLga, centreStreet, setCentreStreet,
  supportEmail, setSupportEmail, supportPhone, setSupportPhone,
  bank, setBank, accountNumber, setAccountNumber, accountName, setAccountName,
  isResolvingAccount, accountResolveSuccess, bankOptions,
  countries, centreStates, centreCities,
  handleSaveCentreSettings, isSavingCentre,
}) => {
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Centre Information */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
          Centre Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Name Of Assessment Center*" placeholder="Type Here" value={centreName} onChange={(e) => setCentreName(e.target.value)} />
          <Input label="Registration No*" placeholder="Type Here" value={regNo} onChange={(e) => setRegNo(e.target.value)} />
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
            placeholder={centreCountry ? "Select state" : "Select country first"}
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
            placeholder={centreState ? "Select city" : "Select state first"}
            options={centreCities}
            value={centreLga}
            disabled={!centreState}
            onChange={(e) => setCentreLga(e.target.value)}
          />
          <Input label="Street Address*" placeholder="Street Address" value={centreStreet} onChange={(e) => setCentreStreet(e.target.value)} />
        </div>
      </div>

      {/* Center Support Information */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
          Center Support Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Support Email Address*" placeholder="Email Address" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          <PhoneInput
            label={<span>Phone Number<span className="text-primary-solid ml-0.5">*</span></span>}
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
          <Select label="Bank*" placeholder="Select Bank" options={bankOptions} value={bank} onChange={(e) => setBank(e.target.value)} />
          <Input
            label="Account Number*"
            placeholder="0000000000"
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Input
            label="Name On Account*"
            placeholder={isResolvingAccount ? "Resolving account name..." : "Type Here"}
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          {isResolvingAccount && (
            <span className="text-xs text-amber-700 font-medium animate-pulse">Resolving account name from bank...</span>
          )}
          {accountResolveSuccess && !isResolvingAccount && accountName && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">✓ Verified account name</span>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <Button
          type="button"
          onClick={handleSaveCentreSettings}
          loading={isSavingCentre}
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
