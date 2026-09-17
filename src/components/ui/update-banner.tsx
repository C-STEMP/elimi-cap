"use client";

import { useEffect, useState } from "react";
import { FiRefreshCw, FiX } from "react-icons/fi";

const POLL_INTERVAL_MS = 10 * 60 * 1000; 
const CURRENT_BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || "";

export function UpdateBanner() {
  const [isOutdated, setIsOutdated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!CURRENT_BUILD_ID) return;

    let isMounted = true;

    const checkForUpdate = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.buildId && data.buildId !== CURRENT_BUILD_ID) {
          setIsOutdated(true);
        }
      } catch {
        // Network hiccup — the next interval or focus event will retry.
      }
    };

    checkForUpdate();
    const intervalId = setInterval(checkForUpdate, POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (!isOutdated || dismissed) return null;

  return (
    <div className="w-full bg-[#8A1538] text-white px-4 py-2.5 flex items-center justify-center gap-3 text-xs sm:text-sm font-medium shadow-lg">
      <span className="text-center">
        You&apos;re using an older version of the application. Please update
        to get the latest features and fixes.
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1.5 bg-white text-[#8A1538] font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-white/90 transition-colors cursor-pointer shrink-0"
      >
        <FiRefreshCw className="w-3.5 h-3.5" />
        Update Now
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss update notice"
        className="text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}
