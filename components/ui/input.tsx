import * as React from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  containerClassName?: string;
}

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
      ...props
    },
    ref,
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          {prefix && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-text-dark/60 select-none pointer-events-none">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={`
              w-full h-11 xl:h-12
              ${prefix ? "pl-11" : "pl-4"} ${suffix ? "pr-11" : "pr-4"} py-2.5
              bg-input-bg
              text-text-dark font-normal text-sm
              border border-transparent
              rounded-radius-200
              transition-all duration-200 ease-in-out
              outline-none
              placeholder:text-gray-400
              
              focus:border-primary-solid/40
              focus:ring-2
              focus:ring-primary-solid/10
              
              /* Error override styling if error is present */
              ${error ? "border-primary-solid ring-2 ring-border-secondary" : ""}
              
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-text-dark/60 hover:text-text-dark transition-colors cursor-pointer select-none">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <span className="text-primary-solid text-xs font-semibold leading-[1.4] transition-all duration-200 animate-fadeIn">
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
  },
);

Input.displayName = "Input";
