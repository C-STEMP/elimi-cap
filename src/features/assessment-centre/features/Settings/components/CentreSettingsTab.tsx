"use client";

import React from "react";
import { FiSave, FiCheck, FiUploadCloud, FiFileText, FiExternalLink } from "react-icons/fi";
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
  availableTrades?: { id: string; name: string; slug?: string }[];
  selectedTradeIds?: string[];
  setSelectedTradeIds?: React.Dispatch<React.SetStateAction<string[]>>;
  certificateAssetId?: string | null;
  certificateUrl?: string | null;
  certificateName?: string;
  isUploadingCertificate?: boolean;
  handleCertificateUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  availableTrades = [],
  selectedTradeIds = [],
  setSelectedTradeIds,
  certificateAssetId,
  certificateUrl,
  certificateName,
  isUploadingCertificate = false,
  handleCertificateUpload,
  handleSaveCentreSettings, isSavingCentre,
}) => {
  const toggleTrade = (tradeId: string) => {
    if (!setSelectedTradeIds) return;
    setSelectedTradeIds((prev) =>
      prev.includes(tradeId)
        ? prev.filter((id) => id !== tradeId)
        : [...prev, tradeId],
    );
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Centre Information */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
          Centre Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Name Of Assessment Center*" placeholder="Type Here" value={centreName} onChange={(e) => setCentreName(e.target.value)} />
          <Input label="Centre Code*" placeholder="Type Here" value={regNo} onChange={(e) => setRegNo(e.target.value)} />
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
          <Input label="Address*" placeholder="Address" value={centreStreet} onChange={(e) => setCentreStreet(e.target.value)} />
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

      {/* Trades Offered & Accreditation Certificate */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <h3 className="text-xl lg:text-2xl font-extrabold text-neutral-primary tracking-tight">
          Trades Offered & Accreditation
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
            Trades Offered (Optional)
          </label>
          <p className="text-xs text-gray-500">
            Select the trades your centre is accredited to assess so candidates and organisations can filter by trade.
          </p>
          {availableTrades.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto p-3 rounded-xl border border-gray-200 bg-[#f8f9fa]">
              {availableTrades.map((trade) => {
                const isSelected = selectedTradeIds.includes(trade.id);
                return (
                  <button
                    key={trade.id}
                    type="button"
                    onClick={() => toggleTrade(trade.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#fdf2f5] text-[#a31d38] border-[#a31d38]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {isSelected && <FiCheck className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>{trade.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Loading trades...</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-text-dark font-medium text-xs leading-[1.4] select-none">
            Accreditation Certificate (Optional)
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="border-2 border-dashed border-[#a31d38]/30 bg-[#fdf2f5] hover:bg-[#fbe8ed] rounded-2xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all select-none flex-1">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleCertificateUpload}
                className="hidden"
                disabled={isUploadingCertificate}
              />
              <FiUploadCloud className="w-5 h-5 text-[#a31d38] shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[#a31d38] font-bold text-xs">
                  {isUploadingCertificate
                    ? "Uploading Certificate..."
                    : certificateAssetId
                      ? certificateName || "Replace Accreditation Certificate"
                      : "Upload Accreditation Certificate"}
                </span>
                <span className="text-gray-400 text-[10px] font-medium">
                  PDF, JPG, or PNG (max 5MB)
                </span>
              </div>
            </label>

            {certificateUrl && (
              <a
                href={certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-neutral-primary transition-colors shrink-0"
              >
                <FiFileText className="w-4 h-4 text-[#a31d38]" />
                <span>View Certificate</span>
                <FiExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            )}
          </div>
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
