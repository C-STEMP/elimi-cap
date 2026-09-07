"use client";

import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

interface InductionStrengthsWeaknessesCardProps {
  learningStrengths: string[];
  newStrength: string;
  setNewStrength: (val: string) => void;
  onAddStrength: (e: React.FormEvent) => void;
  onRemoveStrength: (idx: number) => void;
  learningWeaknesses: string[];
  newWeakness: string;
  setNewWeakness: (val: string) => void;
  onAddWeakness: (e: React.FormEvent) => void;
  onRemoveWeakness: (idx: number) => void;
}

export const InductionStrengthsWeaknessesCard: React.FC<InductionStrengthsWeaknessesCardProps> = ({
  learningStrengths,
  newStrength,
  setNewStrength,
  onAddStrength,
  onRemoveStrength,
  learningWeaknesses,
  newWeakness,
  setNewWeakness,
  onAddWeakness,
  onRemoveWeakness,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Strengths */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
          Learning Strengths
        </h3>
        <div className="flex flex-wrap gap-2">
          {learningStrengths.map((st, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fdf2f5] text-[#a31d38] text-xs font-semibold border border-[#a31d38]/20"
            >
              <span>{st}</span>
              <button
                type="button"
                onClick={() => onRemoveStrength(idx)}
                className="hover:text-red-700 cursor-pointer"
              >
                <FiTrash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a strength..."
            value={newStrength}
            onChange={(e) => setNewStrength(e.target.value)}
            className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs"
          />
          <Button type="button" size="sm" variant="outline" onClick={onAddStrength}>
            <FiPlus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Weaknesses */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base sm:text-lg font-bold text-neutral-primary">
          Learning Weaknesses
        </h3>
        <div className="flex flex-wrap gap-2">
          {learningWeaknesses.map((wk, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200"
            >
              <span>{wk}</span>
              <button
                type="button"
                onClick={() => onRemoveWeakness(idx)}
                className="hover:text-red-700 cursor-pointer"
              >
                <FiTrash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a weakness / area for improvement..."
            value={newWeakness}
            onChange={(e) => setNewWeakness(e.target.value)}
            className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-[#f8f9fa] text-xs"
          />
          <Button type="button" size="sm" variant="outline" onClick={onAddWeakness}>
            <FiPlus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};
