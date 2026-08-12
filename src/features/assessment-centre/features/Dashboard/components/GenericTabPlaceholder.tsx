"use client";

import React from "react";
import { FiGrid } from "react-icons/fi";

interface TabPlaceholderProps {
  title: string;
  description: string;
}

export const GenericTabPlaceholder: React.FC<TabPlaceholderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="bg-white rounded-3xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-2xs border border-gray-100/80 min-h-[450px] w-full select-none">
      <div className="w-20 h-20 bg-amber-50 text-[#fbab2a] rounded-full flex items-center justify-center border-4 border-amber-100/70 mb-4 shadow-2xs">
        <FiGrid className="w-9 h-9 stroke-[1.8]" />
      </div>

      <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
        {title}
      </h3>

      <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-2 max-w-md leading-relaxed">
        {description}
      </p>
    </div>
  );
};
