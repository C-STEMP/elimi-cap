"use client";

import React, { useId, useState, useEffect } from "react";
import { Select as AntSelect } from "antd";
import { FiCheck, FiChevronDown } from "react-icons/fi";

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
  error?: string;
  helperText?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  size?: "sm" | "md" | "lg";
  showPlaceholderOption?: boolean;
  containerClassName?: string;
  className?: string;
  id?: string;
  name?: string;
}

export const Select: React.FC<SelectProps> = ({
  className = "",
  containerClassName = "",
  label,
  error,
  helperText,
  options = [],
  placeholder = "Select",
  id,
  name,
  value,
  onChange,
  disabled = false,
  multiple = false,
  required = false,
  size = "md",
  showPlaceholderOption,
}) => {
  const reactId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectId = id || (mounted ? reactId : undefined);

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  const handleChange = (newVal: string | string[]) => {
    if (!onChange) return;
    const event = {
      target: { name: name || "", value: newVal },
    };
    onChange(event);
  };

  const antValue: string | string[] | undefined = multiple
    ? Array.isArray(value)
      ? value
      : typeof value === "string" && value
        ? value.split(", ").filter(Boolean)
        : []
    : typeof value === "string" && value
      ? value
      : undefined;

  const errorClass = error
    ? "!border-primary-solid !ring-2 !ring-border-secondary"
    : "";

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

      <AntSelect
        id={selectId}
        mode={multiple ? "multiple" : undefined}
        value={antValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        options={normalizedOptions}
        className={`w-full ${className}`}
        suffixIcon={
          <FiChevronDown className="w-4 h-4 text-text-dark stroke-[2.5] opacity-90 transition-transform duration-200" />
        }
        popupClassName="rounded-2xl shadow-2xl border border-gray-100"
        status={error ? "error" : undefined}
        optionRender={(option) => {
          const isSelected = multiple
            ? Array.isArray(antValue) && antValue.includes(String(option.value))
            : antValue === option.value;

          return (
            <div className="flex items-center justify-between w-full py-0.5">
              <span className="text-xs xl:text-sm font-medium text-text-dark">
                {option.label}
              </span>
              {multiple ? (
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    isSelected
                      ? "bg-neutral-900 border-neutral-900 text-white"
                      : "bg-white border-neutral-400"
                  }`}
                >
                  {isSelected && (
                    <FiCheck className="w-3.5 h-3.5 stroke-3 text-white" />
                  )}
                </div>
              ) : (
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-900"
                      : "border-neutral-400 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              )}
            </div>
          );
        }}
        styles={{
          popup: {
            root: { padding: "8px", borderRadius: "16px" },
          },
        }}
        style={{ width: "100%" }}
        rootClassName={`elimi-select ${errorClass}`}
      />

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
