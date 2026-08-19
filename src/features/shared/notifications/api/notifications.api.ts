import { orchestratorClient } from "@/src/lib/api/orchestrator";
import { capClient } from "@/src/lib/api/cap";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category?: "application" | "assessment" | "system" | "security";
  type?: string;
  read?: boolean;
  isUnread?: boolean;
  time?: string;
  timestamp?: string;
  createdAt?: string;
  link?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ApplicationEventItem {
  id: string;
  applicationId?: string;
  title: string;
  description: string;
  eventType: string;
  actorName?: string;
  actorRole?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationListParams {
  limit?: number;
  cursor?: string;
  read?: boolean;
  category?: string;
  status?: string;
}

export async function getNotificationsApi(
  params?: NotificationListParams,
): Promise<NotificationItem[]> {
  try {
    const res = await orchestratorClient.get<{ data: NotificationItem[] }>(
      "/notifications",
      {
        params,
      },
    );
    return res.data?.data || [];
  } catch {
    // If orchestrator notification endpoint is unavailable, query candidate events
    try {
      const capEvents = await capClient.get<{ data: ApplicationEventItem[] }>(
        "/candidate/events",
        { params },
      );
      return (capEvents.data?.data || []).map((ev) => ({
        id: ev.id,
        title: ev.title || "Application Update",
        description: ev.description || "",
        category: "application" as const,
        read: false,
        isUnread: true,
        timestamp: new Date(ev.occurredAt).toLocaleDateString("en-GB"),
        time: new Date(ev.occurredAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: ev.occurredAt,
        link: ev.applicationId
          ? `/dashboard/applications/${ev.applicationId}`
          : undefined,
      }));
    } catch {
      return [];
    }
  }
}

export async function getUnreadCountApi(): Promise<number> {
  try {
    const res = await orchestratorClient.get<{ data: { unreadCount: number } }>(
      "/notifications/unread-count",
    );
    return res.data?.data?.unreadCount ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationReadApi(id: string): Promise<void> {
  try {
    await orchestratorClient.patch(`/notifications/${id}/read`);
  } catch {
    // Graceful fallback
  }
}

export async function markAllNotificationsReadApi(): Promise<void> {
  try {
    await orchestratorClient.post("/notifications/mark-all-read");
  } catch {
    // Graceful fallback
  }
}

export async function deleteNotificationApi(id: string): Promise<void> {
  try {
    await orchestratorClient.delete(`/notifications/${id}`);
  } catch {
    // Graceful fallback
  }
}

export async function getCandidateEventsApi(params?: {
  limit?: number;
  cursor?: string;
}): Promise<ApplicationEventItem[]> {
  const res = await capClient.get<{ data: ApplicationEventItem[] }>(
    "/candidate/events",
    { params },
  );
  return res.data?.data || [];
}

export async function getApplicationEventsApi(
  applicationId: string,
  params?: { limit?: number; cursor?: string },
): Promise<ApplicationEventItem[]> {
  const res = await capClient.get<{ data: ApplicationEventItem[] }>(
    `/applications/${applicationId}/events`,
    { params },
  );
  return res.data?.data || [];
}
