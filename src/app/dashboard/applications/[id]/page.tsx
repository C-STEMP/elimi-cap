"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ApplicationDetailPageRedirect() {
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  useEffect(() => {
    if (id) {
      router.replace(`/applications/${id}`);
    }
  }, [id, router]);

  return null;
}

