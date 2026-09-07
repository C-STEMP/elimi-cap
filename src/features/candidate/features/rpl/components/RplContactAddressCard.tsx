"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { PhoneInput } from "@/src/components/ui/phone-input";
import { InfoIcon } from "@/src/components/ui/info-icon";

interface RplContactAddressCardProps {
  form: any;
  errors: Record<string, string>;
  update: (field: any, val: string) => void;
  countries: any[];
  states: any[];
  cities: any[];
  isLoadingStates: boolean;
  isLoadingLgas: boolean;
  userEmail?: string;
}

export const RplContactAddressCard: React.FC<RplContactAddressCardProps> = ({
  form,
  errors,
  update,
  countries,
  states,
  cities,
  isLoadingStates,
  isLoadingLgas,
  userEmail = "",
}) => {
  return (
    <>
      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
          Contact Information <InfoIcon sectionName="Contact Information" />
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={<span>Email Address<span className="text-primary-solid ml-0.5">*</span></span>}
            type="email"
            placeholder="yourname@email.com"
            value={form.email || userEmail}
            disabled={true}
            className="bg-gray-100/70 cursor-not-allowed opacity-80"
            helperText="Auto-filled from your registered account email."
          />

          <PhoneInput
            label={<span>Phone Number<span className="text-primary-solid ml-0.5">*</span></span>}
            value={form.phoneNumber}
            onChange={(v) => update("phoneNumber", v)}
            onCountryChange={(cName) => {
              update("country", cName);
              if (!form.nationality) update("nationality", cName);
            }}
            error={errors.phoneNumber}
            country="ng"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
          Residential Address <InfoIcon sectionName="Residential Address" />
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={<span>Country<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder="Select country"
            options={countries}
            value={form.country}
            error={errors.country}
            onChange={(e) => update("country", e.target.value)}
          />

          <Select
            label={<span>State of Residence<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder={isLoadingStates ? "Loading states..." : form.country ? "Select state" : "Select country first"}
            options={states}
            value={form.state}
            error={errors.state}
            disabled={isLoadingStates || !form.country || states.length === 0}
            onChange={(e) => update("state", e.target.value)}
          />

          <Select
            label={<span>City / LGA<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder={isLoadingLgas ? "Loading LGAs..." : form.state ? "Select city / LGA" : "Select state first"}
            options={cities}
            value={form.lga}
            error={errors.lga}
            disabled={isLoadingLgas || !form.state || cities.length === 0}
            onChange={(e) => update("lga", e.target.value)}
          />

          <Input
            label={<span>Residential Address<span className="text-primary-solid ml-0.5">*</span></span>}
            type="text"
            placeholder="Street Address"
            value={form.streetAddress}
            error={errors.streetAddress}
            onChange={(e) => update("streetAddress", e.target.value)}
          />
        </div>
      </div>
    </>
  );
};
