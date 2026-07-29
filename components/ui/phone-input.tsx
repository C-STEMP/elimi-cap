"use client";

import * as React from "react";
import PhoneInputReact from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export interface PhoneInputProps {
  label?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
  id?: string;
  name?: string;
  country?: string;
  preferredCountries?: string[];
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value = "",
  onChange,
  error,
  helperText,
  placeholder = "000000000",
  disabled = false,
  containerClassName = "",
  className = "",
  id,
  name,
  country = "ng",
  preferredCountries = [],
}) => {
  const inputId = id || React.useId();

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col gap-1.5 w-full ${containerClassName}`}
    >
      {label && (
        <label
          suppressHydrationWarning
          htmlFor={inputId}
          className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none"
        >
          {label}
        </label>
      )}
      <div suppressHydrationWarning className="relative w-full phone-input-wrapper">
        <PhoneInputReact
          country={country}
          value={value}
          onChange={(phone) => onChange?.(phone)}
          placeholder={placeholder}
          disabled={disabled}
          inputProps={{
            id: inputId,
            name,
          }}
          preferredCountries={preferredCountries}
          inputClass={`!w-full !h-11 xl:!h-12 !pl-12 !pr-4 !py-2.5 !bg-input-bg !text-text-dark !font-normal !text-sm !border !border-transparent !rounded-radius-200 !outline-none placeholder:!text-gray-400 transition-all duration-200 ease-in-out focus:!border-primary-solid/40 focus:!ring-2 focus:!ring-primary-solid/10 ${
            error ? "!border-primary-solid !ring-2 !ring-border-secondary" : ""
          } ${disabled ? "!opacity-50 !cursor-not-allowed" : ""} ${className}`}
          buttonClass="!absolute !left-0 !top-1/2 !-translate-y-1/2 !h-11 xl:!h-12 !flex !items-center !pl-3 !pr-2 !border-none !bg-transparent !outline-none"
          dropdownClass="!bg-white !rounded-2xl !shadow-2xl !border !border-gray-100 !p-2 !top-full !bottom-auto !mt-1"
          searchClass="!h-10 !px-3 !mb-2 !bg-input-bg !border !border-transparent !rounded-radius-200 !outline-none focus:!border-primary-solid/40 focus:!ring-2 focus:!ring-primary-solid/10"
        />
      </div>
      {error && (
        <span
          suppressHydrationWarning
          className="text-primary-solid text-xs font-semibold leading-[1.4] transition-all duration-200 animate-fadeIn"
        >
          {error}
        </span>
      )}
      {!error && helperText && (
        <div
          suppressHydrationWarning
          className="text-neutral-secondary text-xs leading-[1.4]"
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

PhoneInput.displayName = "PhoneInput";
