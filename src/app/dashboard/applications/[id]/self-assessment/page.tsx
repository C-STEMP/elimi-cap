"use client";

import { useParams } from "next/navigation";
import { SelfAssessmentPage } from "@/features/candidate/features/self-assessment/pages/SelfAssessmentPage";

export default function Page() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  return <SelfAssessmentPage id={id} />;
}


