"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EvidenceVaultPage } from "@/features/shared/evidence-vault/pages/EvidenceVaultPage";

export default function EvidenceVaultRoute() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  return <EvidenceVaultPage applicationId={id} />;
}

