import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  getCandidateEventsApi,
  getApplicationEventsApi,
  type NotificationListParams,
} from "../api/notifications.api";

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  list: (params?: NotificationListParams) =>
    [...NOTIFICATION_QUERY_KEYS.all, "list", params] as const,
  unreadCount: () => [...NOTIFICATION_QUERY_KEYS.all, "unread-count"] as const,
  candidateEvents: (params?: { limit?: number; cursor?: string }) =>
    ["candidate-events", params] as const,
  applicationEvents: (applicationId: string) =>
    ["application-events", applicationId] as const,
};

export function useGetNotifications(params?: NotificationListParams) {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => getNotificationsApi(params),
  });
}

export function useGetUnreadNotificationCount() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: () => getUnreadCountApi(),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationReadApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsReadApi(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotificationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

export function useGetCandidateEvents(params?: {
  limit?: number;
  cursor?: string;
}) {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.candidateEvents(params),
    queryFn: () => getCandidateEventsApi(params),
  });
}

export function useGetApplicationEvents(
  applicationId: string,
  params?: { limit?: number; cursor?: string },
) {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.applicationEvents(applicationId),
    queryFn: () => getApplicationEventsApi(applicationId, params),
    enabled: Boolean(applicationId),
  });
}
