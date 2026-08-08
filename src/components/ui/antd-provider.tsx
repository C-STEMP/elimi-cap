"use client";

import React from "react";
import { ConfigProvider } from "antd";
import { antdTheme } from "@/src/lib/antd-theme";

/**
 * Applies the project's antd theme globally to all antd components.
 * Must be a Client Component because ConfigProvider uses React context.
 * Placed inside AntdRegistry (which handles SSR style extraction).
 */
export const AntdProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>;
};
