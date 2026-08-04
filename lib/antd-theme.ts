import type { ThemeConfig } from "antd";

/**
 * Ant Design theme config that mirrors the project's design system.
 * Primary colour  → #aa1d3f  (brand red/burgundy)
 * Secondary/gold  → #f9a825  (amber/gold)
 */
export const antdTheme: ThemeConfig = {
  token: {
    // Brand colours
    colorPrimary: "#aa1d3f",
    colorLink: "#aa1d3f",
    colorLinkHover: "#8f1532",

    // Typography
    fontFamily:
      "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Input / form field background
    colorBgContainer: "#f5f6fa",
    colorBorder: "transparent",
    colorBorderSecondary: "#d9d9d9",

    // Text colours
    colorText: "#1e1e1e",
    colorTextSecondary: "#7a6b6e",
    colorTextPlaceholder: "#9ca3af",

    // Error
    colorError: "#aa1d3f",
    colorErrorBorder: "#b3261e",

    // Success / Info
    colorSuccess: "#16a34a",
    colorInfo: "#0284c7",

    // Control height for inputs/selects
    controlHeight: 44,
    controlHeightLG: 48,
    controlHeightSM: 36,
  },
  components: {
    Button: {
      primaryColor: "#ffffff",
      defaultBg: "#ffffff",
      borderRadius: 12,
      borderRadiusLG: 14,
    },
    Input: {
      activeBorderColor: "rgba(117, 21, 43, 0.4)",
      activeShadow: "0 0 0 2px rgba(117, 21, 43, 0.1)",
      hoverBorderColor: "#d9d9d9",
    },
    Select: {
      optionSelectedBg: "#f9f9f9",
      optionSelectedColor: "#1e1e1e",
      optionActiveBg: "#fafafa",
    },
    Form: {
      labelColor: "#1e1e1e",
      labelFontSize: 13,
    },
  },
};
