"use client";

import { useParams } from "next/navigation";
import { CandidateApplicationFormView } from "@/src/features/candidate/features/Application/components/CandidateApplicationFormView";

export default function ApplicationFormRoute() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  return <CandidateApplicationFormView applicationId={id} />;
}
