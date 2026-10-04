"use client";

import React from "react";

interface PortfolioSectionProps {
  number: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/** One numbered heading of the candidate portfolio (Induction, Profile, …). */
export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  number,
  title,
  description,
  children,
}) => (
  <section className="flex flex-col gap-4 w-full">
    <div className="flex flex-col gap-1">
      <h2 className="text-lg sm:text-xl font-extrabold text-neutral-primary tracking-tight">
        {number}. {title}
      </h2>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500">{description}</p>
      )}
    </div>
    <div className="flex flex-col gap-3.5">{children}</div>
  </section>
);
