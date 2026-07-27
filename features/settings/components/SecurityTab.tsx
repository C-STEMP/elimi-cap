"use client";

import React from "react";
import { VerificationStatus, SecurityFormData } from "../types/settings.types";
import { VerificationStatusCard } from "./VerificationStatusCard";
import { ChangePasswordSection } from "./ChangePasswordSection";

interface SecurityTabProps {
  status: VerificationStatus;
  onVerifyNow?: () => void;
  securityFormData: SecurityFormData;
  onChangeSecurityForm: (field: keyof SecurityFormData, value: string) => void;
  onPasswordChangeSuccess: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  status,
  onVerifyNow,
  securityFormData,
  onChangeSecurityForm,
  onPasswordChangeSuccess,
}) => {
  return (
    <div className="bg-white rounded-[20px] p-6 lg:p-8 shadow-sm border border-gray-100/80 flex flex-col gap-8 w-full">
      <VerificationStatusCard status={status} onVerifyNow={onVerifyNow} />
      <hr className="border-gray-100" />
      <ChangePasswordSection
        formData={securityFormData}
        onChange={onChangeSecurityForm}
        onSubmit={onPasswordChangeSuccess}
      />
    </div>
  );
};
