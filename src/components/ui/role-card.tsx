"use client";

import React from "react";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import { ASSETS_URL } from "@/assets";

export type RoleHoverColor = "yellow" | "red" | "black";

export interface RoleCardProps {
  id: string;
  title: string;
  description: string;
  index?: number;
  hoverColor?: RoleHoverColor;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const CARD_IMAGES: Record<RoleHoverColor, any> = {
  yellow: ASSETS_URL.cardYellow,
  red: ASSETS_URL.cardRed,
  black: ASSETS_URL.cardBlack,
};

const COLOR_CYCLE: RoleHoverColor[] = ["yellow", "red", "black"];

export const RoleCard: React.FC<RoleCardProps> = ({
  id,
  title,
  description,
  index = 0,
  hoverColor,
  isSelected = false,
  onSelect,
}) => {
  const effectiveColor: RoleHoverColor =
    hoverColor || COLOR_CYCLE[index % COLOR_CYCLE.length];
  const activeImage = CARD_IMAGES[effectiveColor];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(id)}
      className="group relative w-full max-w-109.75 aspect-439/199 rounded-[10px] flex items-end justify-between px-4 sm:px-8 pb-4 sm:pb-7 text-left select-none cursor-pointer overflow-hidden focus:outline-none active:scale-[0.995] transition-all duration-300 ease-out hover:translate-x-1.5"
    >
      <Image
        src={ASSETS_URL.cardWhite}
        alt="Default Card Background"
        fill
        priority
        loading="eager"
        sizes="(max-width: 439px) 100vw, 439px"
        className={`object-contain rounded-[10px] pointer-events-none transition-opacity duration-500 ease-in-out ${
          isSelected ? "opacity-0" : "opacity-100 group-hover:opacity-0"
        }`}
      />

      <Image
        src={activeImage}
        alt={`${effectiveColor} Card Background`}
        fill
        priority
        loading="eager"
        sizes="(max-width: 439px) 100vw, 439px"
        className={`object-contain rounded-[10px] pointer-events-none transition-opacity duration-500 ease-in-out ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <div className="relative z-10 flex flex-col gap-0.5 pr-2 sm:pr-4 pb-1">
        <h3
          className={`text-base sm:text-xl xl:text-[22px] font-extrabold tracking-tight transition-colors duration-500 ease-in-out ${
            isSelected
              ? "text-white"
              : "text-neutral-primary group-hover:text-white"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-[11px] sm:text-xs xl:text-sm font-normal transition-colors duration-500 ease-in-out ${
            isSelected
              ? "text-white/90"
              : "text-neutral-secondary group-hover:text-white/90"
          }`}
        >
          {description}
        </p>
      </div>

      <div className="relative z-10 shrink-0 pb-1">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isSelected
              ? "bg-white text-neutral-primary shadow-lg"
              : "bg-transparent text-neutral-primary group-hover:bg-white group-hover:text-neutral-primary group-hover:shadow-lg"
          }`}
        >
          <FiArrowRight className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
};
