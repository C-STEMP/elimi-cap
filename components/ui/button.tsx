import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "normal" | "small";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "normal", children, ...props }, ref) => {
    // Style configurations matching the requested design tokens
    const baseStyles =
      "relative flex items-center justify-center border transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-radius-200 font-medium";

    // Dimensions
    // normal: width 440px (w-full max-w-[440px]), height 50px
    // small: width 250px (w-full max-w-[250px]), height 50px
    const sizeStyles = {
      normal: "w-full max-w-110 h-12.5 px-6 gap-2",
      small: "w-full max-w-62.5 h-12.5 px-6 gap-2",
    };

    // Color/Border Variants
    const variantStyles = {
      primary:
        "bg-primary hover:bg-primary-hover text-white border-transparent focus:ring-primary/50 shadow-sm",
      secondary:
        "bg-secondary hover:bg-secondary-hover text-text-dark border-transparent focus:ring-secondary/50 shadow-sm",
      outline:
        "bg-white hover:bg-gray-50/80 text-text-dark border-border-gray/80 focus:ring-gray-100 shadow-2xs font-medium cursor-pointer",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
