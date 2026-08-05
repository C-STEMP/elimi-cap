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
  const parts = str.trim().split(/[/.-]/);
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) {
      year += 2000;
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
  return null;
};

const formatDateString = (date: Date, isShortYear: boolean): string => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = isShortYear
    ? String(date.getFullYear()).slice(-2)
    : String(date.getFullYear());
  return `${d}/${m}/${y}`;
};

/**
 * Coerces raw typed input into a guided dd/mm/yyyy mask.
 * Inserts slashes automatically so users don't need to type them.
 */
function maskDateInput(raw: string, prev: string): string {
  // Strip everything that isn't a digit or slash
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
  minYear = 1940,
  maxYear = 2035,
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

  const selectedDate = parseDateString(value);
  const defaultViewYear = maxYear || new Date().getFullYear() - 18;
  const [viewDate, setViewDate] = useState<Date>(
    () => selectedDate || new Date(defaultViewYear, 0, 1),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDaySelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const isShortYear =
      placeholder.includes("yy") && !placeholder.includes("yyyy");
    const formatted = formatDateString(newDate, isShortYear);
    if (onChange) {
      onChange(formatted);
    }
    setIsOpen(false);
  };

  // ── Typed-input handler ──────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prev = value;
    const masked = maskDateInput(e.target.value, prev);
    onChange?.(masked);

    // Sync calendar view when a valid date is typed
    const parsed = parseDateString(masked);
    if (parsed) setViewDate(parsed);
  };

  // Generate calendar grid
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const daysGrid: { day: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    daysGrid.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push({
      day: d,
      isCurrentMonth: true,
    });
  }

  const remaining = 7 - (daysGrid.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      daysGrid.push({
        day: d,
        isCurrentMonth: false,
      });
    }
  }

  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
  }

  const today = new Date();

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
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          required={required}
          disabled={disabled}
          maxLength={10} /* dd/mm/yyyy = 10 chars */
          onChange={handleInputChange}
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

        {/* Calendar toggle button — same look as before */}
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) setIsOpen(!isOpen);
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
              w-70 sm:w-72.5
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
            {/* Header: Month/Year Dropdowns & Prev/Next Buttons */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 gap-1">
              <div className="flex items-center gap-1">
                <select
                  value={currentMonth}
                  onChange={(e) =>
                    setViewDate(
                      new Date(currentYear, parseInt(e.target.value, 10), 1),
                    )
                  }
                  className="text-xs xl:text-sm font-bold text-neutral-primary bg-transparent outline-none cursor-pointer hover:text-secondary py-1 rounded"
                >
                  {MONTHS.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={currentYear}
                  onChange={(e) =>
                    setViewDate(
                      new Date(parseInt(e.target.value, 10), currentMonth, 1),
                    )
                  }
                  className="text-xs xl:text-sm font-bold text-neutral-primary bg-transparent outline-none cursor-pointer hover:text-secondary py-1 rounded"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-neutral-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-neutral-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Next month"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <span
                  key={day}
                  className="text-[11px] font-semibold text-neutral-400 py-1"
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
                    disabled={!item.isCurrentMonth}
                    onClick={() => handleDaySelect(item.day)}
                    className={`
                      w-8 h-8 mx-auto flex items-center justify-center text-xs rounded-lg transition-all cursor-pointer font-medium
                      ${
                        !item.isCurrentMonth
                          ? "text-gray-300 cursor-not-allowed opacity-30"
                          : isSelected
                          ? "bg-secondary text-white font-bold shadow-xs"
                          : isToday
                          ? "bg-gray-100 text-secondary font-bold border border-secondary/30"
                          : "text-neutral-700 hover:bg-secondary/10 hover:text-secondary"
                      }
                    `}
                  >
                    {item.day}
                  </button>
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
