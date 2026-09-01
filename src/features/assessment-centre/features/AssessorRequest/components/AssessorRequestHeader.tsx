"use client";

import React from "react";
import { useGetRetainedRequestDetail } from "@/src/features/shared/centre/hooks";

interface AssessorRequestHeaderProps {
  selectedAssessorRequestId: string | null;
  onBackToList: () => void;
}

export const AssessorRequestHeader: React.FC<AssessorRequestHeaderProps> = ({
  selectedAssessorRequestId,
  onBackToList,
}) => {
  const { data: requestDetail } = useGetRetainedRequestDetail(
    selectedAssessorRequestId || "",
    { enabled: !!selectedAssessorRequestId },
  );

  if (selectedAssessorRequestId) {
    const assessorName =
      requestDetail?.assessor?.name ||
      (requestDetail?.assessorId
        ? `Assessor (${requestDetail.assessorId.slice(0, 8)})`
        : "Assessor");

    return (
      <div className="flex flex-col gap-1 pt-2">
        <button
          type="button"
          onClick={onBackToList}
          className="flex items-center gap-2 text-white font-bold text-2xl lg:text-3xl tracking-tight hover:opacity-90 text-left cursor-pointer"
        >
          <span className="text-xl font-bold">&lt;</span>
          <span>{assessorName}</span>
        </button>
        <div className="flex items-center gap-2 text-xs lg:text-sm text-white/90 font-normal">
          <span
            onClick={onBackToList}
            className="hover:underline cursor-pointer"
          >
            Requests
          </span>
          <span>&gt;</span>
          <span>Assessor</span>
          <span>&gt;</span>
          <span className="font-semibold text-white">{assessorName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Assessor Request
        </h1>
      </div>
    </div>
  );
};
