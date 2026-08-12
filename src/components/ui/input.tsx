"use client";

import * as React from "react";
import Image from "next/image";
import { Input as AntInput } from "antd";
import type { InputProps as AntInputProps } from "antd";
import { FiEye } from "react-icons/fi";
import { eyeClosedIcon } from "@/assets";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "prefix" | "size"
> {
  label?: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  containerClassName?: string;
  textarea?: boolean;
  rows?: number;
}
const inputBaseClass = `
  w-full !h-11 xl:!h-12
  !bg-input-bg
  !text-text-dark !font-normal !text-sm
  !border !border-transparent
  !rounded-radius-200
  transition-all duration-200 ease-in-out
  !outline-none
  placeholder:!text-gray-400
  focus:!border-primary-solid/40
  focus:!ring-2
  focus:!ring-primary-solid/10
  disabled:!opacity-50
  disabled:!cursor-not-allowed
`;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      containerClassName = "",
      type = "text",
      label,
      error,
      helperText,
      suffix,
      prefix,
      id,
      placeholder,
      disabled,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      readOnly,
      maxLength,
      required,
      autoComplete,
      autoFocus,
      name,
      textarea,
      rows,
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id || reactId;

    const errorClass = error
      ? "!border-primary-solid !ring-2 !ring-border-secondary"
      : "";

    const combinedInputClass = `${inputBaseClass} ${errorClass} ${className}`;

    const sharedProps: Partial<AntInputProps> = {
      id: inputId,
      name,
      placeholder,
      disabled,
      value: value as string,
      defaultValue: defaultValue as string,
      onChange: onChange as AntInputProps["onChange"],
      onBlur: onBlur as AntInputProps["onBlur"],
      onFocus: onFocus as AntInputProps["onFocus"],
      readOnly,
      maxLength,
      required,
      autoComplete,
      autoFocus,
      prefix: prefix ? (
        <span className="flex items-center justify-center text-text-dark/60 select-none pointer-events-none">
          {prefix}
        </span>
      ) : undefined,
      suffix: suffix ? (
        <span className="flex items-center justify-center text-text-dark/60 hover:text-text-dark transition-colors cursor-pointer select-none">
          {suffix}
        </span>
      ) : undefined,
      className: combinedInputClass,
    };

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

        {textarea ? (
          <AntInput.TextArea
            rows={rows || 3}
            placeholder={placeholder}
            disabled={disabled}
            value={value as string}
            defaultValue={defaultValue as string}
            onChange={onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
            onBlur={onBlur as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
            onFocus={onFocus as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
            readOnly={readOnly}
            maxLength={maxLength}
            required={required}
            autoFocus={autoFocus}
            name={name}
            className={combinedInputClass}
          />
        ) : type === "password" ? (
          <AntInput.Password
            {...sharedProps}
            suffix={undefined}
            iconRender={(visible) =>
              visible ? (
                <FiEye className="w-5 h-5 text-text-dark/70" />
              ) : (
                <Image
                  src={eyeClosedIcon}
                  alt="Hide password"
                  width={20}
                  height={20}
                  className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
                />
              )
            }
          />
        ) : (
          <AntInput ref={ref as any} type={type} {...sharedProps} />
        )}

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
  },
);

Input.displayName = "Input";
