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
  platform?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  read?: boolean;
  unreadOnly?: boolean;
  category?: string;
  status?: string;
  search?: string;
}

export async function getNotificationsApi(
  params?: NotificationListParams,
): Promise<NotificationItem[]> {
  const queryParams = {
    platform: "cap",
    ...params,
  };
  try {
    const res = await orchestratorClient.get<{ data: NotificationItem[] }>(
      "/notifications",
      {
        params: queryParams,
      },
    );
    return res.data?.data || [];
  } catch {
    // If orchestrator notification endpoint is unavailable, query candidate events
    try {
      const capEvents = await capClient.get<{ data: ApplicationEventItem[] }>(
        "/candidate/events",
        { params: queryParams },
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

export async function getUnreadCountApi(params?: {
  platform?: string;
}): Promise<number> {
  const queryParams = {
    platform: "cap",
    ...params,
  };
  try {
    const res = await orchestratorClient.get<{ data: { unreadCount: number } }>(
      "/notifications/unread-count",
      {
        params: queryParams,
      },
    );
    return res.data?.data?.unreadCount ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationReadApi(
  id: string,
  params?: { platform?: string },
): Promise<void> {
  const queryParams = {
    platform: "cap",
    ...params,
  };
  try {
    await orchestratorClient.patch(`/notifications/${id}/read`, null, {
      params: queryParams,
    });
  } catch {
    // Graceful fallback
  }
}

export async function markAllNotificationsReadApi(params?: {
  platform?: string;
}): Promise<void> {
  const queryParams = {
    platform: "cap",
    ...params,
  };
  try {
    await orchestratorClient.post("/notifications/mark-all-read", null, {
      params: queryParams,
    });
  } catch {
    // Graceful fallback
  }
}

export async function deleteNotificationApi(
  id: string,
  params?: { platform?: string },
): Promise<void> {
  const queryParams = {
    platform: "cap",
    ...params,
  };
  try {
    await orchestratorClient.delete(`/notifications/${id}`, {
      params: queryParams,
    });
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
