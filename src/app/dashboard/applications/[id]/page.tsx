"use client";

import { useParams } from "next/navigation";
import { ApplicationDetailsPage } from "@/features/candidate/features/Application/pages/ApplicationDetailsPage";

export default function ApplicationDetailPage() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  return <ApplicationDetailsPage id={id} />;
}

