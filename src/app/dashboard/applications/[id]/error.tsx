"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { FiAlertCircle, FiArrowLeft, FiRefreshCw } from "react-icons/fi";

export default function ApplicationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application detail error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
        <FiAlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Application Unavailable
      </h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        We couldn&apos;t load the application details at this time. The application might have been moved or there is a temporary network issue.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>
        <Link href="/dashboard/applications">
          <Button className="flex items-center gap-2">
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to My Applications</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
