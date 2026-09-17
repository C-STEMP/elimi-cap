"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { FiWifiOff } from "react-icons/fi";

const PROBE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const SLOW_LATENCY_MS = 1500; // a tiny JSON ping taking this long signals real network trouble
const SLOW_DOWNLINK_MBPS = 0.5;
const SLOW_EFFECTIVE_TYPES = new Set(["slow-2g", "2g"]);

// The Network Information API (navigator.connection) only exists in
// Chromium-based browsers, so it's treated as a bonus signal, not the only
// one — the latency probe below covers Safari/Firefox too.
interface NetworkInformationLike extends EventTarget {
  effectiveType?: string;
  downlink?: number;
}

function getConnection(): NetworkInformationLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as unknown as { connection?: NetworkInformationLike }).connection;
}

// navigator.onLine and navigator.connection are browser-only globals that
// don't exist during SSR — useSyncExternalStore lets React read them safely
// without a hydration mismatch (the server snapshot assumes the happy path).
function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}
const getOnlineSnapshot = () => navigator.onLine;
const getServerOnlineSnapshot = () => true;

function subscribeConnectionChange(callback: () => void) {
  const connection = getConnection();
  connection?.addEventListener("change", callback);
  return () => connection?.removeEventListener("change", callback);
}
function getSlowByApiSnapshot() {
  const connection = getConnection();
  if (!connection) return false;
  return (
    SLOW_EFFECTIVE_TYPES.has(connection.effectiveType || "") ||
    (typeof connection.downlink === "number" &&
      connection.downlink > 0 &&
      connection.downlink < SLOW_DOWNLINK_MBPS)
  );
}
const getServerSlowByApiSnapshot = () => false;

export function NetworkStatusBanner() {
  const isOnline = useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );
  const isSlowByApi = useSyncExternalStore(
    subscribeConnectionChange,
    getSlowByApiSnapshot,
    getServerSlowByApiSnapshot,
  );
  const [isSlowByLatency, setIsSlowByLatency] = useState(false);

  // Cross-browser fallback: time a real request to our own lightweight
  // version endpoint. A tiny JSON response taking this long points to the
  // network, not the server.
  useEffect(() => {
    let cancelled = false;

    const probeLatency = async () => {
      if (!navigator.onLine) return;
      const start = performance.now();
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const elapsed = performance.now() - start;
        if (!cancelled && res.ok) {
          setIsSlowByLatency(elapsed > SLOW_LATENCY_MS);
        }
      } catch {
        // A failed request here doesn't necessarily mean "slow" — the
        // online-status check above already covers being fully disconnected.
      }
    };

    probeLatency();
    const intervalId = setInterval(probeLatency, PROBE_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") probeLatency();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="w-full bg-gray-800 text-white px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
        <FiWifiOff className="w-4 h-4 shrink-0" />
        <span>
          You&apos;re offline. Some features may not work until your
          connection is restored.
        </span>
      </div>
    );
  }

  if (isSlowByApi || isSlowByLatency) {
    return (
      <div className="w-full bg-amber-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
        <FiWifiOff className="w-4 h-4 shrink-0" />
        <span>
          Your internet connection seems slow. Pages may take longer to load.
        </span>
      </div>
    );
  }

  return null;
}
