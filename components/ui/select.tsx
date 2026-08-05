"use client";

import React, { useId } from "react";
import { FiChevronDown } from "react-icons/fi";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: React.ReactNode;
  value?: string | string[];
  onChange?: (e: any) => void;
  options?: (string | SelectOption)[];
  placeholder?: string;
  showPlaceholderOption?: boolean;
  error?: string;
  helperText?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  containerClassName?: string;
  className?: string;
  id?: string;
  name?: string;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Select: React.FC<SelectProps> = ({
  className = "",
  containerClassName = "",
  label,
  error,
  helperText,
  options = [],
  placeholder = "Select",
  showPlaceholderOption = true,
  id,
  name,
  value = "",
  onChange,
  disabled = false,
  required = false,
  loading = false,
  size = "md",
}) => {
  const reactId = useId();
  const selectId = id || reactId;

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  const errorClass = error
    ? "!border-primary-solid !ring-2 !ring-border-secondary"
    : "";

  const sizeClass =
    size === "sm"
      ? "h-9.5 pl-3 pr-8 text-xs rounded-xl"
      : "h-11 xl:h-12 pl-4 pr-10 text-xs xl:text-sm rounded-radius-200";

  const iconPositionClass = size === "sm" ? "right-2.5" : "right-4";

  return (
    <div
      className={`flex flex-col gap-1.5 w-full relative ${containerClassName}`}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none"
        >
          {label}
          {required && <span className="text-primary-solid ml-0.5">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <select
          id={selectId}
          name={name}
          value={value as string}
          onChange={onChange}
          disabled={disabled || loading}
          required={required}
          className={`
            w-full
            bg-input-bg
            text-text-dark font-normal
            border border-transparent
            appearance-none
            outline-none
            cursor-pointer
            transition-all duration-200 ease-in-out
            focus:border-primary-solid/40
            focus:ring-2
            focus:ring-primary-solid/10
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${!value && showPlaceholderOption ? "text-gray-400" : "text-text-dark"}
            ${errorClass}
            ${sizeClass}
            ${className}
          `}
        >
          {/* Placeholder option */}
          {placeholder && showPlaceholderOption && (
            <option value="" disabled hidden>
              {loading ? "Loading..." : placeholder}
            </option>
          )}
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Dropdown icon — styled chevron */}
        <span
          className={`pointer-events-none absolute ${iconPositionClass} top-1/2 -translate-y-1/2 flex items-center justify-center text-text-dark/60`}
        >
          <FiChevronDown
            className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0`}
          />
        </span>
      </div>

      {error && (
        <span className="text-primary-solid text-xs font-semibold leading-[1.4]">
          {error}
        </span>
      )}
      {!error && helperText && (
        <div className="text-neutral-secondary text-xs leading-[1.4]">
          {helperText}
        </div>
      )}
    </div>
  );
};
