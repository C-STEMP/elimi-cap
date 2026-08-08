"use client";

import dynamic from "next/dynamic";

const CenterVerifyIdentity = dynamic(
  () =>
    import(
      "@/src/features/assessment-centre/features/Onboarding/pages/CenterVerifyIdentity"
    ).then((mod) => mod.CenterVerifyIdentity),
  { ssr: false }
);

export default function CenterVerifyIdentityPage() {
  return <CenterVerifyIdentity />;
}
