"use client";

import React from "react";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";

export const LearningPromoCard: React.FC = () => {
  return (
    <div className="bg-[#FEEED3] rounded-[22px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-[#fae7c9] h-full">
      <div className="flex-1 flex flex-col justify-between h-full items-start">
        <div>
          <h2 className="text-xl lg:text-[28px] font-bold text-black mb-2 tracking-tight leading-snug">
            Missing a skill or need a refresher?
          </h2>
          <p className="text-[#191918] text-xs lg:text-base leading-relaxed max-w-xs mb-6">
            Take the next step with courses that help you build the skills
            needed for certification.
          </p>
        </div>
        <button
          type="button"
          className="bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer active:scale-95"
        >
          Start Learning
        </button>
      </div>

      <div className="relative w-36 h-36 lg:w-44 lg:h-44 shrink-0 flex items-center justify-center self-center">
        <Image
          src={ASSETS_URL.learningBooks}
          alt="3D Learning Books and Mortarboard Cap"
          fill
          sizes="(max-width: 1024px) 144px, 176px"
          loading="eager"
          className="object-contain drop-shadow-md rounded-xl"
        />
      </div>
    </div>
  );
};
