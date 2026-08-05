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
  defaultCountry?: string;
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
  defaultCountry,
  preferredCountries = [],
}) => {
  const inputId = id || React.useId();
  const activeCountry = (defaultCountry || country || "ng").toLowerCase();

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

      <div
        suppressHydrationWarning
        className={`
          relative w-full flex items-center h-11 xl:h-12
          bg-input-bg border rounded-radius-200
          transition-all duration-200 ease-in-out
          ${
            error
              ? "border-primary-solid ring-2 ring-border-secondary"
              : "border-transparent focus-within:border-primary-solid/40 focus-within:ring-2 focus-within:ring-primary-solid/10"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          phone-input-wrapper
        `}
      >
        <PhoneInputReact
          country={activeCountry}
          preferredCountries={preferredCountries}
          value={value}
          onChange={(val: string) => onChange?.(val ? `+${val}` : "")}
          disabled={disabled}
          placeholder={placeholder}
          inputProps={{
            id: inputId,
            name,
          }}
          containerClass="!w-full !h-full !bg-transparent"
          inputClass="!w-full !h-full !bg-transparent !border-0 !text-text-dark !text-xs xl:!text-sm !font-normal focus:!outline-none"
          buttonClass="!bg-transparent !border-0 !rounded-l-radius-200 !px-2 hover:!bg-black/5"
          dropdownClass="!bg-white !text-text-dark !rounded-xl !shadow-xl !border-gray-100"
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
