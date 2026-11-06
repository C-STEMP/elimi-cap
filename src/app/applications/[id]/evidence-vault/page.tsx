"use client";

import React, { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { useGetMe } from "@/src/features/shared/account/hooks";
import { EvidenceVaultPage } from "@/features/shared/evidence-vault/pages/EvidenceVaultPage";
import { AssessorApplicationRouteView } from "@/src/features/assessor/features/Applications/components/AssessorApplicationRouteView";
import { CentreApplicationRouteView } from "@/src/features/assessment-centre/features/Applications/components/CentreApplicationRouteView";
import { Loader } from "@/src/components/ui/loader";

export default function EvidenceVaultRoute() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const user = useAppSelector((state) => state.auth.user);
  const { data: meData } = useGetMe();

  const fromParam = searchParams.get("from");

  const isAssessor =
    fromParam === "assessor" ||
    (!fromParam && user?.role?.toLowerCase()?.includes("assessor"));

  const isCentre =
    fromParam === "centre" ||
    fromParam === "assessment-centre" ||
    (!fromParam &&
      !isAssessor &&
      (user?.role?.toLowerCase()?.includes("centre") ||
        user?.role?.toLowerCase()?.includes("center") ||
        Boolean(user?.centreRole) ||
        Boolean(meData?.centres && meData.centres.length > 0)));

  useEffect(() => {
    if (isAssessor && id) {
      router.replace(
        `/assessor/dashboard/applications?appId=${id}&view=evidence_vault`,
      );
    }
  }, [isAssessor, id, router]);

  if (isAssessor) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <Loader tip="Loading evidence vault..." />
      </div>
    );
  }

  if (isCentre) {
    return (
      <CentreApplicationRouteView
        id={id}
        initialShowEvidenceVault={true}
        isStandaloneEvidenceVaultRoute={true}
      />
    );
  }

  return <EvidenceVaultPage applicationId={id} />;
}
