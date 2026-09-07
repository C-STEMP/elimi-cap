"use client";

import React from "react";
import { FiSave } from "react-icons/fi";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";

interface PricingSettingsTabProps {
  rplCurrency: string;
  setRplCurrency: (val: string) => void;
  rplAmount: string;
  setRplAmount: (val: string) => void;
  standardCurrency: string;
  setStandardCurrency: (val: string) => void;
  standardAmount: string;
  setStandardAmount: (val: string) => void;
  handleSavePricingSettings: () => void;
  isSavingPricing: boolean;
}

export const PricingSettingsTab: React.FC<PricingSettingsTabProps> = ({
  rplCurrency,
  setRplCurrency,
  rplAmount,
  setRplAmount,
  standardCurrency,
  setStandardCurrency,
  standardAmount,
  setStandardAmount,
  handleSavePricingSettings,
  isSavingPricing,
}) => {
  return (
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
          loading={isSavingPricing}
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
