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

function deriveTitle(raw: any, message: string): string {
  if (raw.title) return raw.title;
  if (raw.payload?.title) return raw.payload.title;
  if (raw.payload?.subject) return raw.payload.subject;
  if (raw.type) {
    return raw.type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
  }
  const lower = message.toLowerCase();
  if (lower.includes("payment")) return "Payment Received";
  if (lower.includes("submitted")) return "Application Submitted";
  if (lower.includes("facilitator")) return "Facilitator Update";
  if (lower.includes("awarding body")) return "Awarding Body Update";
  if (lower.includes("approved")) return "Application Approved";
  if (lower.includes("rejected")) return "Application Update";
  if (lower.includes("review")) return "Under Review";
  return "Notification";
}

function deriveCategory(
  raw: any,
  message: string,
): "application" | "assessment" | "system" | "security" {
  if (
    raw.category &&
    ["application", "assessment", "system", "security"].includes(raw.category)
  ) {
    return raw.category;
  }
  const lower = message.toLowerCase();
  if (
    lower.includes("payment") ||
    lower.includes("assessment") ||
    lower.includes("interview")
  ) {
    return "assessment";
  }
  if (
    lower.includes("security") ||
    lower.includes("password") ||
    lower.includes("login")
  ) {
    return "security";
  }
  return "application";
}

export function mapRawNotification(raw: any): NotificationItem {
  const message =
    raw.payload?.message ||
    raw.payload?.description ||
    raw.description ||
    raw.message ||
    raw.body ||
    "";

  const title = deriveTitle(raw, message);
  const description = message || title;
  const category = deriveCategory(raw, message);
  const isRead = Boolean(raw.readAt || raw.read || raw.isRead);
  const dateStr =
    raw.sentAt || raw.createdAt || raw.occurredAt || new Date().toISOString();
  const dateObj = new Date(dateStr);

  return {
    id: raw.id || String(Math.random()),
    title,
    description,
    category,
    type: raw.type || raw.channel,
    read: isRead,
    isUnread: !isRead,
    createdAt: dateStr,
    timestamp: isNaN(dateObj.getTime())
      ? ""
      : dateObj.toLocaleDateString("en-US"),
    time: isNaN(dateObj.getTime())
      ? ""
      : dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    link: raw.payload?.applicationId
      ? `/dashboard/applications/${raw.payload.applicationId}`
      : raw.link || raw.actionUrl || undefined,
    metadata: raw.payload || raw.metadata,
  };
}

export async function getNotificationsApi(
  params?: NotificationListParams,
): Promise<NotificationItem[]> {
  const queryParams = {
    platform: "cap",
    ...params,
  };
  try {
    const res = await orchestratorClient.get<{ data: any[] }>(
      "/notifications",
      {
        params: queryParams,
      },
    );
    const list = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
        ? res.data
        : [];
    return list.map(mapRawNotification);
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
        timestamp: new Date(ev.occurredAt).toLocaleDateString("en-US"),
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
