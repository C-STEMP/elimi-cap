import * as React from "react";
import { LuLoader } from "react-icons/lu";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
}

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
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap select-none";

    const sizeStyles = {
      xs: "text-xs px-3 py-1.5 gap-1.5",
      sm: "text-sm px-4 py-2 gap-2",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
      xl: "text-lg px-8 py-4 gap-3",
      icon: "p-2 gap-0",
    };

    const roundedStyles = {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      full: "rounded-full",
    };

    const variantStyles = {
      primary:
        "bg-primary hover:bg-primary-hover text-white border-transparent focus:ring-primary/50 shadow-sm",
      secondary:
        "bg-secondary hover:bg-secondary-hover text-white border-transparent focus:ring-secondary/50 shadow-sm",
      outline:
        "bg-white hover:bg-gray-50/80 text-text-dark border border-border-gray/80 focus:ring-gray-100 shadow-2xs",
      danger:
        "bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500/50 shadow-sm",
      ghost:
        "bg-transparent hover:bg-gray-100 text-text-dark border-transparent focus:ring-gray-100",
      link: "bg-transparent hover:underline text-primary hover:text-primary-hover border-transparent focus:ring-primary/50 p-0",
      amber:
        "bg-[#fbab2a] hover:bg-[#e89b1f] text-white border-transparent focus:ring-amber-500/30 shadow-sm font-bold",
      success:
        "bg-green-600 hover:bg-green-700 text-white border-transparent focus:ring-green-500/50 shadow-sm",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${roundedStyles[rounded]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <LuLoader className="animate-spin h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        {!loading && leftIcon && (
          <span className="shrink-0 inline-flex items-center justify-center">{leftIcon}</span>
        )}
        {children !== undefined && children !== null && children !== "" && (
          <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
            {children}
          </span>
        )}
        {!loading && rightIcon && (
          <span className="shrink-0 inline-flex items-center justify-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
