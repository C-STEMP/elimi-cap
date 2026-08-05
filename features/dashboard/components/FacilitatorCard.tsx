"use client";

import React from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export interface FacilitatorData {
  name: string;
  avatar: string | StaticImageData;
  role: string;
  tags: string[];
}

interface FacilitatorCardProps {
  facilitator?: FacilitatorData | null;
  onRequestCall?: () => void;
  countdownTimer?: string;
}

export const FacilitatorCard: React.FC<FacilitatorCardProps> = ({
  facilitator,
  onRequestCall,
  countdownTimer,
}) => {
  const isAssigned = !!facilitator;

  return (
    <div className="bg-white rounded-[22px] p-6 shadow-lg border border-gray-100 flex flex-col items-center text-center justify-between h-full min-h-65">
      {!isAssigned ? (
        <div className="flex flex-col items-center justify-between h-full w-full">
          <div className="flex flex-col items-center my-auto">
            <div className="w-16 h-16 rounded-full bg-[#fdf2f4] border border-[#fce3e7] flex items-center justify-center mb-4">
              <FiUser className="w-7 h-7 text-[#f2a8b5] stroke-[1.5]" />
            </div>

            <h4 className="text-black font-bold text-base mb-2">
              No facilitator assigned yet
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed max-w-60 mb-4">
              A coordinator will be assigned to guide you once your first
              application is created.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="w-full bg-[#f8f8fb] text-gray-300 font-semibold text-xs py-3 rounded-xl cursor-not-allowed select-none mt-auto"
          >
            Request A Call
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-between h-full w-full">
          <div className="flex flex-col items-center my-auto">
            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-white shadow-lg shrink-0">
              <Image
                src={facilitator.avatar}
                alt={facilitator.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>

            <h4 className="text-black font-bold text-base mb-0.5">
              {facilitator.name}
            </h4>
            <p className="text-gray-400 text-xs font-normal mb-3">
              {facilitator.role}
            </p>

            <div className="flex items-center justify-center flex-wrap gap-2 mb-4">
              {facilitator.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#fdf2f4] text-[#a31d38] text-[11px] font-semibold px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {countdownTimer ? (
            <div className="w-full bg-[#fff8eb] border border-[#fde68a] text-[#fbab2a] font-bold text-base py-3 rounded-xl select-none mt-auto shadow-2xs">
              {countdownTimer}
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={onRequestCall}
              className="w-full bg-[#fbab2a]! hover:bg-[#e89b1f] active:scale-95 text-white font-semibold text-xs sm:text-sm py-3.5 rounded-xl transition-all shadow-lg cursor-pointer mt-auto"
            >
              Request A Call
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
