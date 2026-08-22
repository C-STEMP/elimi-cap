"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export interface DatePickerProps {
  label?: React.ReactNode;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  minAge?: number;
  maxDate?: Date;
  minDate?: Date;
  disableFutureDates?: boolean;
  containerClassName?: string;
  className?: string;
  id?: string;
  name?: string;
  align?: "left" | "right" | "center";
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const parseDateString = (str: string): Date | null => {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    let day = 0;
    let month = 0;
    let year = 0;

    if (parts[0].length === 4) {
      // YYYY-MM-DD (ISO format)
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2].slice(0, 2), 10);
    } else {
      // DD/MM/YYYY or MM/DD/YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
      if (year < 100) {
        year += 2000;
      }
    }

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const d = new Date(year, month, day);
      if (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      ) {
        return d;
      }
    }
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateString = (
  date: Date,
  isShortYear: boolean,
  isMonthFirst: boolean,
): string => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = isShortYear
    ? String(date.getFullYear()).slice(-2)
    : String(date.getFullYear());
  return isMonthFirst ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
};

/**
 * Coerces raw typed input into a guided dd/mm/yyyy mask.
 * Inserts slashes automatically so users don't need to type them.
 */
function maskDateInput(raw: string): string {
  // Strip everything that isn't a digit
  const digits = raw.replace(/[^\d]/g, "");

  // Auto-insert slashes at positions 2 and 4
  let masked = "";
  for (let i = 0; i < digits.length && i < 8; i++) {
    if (i === 2 || i === 4) masked += "/";
    masked += digits[i];
  }
  return masked;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value = "",
  onChange,
  placeholder = "dd/mm/yyyy",
  error,
  helperText,
  required = false,
  disabled = false,
  minYear = 1930,
  maxYear,
  minAge,
  maxDate,
  minDate,
  disableFutureDates,
  containerClassName = "",
  className = "",
  id,
  name,
  align = "left",
}) => {
  const reactId = useId();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date();

  // Helper to safely extract plain text from React nodes without JSON.stringify circular errors
  const getLabelText = (node: React.ReactNode): string => {
    if (!node) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(getLabelText).join(" ");
    if (React.isValidElement(node)) {
      const props = (node as any).props;
      if (props && props.children) {
        return getLabelText(props.children);
      }
    }
    return "";
  };

  const labelText = getLabelText(label);

  // Detect if this field is Date of Birth (DOB)
  const isDob =
    minAge !== undefined ||
    name === "dob" ||
    name === "dateOfBirth" ||
    /birth|dob/i.test(labelText);

  // Enforce 18+ for DOB unless explicitly overridden
  const effectiveMinAge = minAge !== undefined ? minAge : isDob ? 18 : undefined;

  // Compute maximum allowable date
  const effectiveMaxDate: Date | undefined = maxDate
    ? maxDate
    : effectiveMinAge !== undefined
    ? new Date(
        today.getFullYear() - effectiveMinAge,
        today.getMonth(),
        today.getDate(),
      )
    : disableFutureDates
    ? today
    : undefined;

  const effectiveMaxYear = effectiveMaxDate
    ? effectiveMaxDate.getFullYear()
    : maxYear || today.getFullYear() + 10;

  const selectedDate = parseDateString(value);

  // Default initial calendar view: if DOB, open at 18 years ago; otherwise current date
  const defaultInitialYear = effectiveMaxDate
    ? effectiveMaxDate.getFullYear()
    : today.getFullYear();
  const defaultInitialMonth = effectiveMaxDate
    ? effectiveMaxDate.getMonth()
    : today.getMonth();

  const [viewDate, setViewDate] = useState<Date>(
    () =>
      selectedDate ||
      new Date(defaultInitialYear, defaultInitialMonth, 1),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [value]);

  const inputId = id || (mounted ? reactId : undefined);

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

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const isShortYear =
    placeholder.includes("yy") && !placeholder.includes("yyyy");
  const isMonthFirst =
    placeholder.toLowerCase().startsWith("mm");

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    // Prevent navigating past effectiveMaxDate year/month if restricted
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    if (
      effectiveMaxDate &&
      (nextMonthDate.getFullYear() > effectiveMaxDate.getFullYear() ||
        (nextMonthDate.getFullYear() === effectiveMaxDate.getFullYear() &&
          nextMonthDate.getMonth() > effectiveMaxDate.getMonth()))
    ) {
      return;
    }
    setViewDate(nextMonthDate);
  };

  const isDayDisabled = (day: number): boolean => {
    const dateToCheck = new Date(currentYear, currentMonth, day, 23, 59, 59);
    if (effectiveMaxDate && dateToCheck > effectiveMaxDate) {
      return true;
    }
    if (minDate && dateToCheck < minDate) {
      return true;
    }
    return false;
  };

  const handleDaySelect = (day: number) => {
    if (isDayDisabled(day)) return;

    const newDate = new Date(currentYear, currentMonth, day);
    const formatted = formatDateString(newDate, isShortYear, isMonthFirst);
    onChange?.(formatted);
    setViewDate(newDate);
    setIsOpen(false);
  };

  // ── Typed-input handler ──────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const masked = maskDateInput(rawVal);
    onChange?.(masked);

    // If user finished typing (10 chars for dd/mm/yyyy or 8 chars for dd/mm/yy)
    const targetLength = isShortYear ? 8 : 10;
    if (masked.length === targetLength) {
      const parsed = parseDateString(masked);
      if (parsed && !isNaN(parsed.getTime())) {
        // If not disabled by age/limits, sync calendar and close
        const isExceeding =
          effectiveMaxDate && parsed > effectiveMaxDate;
        const isUnderMin = minDate && parsed < minDate;

        if (!isExceeding && !isUnderMin) {
          setViewDate(parsed);
        }
        // Auto-close calendar when typing is complete
        setIsOpen(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Generate calendar grid
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const daysGrid: { day: number; isCurrentMonth: boolean; disabled: boolean }[] =
    [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    daysGrid.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      disabled: true,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push({
      day: d,
      isCurrentMonth: true,
      disabled: isDayDisabled(d),
    });
  }

  const remaining = 7 - (daysGrid.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      daysGrid.push({
        day: d,
        isCurrentMonth: false,
        disabled: true,
      });
    }
  }

  // Generate years list (sorted descending so recent eligible years appear first)
  const years: number[] = [];
  for (let y = effectiveMaxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Next month disabled state
  const isNextMonthDisabled = Boolean(
    effectiveMaxDate &&
      (currentYear > effectiveMaxDate.getFullYear() ||
        (currentYear === effectiveMaxDate.getFullYear() &&
          currentMonth >= effectiveMaxDate.getMonth())),
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-1.5 w-full relative ${containerClassName}`}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none"
        >
          {label}
        </label>
      )}

      <div className="relative w-full flex items-center">
        {/* Typeable text input */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          required={required}
          disabled={disabled}
          maxLength={isShortYear ? 8 : 10}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-lpignore="true"
          data-form-type="other"
          aria-autocomplete="none"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={() => !disabled && setIsOpen(true)}
          onFocus={() => !disabled && setIsOpen(true)}
          className={`
            w-full h-11 xl:h-12
            pl-4 pr-10
            bg-input-bg
            text-text-dark font-normal text-xs xl:text-sm
            border border-transparent
            rounded-radius-200
            transition-all duration-200 ease-in-out
            outline-none
            placeholder:text-gray-400
            cursor-text
            focus:border-primary-solid/40
            focus:ring-2
            focus:ring-primary-solid/10
            ${error ? "border-primary-solid ring-2 ring-border-secondary" : ""}
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${className}
          `}
        />

        {/* Calendar toggle button */}
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              setIsOpen((prev) => !prev);
              if (!isOpen) {
                inputRef.current?.focus();
              }
            }
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-text-dark/60 hover:text-text-dark transition-colors cursor-pointer select-none focus:outline-none"
          aria-label="Toggle calendar"
        >
          <FiCalendar className="w-4 h-4 text-text-dark/60 shrink-0" />
        </button>

        {mounted && isOpen && (
          <div
            className={`
              absolute top-full mt-2 z-50
              w-76 sm:w-80
              bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 sm:p-4
              animate-in fade-in zoom-in-95 duration-150 select-none
              max-w-[calc(100vw-2rem)]
              ${
                align === "right"
                  ? "right-0 left-auto"
                  : align === "center"
                  ? "left-1/2 -translate-x-1/2"
                  : "left-0 right-auto"
              }
            `}
          >
            {/* Header: Clean native Month/Year Dropdowns & Prev/Next Buttons */}
            <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-gray-100 gap-1.5 w-full">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {/* Month Select */}
                <select
                  value={String(currentMonth)}
                  onChange={(e) =>
                    setViewDate(
                      new Date(currentYear, parseInt(e.target.value, 10), 1),
                    )
                  }
                  className="flex-1 min-w-0 h-8 px-2 py-0 text-xs font-bold text-neutral-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg outline-none cursor-pointer transition-colors"
                >
                  {MONTHS.map((m, idx) => {
                    const isMonthDisabled = Boolean(
                      effectiveMaxDate &&
                        currentYear === effectiveMaxDate.getFullYear() &&
                        idx > effectiveMaxDate.getMonth(),
                    );
                    return (
                      <option
                        key={m}
                        value={String(idx)}
                        disabled={isMonthDisabled}
                      >
                        {m}
                      </option>
                    );
                  })}
                </select>

                {/* Year Select */}
                <select
                  value={String(currentYear)}
                  onChange={(e) =>
                    setViewDate(
                      new Date(parseInt(e.target.value, 10), currentMonth, 1),
                    )
                  }
                  className="w-20 sm:w-22 shrink-0 h-8 px-2 py-0 text-xs font-bold text-neutral-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg outline-none cursor-pointer transition-colors"
                >
                  {years.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-0.5 shrink-0 ml-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-neutral-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={isNextMonthDisabled}
                  onClick={handleNextMonth}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                    isNextMonthDisabled
                      ? "text-gray-300 cursor-not-allowed opacity-40"
                      : "text-gray-500 hover:text-neutral-900 hover:bg-gray-100 cursor-pointer"
                  }`}
                  title="Next month"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <span
                  key={day}
                  className="text-[11px] font-semibold text-neutral-400 py-0.5"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysGrid.map((item, index) => {
                const isSelected =
                  selectedDate &&
                  item.isCurrentMonth &&
                  item.day === selectedDate.getDate() &&
                  currentMonth === selectedDate.getMonth() &&
                  currentYear === selectedDate.getFullYear();

                const isToday =
                  item.isCurrentMonth &&
                  item.day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear();

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={!item.isCurrentMonth || item.disabled}
                    onClick={() => handleDaySelect(item.day)}
                    className={`
                      w-8.5 h-8.5 mx-auto flex items-center justify-center text-xs rounded-lg transition-all font-medium select-none
                      ${
                        !item.isCurrentMonth || item.disabled
                          ? "text-gray-300 cursor-not-allowed opacity-25"
                          : isSelected
                          ? "bg-secondary text-white font-bold shadow-xs cursor-pointer"
                          : isToday
                          ? "bg-amber-50 text-secondary font-bold border border-secondary/40 cursor-pointer"
                          : "text-neutral-700 hover:bg-secondary/10 hover:text-secondary cursor-pointer"
                      }
                    `}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>

            {/* Age helper badge for Date of Birth fields */}
            {effectiveMinAge !== undefined && (
              <div className="mt-2.5 pt-2 border-t border-gray-100 text-center">
                <span className="text-[10.5px] text-neutral-400 font-medium">
                  Must be at least {effectiveMinAge} years old
                </span>
              </div>
            )}
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
