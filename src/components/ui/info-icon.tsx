"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiInfo } from "react-icons/fi";

export interface InfoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  infoText?: string;
  sectionName?: string;
}

const DEFAULT_SECTION_INFO: Record<string, string> = {
  "Personal Details":
    "Provide your official personal details, date of birth, and nationality as they appear on your identification documents.",
  "Contact Information":
    "Enter your valid email address and primary telephone number for identity verification and updates.",
  "Residential Address":
    "Provide your country, current residential address, state of residence, and Local Government Area (LGA).",
  "Have You Completed An Assessment Before":
    "Indicate whether you have previously taken an ELIMI competency assessment or have a Unique Learner ID.",
  Accessibility:
    "Specify any special impairment or accessibility support required for your assessment process.",
  "Qualification Applying For":
    "Select the target qualification title, assessment type, and specific units for your RPL evaluation.",
  "Current Occupation":
    "Specify your current job role or trade discipline and total years of practical work experience.",
  "Employment History":
    "Provide details of past work history, employers, roles, and key responsibilities in your trade.",
  "Why are you applying for RPL?":
    "Explain your primary motivation for seeking Recognition of Prior Learning and expected outcomes.",
  "Evidence Summary":
    "Indicate the supporting documents, work samples, or certificates you can provide as RPL evidence.",
};

export const InfoIcon: React.FC<InfoIconProps> = ({
  size = 18,
  color = "#141B34",
  className = "",
  infoText,
  sectionName,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const displayText =
    infoText ||
    (sectionName && DEFAULT_SECTION_INFO[sectionName]) ||
    "Provide relevant details for this section to complete your profile.";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  return (
    <span
      ref={containerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className="relative inline-flex items-center group"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
        aria-label="Section Information"
        className="focus:outline-none cursor-pointer transition-transform hover:scale-110 active:scale-95 p-0.5 inline-flex items-center select-none"
      >
        <FiInfo size={size} color={color} className={`shrink-0 ${className}`} />
      </button>

      {isVisible && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 w-64 sm:w-72 p-3 bg-[#141B34] text-white text-xs rounded-xl shadow-md border border-[#2A3454] leading-relaxed animate-in fade-in zoom-in-95 duration-150 select-text pointer-events-none">
          <p className="font-normal text-white text-xs leading-relaxed">
            {displayText}
          </p>
        </div>
      )}
    </span>
  );
};
