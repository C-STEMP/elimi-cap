"use client";

import dynamic from "next/dynamic";

const EnterOtpEmail = dynamic(
  () =>
    import("@/src/features/shared/authentication/pages/EnterOtpEmail").then(
      (mod) => mod.EnterOtpEmail,
    ),
  { ssr: false },
);

export default function EnterOtpPage() {
  return <EnterOtpEmail />;
}
