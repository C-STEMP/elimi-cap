"use client";

import * as React from "react";
import { Button as AntButton } from "antd";
import { LuLoader } from "react-icons/lu";
import type { ButtonProps as AntButtonProps } from "antd";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "ghost"
    | "link"
    | "amber"
    | "success";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";
}

/** Maps our variant to antd's `type` prop */
const variantToAntType = (
  variant: ButtonProps["variant"],
): AntButtonProps["type"] => {
  switch (variant) {
    case "primary":
    case "amber":
    case "success":
      return "primary";
    case "secondary":
      return "primary";
    case "outline":
      return "default";
    case "danger":
      return "primary"; // colour handled by className
    case "ghost":
      return "text";
    case "link":
      return "link";
    default:
      return "primary";
  }
};

/** Maps our size to antd's size prop */
const variantToAntSize = (
  size: ButtonProps["size"],
): AntButtonProps["size"] => {
  switch (size) {
    case "xs":
    case "sm":
      return "small";
    case "lg":
    case "xl":
      return "large";
    default:
      return "middle";
  }
};

/** Tailwind classes kept so colours / shapes match the existing design */
const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "!bg-primary hover:!bg-primary-hover !text-white !border-transparent shadow-xs",
  secondary:
    "!bg-secondary hover:!bg-secondary-hover !text-white !border-transparent shadow-xs",
  outline:
    "!bg-white hover:!bg-gray-50/80 !text-text-dark !border !border-border-gray/80 shadow-xs",
  danger:
    "!bg-red-600 hover:!bg-red-700 !text-white !border-transparent shadow-xs",
  ghost:
    "!bg-transparent hover:!bg-gray-100 !text-text-dark !border-transparent shadow-xs",
  link: "!bg-transparent hover:underline !text-primary hover:!text-primary-hover !border-transparent !p-0 shadow-xs",
  amber:
    "!bg-[#fbab2a] hover:!bg-[#e89b1f] !text-white !border-transparent !font-bold shadow-xs",
  success:
    "!bg-green-600 hover:!bg-green-700 !text-white !border-transparent shadow-xs",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "!text-xs !px-3 !py-1.5 !gap-1.5",
  sm: "!text-sm !px-4 !py-2 !gap-2",
  md: "!text-sm !px-5 !py-2.5 !gap-2",
  lg: "!text-base !px-6 !py-3 !gap-2.5",
  xl: "!text-lg !px-8 !py-4 !gap-3",
  icon: "!p-2 !gap-0",
};

const roundedStyles: Record<NonNullable<ButtonProps["rounded"]>, string> = {
  sm: "!rounded-sm",
  md: "!rounded-md",
  lg: "!rounded-lg",
  xl: "!rounded-xl",
  "2xl": "!rounded-2xl",
  full: "!rounded-full",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = "xl",
      children,
      disabled,
      type = "button",
      onClick,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const combinedClassName = [
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-out",
      "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
      "active:outline-none outline-none active:scale-[0.98]",
      "disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap select-none",
      variantStyles[variant],
      sizeStyles[size],
      roundedStyles[rounded],
      fullWidth ? "!w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <AntButton
        ref={ref as React.Ref<HTMLButtonElement>}
        htmlType={type}
        type={variantToAntType(variant)}
        size={variantToAntSize(size)}
        loading={loading ? { icon: <LuLoader className="animate-spin h-4 w-4 shrink-0" aria-hidden="true" /> } : false}
        disabled={isDisabled}
        block={fullWidth}
        className={combinedClassName}
        onClick={onClick}
        {...(rest as Omit<AntButtonProps, "type" | "size" | "loading" | "disabled" | "block" | "className" | "onClick">)}
      >
        {!loading && leftIcon && (
          <span className="shrink-0 inline-flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        {children !== undefined && children !== null && children !== "" && (
          <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
            {children}
          </span>
        )}
        {!loading && rightIcon && (
          <span className="shrink-0 inline-flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </AntButton>
    );
  },
);

Button.displayName = "Button";
