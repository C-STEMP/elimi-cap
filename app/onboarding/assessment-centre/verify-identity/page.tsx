"use client";

import dynamic from "next/dynamic";

const CenterVerifyIdentity = dynamic(
  () =>
    import(
      "@/features/onboarding/pages/assessment-centre/CenterVerifyIdentity"
    ).then((mod) => mod.CenterVerifyIdentity),
  { ssr: false }
);

export default function CenterVerifyIdentityPage() {
  return <CenterVerifyIdentity />;
}
