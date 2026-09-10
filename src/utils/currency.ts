/**
 * Currency formatting utilities for ELIMI CAP
 */

export interface FormatCurrencyOptions {
  showSymbol?: boolean;
  useGrouping?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Formats minor units (e.g. 15000000 kobo / cents) into localized currency.
 * 15000000 minor units / 100 -> ₦150,000 (standard 3-digit grouping, not 1,50,000)
 */
export function formatCurrency(
  amountMinorUnits?: string | number | null,
  currency: string = "NGN",
  options?: FormatCurrencyOptions,
): string {
  if (
    amountMinorUnits === undefined ||
    amountMinorUnits === null ||
    amountMinorUnits === ""
  ) {
    return "—";
  }

  const num =
    typeof amountMinorUnits === "string"
      ? parseFloat(amountMinorUnits)
      : amountMinorUnits;
  if (isNaN(num)) return "—";

  // Convert minor units to major units
  const majorUnits = num / 100;

  const minimumFractionDigits =
    options?.minimumFractionDigits ?? (majorUnits % 1 === 0 ? 0 : 2);
  const maximumFractionDigits = options?.maximumFractionDigits ?? 2;

  try {
    const formatted = new Intl.NumberFormat("en-NG", {
      style: options?.showSymbol !== false ? "currency" : "decimal",
      currency: currency || "NGN",
      useGrouping: options?.useGrouping !== false,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(majorUnits);

    return formatted;
  } catch {
    // Fallback: standard 3-digit grouping (e.g. 150,000)
    const symbol =
      currency === "NGN" ? "₦" : currency === "USD" ? "$" : `${currency} `;
    const parts = majorUnits.toFixed(maximumFractionDigits).split(".");
    const integerPart =
      options?.useGrouping !== false
        ? parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : parts[0];
    const decimalPart =
      parts[1] && parseInt(parts[1], 10) > 0 ? `.${parts[1]}` : "";
    return options?.showSymbol !== false
      ? `${symbol}${integerPart}${decimalPart}`
      : `${integerPart}${decimalPart}`;
  }
}
