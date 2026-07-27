"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

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
}) => {
  const reactId = useId();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectId = id || (mounted ? reactId : undefined);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedValues: string[] = Array.isArray(value)
    ? value
    : typeof value === "string" && value
    ? multiple
      ? value.split(", ").filter(Boolean)
      : [value]
    : [];

  const handleSelectOption = (optVal: string) => {
    if (disabled) return;

    if (multiple) {
      let newValues = [...selectedValues];
      if (newValues.includes(optVal)) {
        newValues = newValues.filter((v) => v !== optVal);
      } else {
        newValues.push(optVal);
      }
      if (onChange) {
        const event = {
          target: { name: name || "", value: newValues },
        };
        onChange(event);
      }
    } else {
      setIsOpen(false);
      if (onChange) {
        const event = {
          target: { name: name || "", value: optVal },
        };
        onChange(event);
      }
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      const labels = normalizedOptions
        .filter((opt) => selectedValues.includes(opt.value))
        .map((opt) => opt.label);
      return labels.length > 0 ? labels.join(", ") : placeholder;
    } else {
      const match = normalizedOptions.find((opt) => opt.value === value);
      return match ? match.label : value ? String(value) : placeholder;
    }
  };

  const hasValue = multiple ? selectedValues.length > 0 : Boolean(value);

  return (
    <div
      ref={containerRef}
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
        {/* Trigger Input Button */}
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full h-11 xl:h-12
            px-4 py-2.5
            bg-input-bg
            font-normal text-xs xl:text-sm
            border border-transparent
            rounded-radius-200
            transition-all duration-200 ease-in-out
            outline-none
            flex items-center justify-between
            cursor-pointer select-none text-left
            
            focus:border-primary-solid/40
            focus:ring-2
            focus:ring-primary-solid/10
            
            ${!hasValue ? "text-gray-400" : "text-text-dark font-medium"}
            ${error ? "border-primary-solid ring-2 ring-border-secondary" : ""}
            
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${className}
          `}
        >
          <span className="truncate">{getDisplayText()}</span>
          <FiChevronDown
            className={`w-4 h-4 text-text-dark/60 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Card */}
        {mounted && isOpen && (
          <div className="absolute left-0 top-full mt-2 z-50 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto p-1">
              {normalizedOptions.map((opt, idx) => {
                const isSelected = multiple
                  ? selectedValues.includes(opt.value)
                  : value === opt.value;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(opt.value)}
                    className={`
                      w-full p-3.5 rounded-xl flex items-center justify-between
                      cursor-pointer transition-all duration-150 select-none
                      ${
                        isSelected
                          ? "bg-gray-50 text-neutral-primary font-semibold"
                          : "text-neutral-secondary hover:bg-gray-50/80 hover:text-neutral-primary font-normal"
                      }
                    `}
                  >
                    <span className="text-xs xl:text-sm font-medium text-text-dark">
                      {opt.label}
                    </span>

                    {multiple ? (
                      /* Case 2: Multiple Selection Checkbox Indicator */
                      <div
                        className={`
                          w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0
                          ${
                            isSelected
                              ? "bg-neutral-900 border-neutral-900 text-white"
                              : "bg-white border-neutral-400"
                          }
                        `}
                      >
                        {isSelected && (
                          <FiCheck className="w-3.5 h-3.5 stroke-3 text-white" />
                        )}
                      </div>
                    ) : (
                      /* Case 1: Single Selection Radio Circle Indicator */
                      <div
                        className={`
                          w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0
                          ${
                            isSelected
                              ? "border-neutral-900 bg-neutral-900"
                              : "border-neutral-400 bg-white"
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
