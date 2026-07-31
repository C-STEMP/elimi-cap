"use client";

import React from "react";
import { useToast } from "@/components/ui/toast";
import { RESOURCES_LIST, ResourceRecord } from "../utils/evidenceConstants";
import Image from "next/image";
import { ASSETS_URL } from "@/assets";

export const ResourcesSection: React.FC = () => {
  const { toast } = useToast();

  return (
    <div className="border border-[#F7F4EF] p-4 rounded-2xl bg-white">
      <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-4">
        Resources
      </h2>
      <div className="flex flex-col gap-4">
        {RESOURCES_LIST.map((res: ResourceRecord) => (
          <div
            key={res.id}
            className="bg-input-bg rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 sm:w-15 h-10 sm:h-14 bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                <Image
                  src={ASSETS_URL.pdfImg}
                  width={20}
                  height={20}
                  className=""
                  alt="pdf_img"
                />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[#191918] font-medium text-lg sm:text-2xl leading-snug">
                  {res.name}
                </h4>
                <span className="text-[#191918]/50 text-xs lg:text-base mt-1">
                  {res.size}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                toast({
                  type: "success",
                  title: "Resource Download",
                  description: `Downloading ${res.name}`,
                })
              }
              className="w-7 h-7 bg-[#1E7F4C1A] hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label={`Download ${res.name}`}
            >
              <Image
                src={ASSETS_URL.downloadIcon}
                width={20}
                height={20}
                className=""
                alt="download_icon"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
