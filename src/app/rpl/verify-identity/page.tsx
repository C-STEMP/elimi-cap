"use client";

import dynamic from "next/dynamic";

const RPLVerifyIdentity = dynamic(
  () =>
    import("@/features/candidate/features/rpl/pages/VerifyIdentity").then(
      (mod) => mod.RPLVerifyIdentity
    ),
  { ssr: false }
);

export default function RPLVerifyIdentityPage() {
  return <RPLVerifyIdentity />;
}
