"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { InfoIcon } from "@/src/components/ui/info-icon";

interface RplOccupationCardProps {
  form: any;
  errors: Record<string, string>;
  update: (field: string, val: any) => void;
}

export const RplOccupationCard: React.FC<RplOccupationCardProps> = ({
  form,
  errors,
  update,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 mt-2">
      <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
        Current Occupation <InfoIcon sectionName="Current Occupation" />
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={<span>Occupation<span className="text-primary-solid ml-0.5">*</span></span>}
          type="text"
          placeholder="e.g. Carpenter, Electrician, Welder"
          value={form.occupation}
          error={errors.occupation}
          onChange={(e) => update("occupation", e.target.value)}
        />

        <Input
          label={<span>Years Of Experience<span className="text-primary-solid ml-0.5">*</span></span>}
          type="number"
          min={0}
          placeholder="e.g. 5"
          value={form.yearsOfExperience}
          error={errors.yearsOfExperience}
          onChange={(e) => update("yearsOfExperience", e.target.value)}
        />
      </div>
    </div>
  );
};
