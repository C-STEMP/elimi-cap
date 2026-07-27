"use client";

import dynamic from "next/dynamic";

const EnterOtpEmail = dynamic(
  () =>
    import("@/features/auth/pages/EnterOtpEmail").then(
      (mod) => mod.EnterOtpEmail
    ),
  { ssr: false }
);

export default function EnterOtpPage() {
  return <EnterOtpEmail />;
}
