"use client";

import dynamic from "next/dynamic";

const RPLReviewSubmit = dynamic(
  () =>
    import("@/features/candidate/features/rpl/pages/ReviewSubmit").then(
      (mod) => mod.RPLReviewSubmit
    ),
  { ssr: false }
);

export default function RPLReviewSubmitPage() {
  return <RPLReviewSubmit />;
}
