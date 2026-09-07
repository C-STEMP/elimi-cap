"use client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AssessorDashboardPage() {
  redirect("/assessor/dashboard/overview");
}
