"use client";

import React from "react";
import { EvidenceItemCard, type EvidenceItem } from "./EvidenceItemCard";

interface EvidenceListSectionProps {
  items: EvidenceItem[];
  onSendFeedback: (item: EvidenceItem) => void;
  onApprove: (item: EvidenceItem) => void;
}

export const EvidenceListSection: React.FC<EvidenceListSectionProps> = ({
  items,
  onSendFeedback,
  onApprove,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-lg font-bold text-neutral-primary">
        Evidence
      </h3>

      <div className="flex flex-col gap-3.5 w-full">
        {items.map((item) => (
          <EvidenceItemCard
            key={item.id}
            item={item}
            onSendFeedback={onSendFeedback}
            onApprove={onApprove}
          />
        ))}
      </div>
    </div>
  );
};
