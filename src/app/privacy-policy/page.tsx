import type { Metadata } from "next";
import { PrivacyPolicyView } from "@/features/shared/landing/components/PrivacyPolicyView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for ELIMI CAP describing our policies and procedures on the collection, use, and disclosure of your information.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
