"use client";

import dynamic from "next/dynamic";

const RPLExperienceTrade = dynamic(
  () =>
    import("@/features/candidate/features/rpl/pages/ExperienceTrade").then(
      (mod) => mod.RPLExperienceTrade
    ),
  { ssr: false }
);

export default function RPLExperienceTradePage() {
  return <RPLExperienceTrade />;
} 
