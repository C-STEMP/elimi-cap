import * as React from "react";
import { FiChevronDown } from "react-icons/fi";

export interface PhoneInputProps {
  label?: React.ReactNode;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  phoneNumber?: string;
  onPhoneNumberChange?: (num: string) => void;
  error?: string;
  containerClassName?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  countryCode = "NGN",
  onCountryCodeChange,
  phoneNumber = "",
  onPhoneNumberChange,
  error,
  containerClassName = "",
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1 w-full">
        {/* Country Select */}
        <div className="relative shrink-0 w-21">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange?.(e.target.value)}
            className="w-full h-11 xl:h-12 pl-3 pr-7 py-2.5 bg-input-bg text-text-dark font-medium text-xs xl:text-sm border border-transparent rounded-radius-200 outline-none appearance-none cursor-pointer focus:border-primary-solid/40 focus:ring-2 focus:ring-primary-solid/10"
          >
            <option value="NGN">NGN</option>
            <option value="GHS">GHS</option>
            <option value="KES">KES</option>
            <option value="ZAR">ZAR</option>
            <option value="USD">USD</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-dark/60">
            <FiChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Number Input */}
        <input
          type="tel"
          placeholder="000000000"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange?.(e.target.value)}
          className={`
            flex-1 h-11 xl:h-12 px-4 py-2.5 bg-input-bg text-text-dark font-normal text-sm border border-transparent rounded-radius-200 outline-none placeholder:text-gray-400 transition-all focus:border-primary-solid/40 focus:ring-2 focus:ring-primary-solid/10
            ${error ? "border-primary-solid ring-2 ring-border-secondary" : ""}
          `}
        />
      </div>
      {error && (
        <span className="text-primary-solid text-xs font-semibold leading-[1.4]">
          {error}
        </span>
      )}
    </div>
  );
};
