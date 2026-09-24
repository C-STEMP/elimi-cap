"use client";

import React, { useId } from "react";
import { Select as AntSelect } from "antd";
import { FiChevronDown, FiX } from "react-icons/fi";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectChangeEvent {
  target: {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
  };
}

export interface SelectProps {
  label?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (e: any) => void;
  options?: (string | number | SelectOption)[];
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
  filterOption?: boolean | ((input: string, option?: SelectOption) => boolean);
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
  loading = false,
  notFoundContent,
  maxTagCount,
  maxTagTextLength = 22,
  showSearch,
  onSearch,
  searchValue,
  filterOption,
  allowClear,
  autoComplete = "off",
}) => {
  const reactId = useId();
  const selectId = id || reactId;

  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" || typeof opt === "number"
        ? { label: String(opt), value: String(opt) }
        : {
            label: opt?.label !== undefined ? String(opt.label) : "",
            value: opt?.value !== undefined ? String(opt.value) : "",
          },
    );
  }, [options]);

  const shouldShowSearch =
    !loading &&
    (showSearch === true ||
      Boolean(searchPlaceholder) ||
      (showSearch !== false && normalizedOptions.length >= 6));

  const antFilterOption = React.useCallback(
    (input: string, option?: SelectOption) => {
      if (filterOption === false) return true;
      if (typeof filterOption === "function") {
        return filterOption(input, option);
      }
      const labelStr = (option?.label || "").toLowerCase();
      const valStr = (option?.value || "").toLowerCase();
      const q = input.toLowerCase();
      return labelStr.includes(q) || valStr.includes(q);
    },
    [filterOption],
  );

  const handleChange = (newVal: string | string[] | undefined) => {
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

  const matchesAnyOption = (val?: string | number | null): boolean => {
    if (val === undefined || val === null || val === "") return false;
    return normalizedOptions.some(
      (o) =>
        o.value === val ||
        String(o.value) === String(val) ||
        o.label === val ||
        String(o.label) === String(val),
    );
  };

  const antValue: string | string[] | null | undefined = loading
    ? undefined
    : multiple
      ? Array.isArray(value)
        ? value
        : typeof value === "string" && value
          ? value.split(", ").filter(Boolean)
          : []
      : typeof value === "string" && value
        ? isRawId(value) && !matchesAnyOption(value)
          ? null
          : value
        : typeof value === "number"
          ? String(value)
          : null;

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
        placeholder={
          loading
            ? typeof placeholder === "string" && placeholder.includes("Loading")
              ? placeholder
              : "Loading..."
            : placeholder
        }
        disabled={disabled}
        loading={loading}
        showSearch={
          shouldShowSearch
            ? {
                filterOption: antFilterOption,
                onSearch,
                ...(searchValue !== undefined ? { searchValue } : {}),
              }
            : false
        }
        allowClear={allowClear}
        onOpenChange={(open) => {
          if (!open) onSearch?.("");
        }}
        {...({
          autoComplete: autoComplete || "off",
          "data-lpignore": "true",
          "data-1p-ignore": "true",
          "data-form-type": "other",
          "aria-autocomplete": "none",
        } as Record<string, string>)}
        maxTagCount={
          maxTagCount !== undefined
            ? maxTagCount
            : multiple
              ? "responsive"
              : undefined
        }
        maxTagTextLength={maxTagTextLength}
        maxTagPlaceholder={(omittedValues) => (
          <span className="inline-flex items-center px-2 py-0.5 my-0.5 bg-[#a31d38]/10 text-[#a31d38] text-xs font-semibold rounded-md border border-[#a31d38]/20 select-none">
            +{omittedValues.length} more
          </span>
        )}
        tagRender={
          multiple
            ? (props) => {
                const { value: itemValue, label, closable, onClose } = props;
                const matchedOption = normalizedOptions.find(
                  (o) =>
                    o.value === itemValue ||
                    String(o.value) === String(itemValue) ||
                    o.label === label,
                );
                const displayLabel = matchedOption?.label ?? label;
                const onPreventMouseDown = (
                  event: React.MouseEvent<HTMLSpanElement>,
                ) => {
                  event.preventDefault();
                  event.stopPropagation();
                };
                return (
                  <span
                    onMouseDown={onPreventMouseDown}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 my-0.5 mr-1 bg-gray-100/90 text-text-dark text-xs font-medium rounded-lg border border-gray-200/90 max-w-55 truncate select-none shrink-0"
                    title={
                      typeof displayLabel === "string"
                        ? displayLabel
                        : undefined
                    }
                  >
                    <span className="truncate">{displayLabel}</span>
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
              <span className="w-4 h-4 border-2 border-primary-solid border-t-transparent rounded-full animate-spin shrink-0" />
              <span>
                {typeof placeholder === "string" &&
                placeholder.includes("Loading")
                  ? placeholder
                  : "Loading..."}
              </span>
            </div>
          ) : notFoundContent !== undefined ? (
            <div className="py-4 px-3 text-center text-xs xl:text-sm text-gray-500 font-medium select-none">
              {notFoundContent}
            </div>
          ) : (
            <div className="py-5 px-3 text-center text-xs xl:text-sm text-gray-400 font-normal select-none">
              No options found
            </div>
          )
        }
        onChange={handleChange}
        options={normalizedOptions}
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
            root: `rounded-2xl shadow-2xl border border-gray-100 overflow-hidden ${popupClassName}`,
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
              padding: "4px",
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
