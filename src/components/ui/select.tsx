"use client";

import React, { useId, useState, useEffect, useRef } from "react";
import { Select as AntSelect } from "antd";
import { FiChevronDown, FiX, FiSearch } from "react-icons/fi";

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
  searchPlaceholder?: string;
  error?: string;
  helperText?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  size?: "sm" | "md" | "lg";
  showPlaceholderOption?: boolean;
  containerClassName?: string;
  className?: string;
  popupClassName?: string;
  popupMatchSelectWidth?: boolean | number;
  id?: string;
  name?: string;
  loading?: boolean;
  notFoundContent?: React.ReactNode;
  maxTagCount?: number | "responsive";
  maxTagTextLength?: number;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  filterOption?: boolean | ((input: string, option?: any) => boolean);
  allowClear?: boolean;
  autoComplete?: string;
}

export const Select: React.FC<SelectProps> = ({
  className = "",
  containerClassName = "",
  popupClassName = "",
  popupMatchSelectWidth,
  label,
  error,
  helperText,
  options = [],
  placeholder = "Select",
  searchPlaceholder,
  id,
  name,
  value,
  onChange,
  disabled = false,
  multiple = false,
  required = false,
  size = "md",
  showPlaceholderOption,
  loading = false,
  notFoundContent,
  maxTagCount,
  maxTagTextLength = 22,
  showSearch = false,
  onSearch,
  searchValue,
  filterOption,
  allowClear,
  autoComplete = "off",
}) => {
  const reactId = useId();
  const [mounted, setMounted] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectId = id || (mounted ? reactId : undefined);

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  const shouldShowSearch =
    showSearch === true ||
    (showSearch !== false && normalizedOptions.length >= 4);

  const filteredOptions: SelectOption[] = React.useMemo(() => {
    if (!shouldShowSearch || !dropdownSearch.trim()) return normalizedOptions;
    const q = dropdownSearch.trim().toLowerCase();
    return normalizedOptions.filter((opt) => {
      const labelStr = opt.label?.toString().toLowerCase() || "";
      const valStr = opt.value?.toString().toLowerCase() || "";
      return labelStr.includes(q) || valStr.includes(q);
    });
  }, [normalizedOptions, dropdownSearch, shouldShowSearch]);

  const handleChange = (newVal: string | string[]) => {
    if (!onChange) return;
    const event = {
      target: { name: name || "", value: newVal },
    };
    onChange(event);
  };

  const isRawId = (val?: string) => {
    if (!val || typeof val !== "string") return false;
    return (
      /^[0-9A-Z]{20,}$/i.test(val) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(val)
    );
  };

  const matchesAnyOption = (val?: string) => {
    if (!val) return false;
    return normalizedOptions.some((o) => o.value === val || o.label === val);
  };

  const antValue: string | string[] | undefined = loading
    ? undefined
    : multiple
      ? Array.isArray(value)
        ? value
        : typeof value === "string" && value
          ? value.split(", ").filter(Boolean)
          : []
      : typeof value === "string" && value
        ? isRawId(value) && !matchesAnyOption(value)
          ? undefined
          : value
        : undefined;

  const errorClass = error
    ? "!border-primary-solid !ring-2 !ring-border-secondary"
    : "";

  const hasCustomWidth =
    containerClassName.includes("w-") ||
    containerClassName.includes("flex-1") ||
    containerClassName.includes("min-w") ||
    containerClassName.includes("max-w");

  return (
    <div
      className={`flex flex-col gap-1.5 ${hasCustomWidth ? "" : "w-full"} relative ${containerClassName}`}
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
        placeholder={loading ? (typeof placeholder === "string" && placeholder.includes("Loading") ? placeholder : "Loading...") : placeholder}
        disabled={disabled}
        loading={loading}
        showSearch={false}
        allowClear={allowClear}
        onOpenChange={(open) => {
          if (!open) {
            setDropdownSearch("");
          } else if (shouldShowSearch) {
            setTimeout(() => {
              searchInputRef.current?.focus();
            }, 60);
          }
        }}
        popupRender={(menu) => (
          <div className="flex flex-col min-w-0">
            {shouldShowSearch && (
              <div
                className="p-2 pb-2.5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-xl"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative flex items-center w-full">
                  <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => {
                      setDropdownSearch(e.target.value);
                      onSearch?.(e.target.value);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder={
                      searchPlaceholder ||
                      (typeof placeholder === "string" &&
                      !placeholder.includes("Select") &&
                      !placeholder.includes("Loading")
                        ? `Search ${placeholder.toLowerCase()}...`
                        : "Search...")
                    }
                    className="w-full h-9 pl-9 pr-7 text-xs xl:text-sm bg-[#F9FAFB] border border-gray-200 rounded-xl outline-none focus:border-[#fbab2a] focus:ring-1 focus:ring-[#fbab2a]/30 text-gray-800 placeholder:text-gray-400 font-medium transition-all"
                  />
                  {dropdownSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownSearch("");
                        onSearch?.("");
                      }}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
            {menu}
          </div>
        )}
        {...({
          autoComplete: autoComplete || "off",
          "data-lpignore": "true",
          "data-1p-ignore": "true",
          "data-form-type": "other",
          "aria-autocomplete": "none",
        } as any)}
        filterOption={
          filterOption !== undefined
            ? filterOption
            : onSearch
              ? false
              : (input, option) =>
                  (option?.label?.toString() || "")
                    .toLowerCase()
                    .includes(input.toLowerCase()) ||
                  (option?.value?.toString() || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
        }
        maxTagCount={maxTagCount !== undefined ? maxTagCount : multiple ? "responsive" : undefined}
        maxTagTextLength={maxTagTextLength}
        maxTagPlaceholder={(omittedValues) => (
          <span className="inline-flex items-center px-2 py-0.5 my-0.5 bg-[#a31d38]/10 text-[#a31d38] text-xs font-semibold rounded-md border border-[#a31d38]/20 select-none">
            +{omittedValues.length} more
          </span>
        )}
        tagRender={
          multiple
            ? (props) => {
                const { label, closable, onClose } = props;
                const onPreventMouseDown = (
                  event: React.MouseEvent<HTMLSpanElement>,
                ) => {
                  event.preventDefault();
                  event.stopPropagation();
                };
                return (
                  <span
                    onMouseDown={onPreventMouseDown}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 my-0.5 mr-1 bg-gray-100/90 text-text-dark text-xs font-medium rounded-lg border border-gray-200/90 max-w-[220px] truncate select-none shrink-0"
                    title={typeof label === "string" ? label : undefined}
                  >
                    <span className="truncate">{label}</span>
                    {closable && !disabled && (
                      <span
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded p-0.5 cursor-pointer shrink-0 transition-colors"
                      >
                        <FiX className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    )}
                  </span>
                );
              }
            : undefined
        }
        notFoundContent={
          loading ? (
            <div className="py-4 px-3 text-center text-xs xl:text-sm text-gray-500 font-medium flex items-center justify-center gap-2 select-none">
              <span className="w-4 h-4 border-2 border-[#a31d38] border-t-transparent rounded-full animate-spin shrink-0" />
              <span>
                {typeof placeholder === "string" && placeholder.includes("Loading")
                  ? placeholder
                  : "Loading..."}
              </span>
            </div>
          ) : notFoundContent !== undefined ? (
            <div className="py-4 px-3 text-center text-xs xl:text-sm text-gray-500 font-medium select-none">
              {notFoundContent}
            </div>
          ) : (
            <div className="py-4 px-3 text-center text-xs xl:text-sm text-gray-400 font-normal select-none">
              No options found
            </div>
          )
        }
        onChange={handleChange}
        options={filteredOptions}
        className={`w-full ${className}`}
        popupMatchSelectWidth={
          popupMatchSelectWidth !== undefined
            ? popupMatchSelectWidth
            : size === "sm"
              ? false
              : true
        }
        suffixIcon={
          <FiChevronDown className="w-4 h-4 text-text-dark stroke-[2.5] opacity-90 transition-transform duration-200" />
        }
        classNames={{
          popup: {
            root: `rounded-2xl shadow-2xl border border-gray-100 ${popupClassName}`,
          },
        }}
        status={error ? "error" : undefined}
        optionRender={(option) => {
          return (
            <div className="flex items-center justify-between gap-3 w-full py-0.5 min-w-0">
              <span className="text-xs xl:text-sm font-medium text-text-dark truncate">
                {option.label}
              </span>
            </div>
          );
        }}
        styles={{
          popup: {
            root: {
              padding: "6px",
              borderRadius: "16px",
              minWidth: size === "sm" ? 100 : undefined,
            },
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
