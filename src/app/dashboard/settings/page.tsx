"use client";

import dynamic from "next/dynamic";

const SettingsPage = dynamic(
  () =>
    import("@/features/settings/pages/SettingsPage").then(
      (mod) => mod.SettingsPage
    ),
  { ssr: false }
);

export default function Settings() {
  return <SettingsPage />;
}
