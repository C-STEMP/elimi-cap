"use client";

import React from "react";
import { FiFolder, FiEye, FiTrash2 } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { EvidenceRecord } from "../utils/evidenceConstants";
import Image from "next/image";
import { pdfImg } from "@/assets";

interface EvidenceSectionProps {
  evidences: EvidenceRecord[];
  onPreview: (item: EvidenceRecord) => void;
  onDelete: (item: EvidenceRecord) => void;
  onOpenUploadModal: () => void;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  evidences,
  onPreview,
  onDelete,
  onOpenUploadModal,
}) => {
  return (
    <div className="border border-[#F7F4EF] p-4 rounded-2xl bg-white">
      <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight mb-4">
        Evidence
      </h2>
      {evidences.length > 0 ? (
        <div className="flex flex-col gap-4">
          {evidences.map((item) => (
            <div
              key={item.id}
              className="bg-input-bg rounded-[20px] p-4 sm:p-5 border border-gray-100/70 flex flex-col gap-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 sm:w-15 h-10 sm:h-14 bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    <Image
                      src={pdfImg}
                      width={20}
                      height={20}
                      className=""
                      alt="pdf_img"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[#191918] font-medium text-lg sm:text-2xl leading-snug">
                        {item.name}
                      </h4>
                      <div className="bg-[#1E7F4C]/10 text-[#1E7F4C] text-xs font-medium lg:text-sm px-4 py-1 rounded-full">
                        Approved
                      </div>
                    </div>

                    <span className="text-[#191918]/50 text-xs lg:text-base mt-1">
                      {item.size}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPreview(item)}
                    className="w-8 h-8 rounded bg-[#1E7F4C1A] hover:bg-black/20 flex items-center justify-center text-black transition-colors cursor-pointer shrink-0"
                    aria-label={`View ${item.name}`}
                  >
                    <FiEye className="w-4 sm:w-5 h-4 sm:h-5 stroke-2" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="w-8 h-8 rounded bg-[#B3261E1A] hover:bg-[#fce3e7] flex items-center justify-center text-border-secondary transition-colors cursor-pointer shrink-0"
                    aria-label={`Delete ${item.name}`}
                  >
                    <FiTrash2 className="w-4 sm:w-5 h-4 sm:h-5 stroke-2" />
                  </button>
                </div>
              </div>

              {item.issues && item.issues.length > 0 && (
                <ul className="mt-1 bg-border-secondary/20 rounded p-4 flex flex-col list-disc pl-8">
                  {item.issues.map((issue: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-border-secondary text-xs sm:text-sm font-normal leading-relaxed"
                    >
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-input-bg rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-[#fdf2f4] text-[#a31d38] flex items-center justify-center mb-4">
            <FiFolder className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-black mb-1">
            No Evidence Uploaded Yet
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-sm mb-6">
            Click &quot;Upload Evidence&quot; in the top header to upload all
            your evidence.
          </p>
          <Button
            type="button"
            variant="amber"
            size="md"
            onClick={onOpenUploadModal}
            className="bg-[#fbab2a] hover:bg-[#e89b1f] text-white font-bold px-6 py-3 rounded-xl shadow-xs"
          >
            Upload Evidence
          </Button>
        </div>
      )}
    </div>
  );
};
