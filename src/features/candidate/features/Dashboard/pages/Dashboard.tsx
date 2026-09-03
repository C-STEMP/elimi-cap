"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { HeaderBanner } from "@/features/candidate/features/Dashboard/components/HeaderBanner";
import { LearningPromoCard } from "@/features/candidate/features/Dashboard/components/LearningPromoCard";
import { StatsCards } from "@/features/candidate/features/Dashboard/components/StatsCards";
import { ApplicationsList } from "@/features/candidate/features/Dashboard/components/ApplicationsList";
import { UpcomingCard } from "@/features/candidate/features/Dashboard/components/UpcomingCard";
import { CalendarWidget } from "@/features/candidate/features/Dashboard/components/CalendarWidget";
import { VerifiedBadge } from "@/features/candidate/features/Dashboard/components/VerifiedBadge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetApplications } from "@/src/features/candidate/features/Application/hooks";
import { useCandidateProfile } from "@/src/features/shared/onboarding/hooks";
import { markVerified } from "@/store/slices/authSlice";
import { savePersona } from "@/src/lib/auth-storage";

export const Dashboard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const savedRPLIdentity = useAppSelector((s) => s.onboarding.rplIdentity);
  const { data: candidateProfile } = useCandidateProfile(true);
  const { data: applications, isLoading: appsLoading } = useGetApplications();

  const isVerified = Boolean(
    authUser?.isVerified ||
    candidateProfile?.identityVerified ||
    savedRPLIdentity?.isVerified,
  );

  React.useEffect(() => {
    savePersona("candidate");
    if (isVerified && !authUser?.isVerified) {
      dispatch(markVerified());
    }
  }, [isVerified, authUser?.isVerified, dispatch]);

  const allApplications = React.useMemo(() => {
    return applications || [];
  }, [applications]);

  // Handle redirect from payment callback
  React.useEffect(() => {
    const paymentParam = searchParams.get("payment");
    const referenceParam =
      searchParams.get("reference") || searchParams.get("trxref");

    if (paymentParam === "success" || referenceParam) {
      let targetId =
        searchParams.get("id") || searchParams.get("applicationId");

      if (!targetId && typeof window !== "undefined") {
        targetId =
          sessionStorage.getItem("pending_payment_application_id") ||
          localStorage.getItem("pending_payment_application_id") ||
          "";
      }

      if (!targetId && allApplications.length > 0) {
        const found =
          allApplications.find(
            (a) =>
              a.status === "in_progress" ||
              (a.status as string) === "submitted" ||
              a.currentStageKey === "payment",
          ) || allApplications[0];
        if (found) targetId = found.id;
      }

      if (targetId) {
        const params = new URLSearchParams();
        if (paymentParam) params.set("payment", paymentParam);
        else params.set("payment", "success");
        if (referenceParam) params.set("reference", referenceParam);

        router.replace(
          `/dashboard/applications/${targetId}?${params.toString()}`,
        );
      }
    }
  }, [searchParams, allApplications, router]);

  const firstName =
    authUser?.fullName?.split(" ")[0] ||
    authUser?.email?.split("@")[0] ||
    "User";

  const isRawId = (str?: string) => {
    if (!str) return false;
    if (/^[0-9A-Z]{20,}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(str))
      return true;
    return false;
  };

  const activeCount =
    allApplications.filter(
      (app) => app.status !== "certified" && app.status !== "rejected",
    ).length ?? 0;
  const completedCount =
    allApplications.filter((app) => app.status === "certified").length ?? 0;

  const applicationItems = allApplications.map((app) => {
    let status: "Not Started" | "In Progress" | "Completed" = "In Progress";
    if (app.status === "draft") {
      status = "Not Started";
    } else if (app.status === "certified") {
      status = "Completed";
    }

    const typeLabel = app.type === "NSQ" ? "Standard Assessment" : app.type;

    const rawTrade =
      (app as any).trade?.name ||
      (typeof (app as any).trade === "string" ? (app as any).trade : "");

    const tradeTitle = rawTrade && !isRawId(rawTrade) ? rawTrade : "";

    const title = tradeTitle || (app.type === "NSQ" ? "NSQ Assessment" : "RPL Assessment");
    const subtitle =
      app.type === "NSQ" ? "NSQ Standard Assessment" : "Recognition of Prior Learning";

    const statusLabel =
      app.status === "draft"
        ? "Draft"
        : app.status === "certified"
          ? "Completed"
          : "Awaiting Review";

    return {
      id: app.id,
      title,
      subtitle,
      status,
      statusLabel,
      type: app.type,
    };
  });

  const scheduledInterviewInfo = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      for (const app of allApplications) {
        const stored = localStorage.getItem(`elimi_interview_schedule_${app.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.scheduledAt) {
            return {
              appId: app.id,
              trade: (app as any).trade?.name || "Panel Interview",
              ...parsed,
            };
          }
        }
      }
    } catch {}
    return null;
  }, [allApplications]);

  const upcomingInterview = scheduledInterviewInfo
    ? {
        title: "Panel Interview",
        date: new Date(scheduledInterviewInfo.scheduledAt).toLocaleDateString("en-GB"),
        time: new Date(scheduledInterviewInfo.scheduledAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        liveUrl:
          scheduledInterviewInfo.mode === "online"
            ? scheduledInterviewInfo.link
            : undefined,
      }
    : null;

  const interviewDate = scheduledInterviewInfo?.scheduledAt || undefined;

  const isLoading = appsLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex flex-col min-h-screen"
    >
      <HeaderBanner userName={firstName} />

      <div className="max-w-7xl xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              <div className="md:col-span-8">
                <LearningPromoCard />
              </div>
              <div className="md:col-span-4">
                <StatsCards
                  activeCount={activeCount}
                  completedCount={completedCount}
                />
              </div>
            </div>

            <ApplicationsList
              applications={applicationItems}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <CalendarWidget panelInterviewDate={interviewDate} />
            <UpcomingCard interview={upcomingInterview} />
            <VerifiedBadge isVerified={isVerified} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
