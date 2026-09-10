"use client";

import React from "react";
import { FiChevronLeft } from "react-icons/fi";

interface IqamHeaderBannerProps {
  title: string;
  breadcrumbChild: string;
  onBack: () => void;
  actionButtonLabel?: string;
  onActionClick?: () => void;
}

export const IqamHeaderBanner: React.FC<IqamHeaderBannerProps> = () => {
  return null;
};
