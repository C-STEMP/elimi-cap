"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { useGetMe } from "@/src/features/shared/account/hooks";
import { ApplicationDetailsPage } from "@/src/features/candidate/features/Application/pages/ApplicationDetailsPage";
import { AssessorApplicationRouteView } from "@/src/features/assessor/features/Applications/components/AssessorApplicationRouteView";
import { CentreApplicationRouteView } from "@/src/features/assessment-centre/features/Applications/components/CentreApplicationRouteView";

export default function ApplicationDetailPage() {
  const params = useParams();
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

  if (isAssessor) {
    return <AssessorApplicationRouteView id={id} />;
  }

  if (isCentre) {
    return <CentreApplicationRouteView id={id} />;
  }

  return <ApplicationDetailsPage id={id} />;
}
