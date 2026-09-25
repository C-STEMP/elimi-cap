import { orchestratorClient } from "@/src/lib/api/orchestrator";
import { capClient } from "@/src/lib/api/cap";

export interface MessageAttachment {
  id?: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string;
  body: string;
  attachments?: MessageAttachment[];
  read?: boolean;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  title?: string;
  subject?: string;
  recipientId?: string;
  recipientName?: string;
  recipientRole?: string;
  recipientAvatar?: string;
  lastMessage?: MessageItem;
  unreadCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SendMessagePayload {
  body: string;
  attachments?: MessageAttachment[];
}

export interface StartConversationPayload {
  recipientId: string;
  subject?: string;
  message: string;
  attachments?: MessageAttachment[];
}

export interface BroadcastMessagePayload {
  recipientGroup:
    | "all_candidates"
    | "all_assessors"
    | "all_staff"
    | "trade_group"
    | string;
  tradeId?: string;
  message: string;
  subject?: string;
}

export async function getConversationsApi(params?: {
  limit?: number;
  cursor?: string;
  q?: string;
}): Promise<ConversationItem[]> {
  const res = await orchestratorClient.get<{ data: ConversationItem[] }>(
    "/conversations",
    {
      params,
    },
  );
  return res.data?.data || [];
}

export async function getConversationDetailsApi(
  id: string,
): Promise<ConversationItem | null> {
  try {
    const res = await orchestratorClient.get<{ data: ConversationItem }>(
      `/conversations/${id}`,
    );
    return res.data?.data || null;
  } catch {
    return null;
  }
}

export async function getConversationMessagesApi(
  conversationId: string,
  params?: { limit?: number; cursor?: string },
): Promise<MessageItem[]> {
  const res = await orchestratorClient.get<{ data: MessageItem[] }>(
    `/conversations/${conversationId}/messages`,
    {
      params,
    },
  );
  return res.data?.data || [];
}

export async function sendMessageApi(
  conversationId: string,
  payload: SendMessagePayload,
): Promise<MessageItem> {
  const res = await orchestratorClient.post<{ data: MessageItem }>(
    `/conversations/${conversationId}/messages`,
    payload,
  );
  return (res.data as any)?.data || res.data;
}

export async function startConversationApi(
  payload: StartConversationPayload,
): Promise<ConversationItem> {
  const res = await orchestratorClient.post<{ data: ConversationItem }>(
    "/conversations",
    payload,
  );
  return (res.data as any)?.data || res.data;
}

export async function sendBroadcastMessageApi(
  payload: BroadcastMessagePayload,
): Promise<{ message: string }> {
  try {
    const res = await capClient.post<{ message: string }>(
      "/centre/broadcast",
      payload,
    );
    return res.data;
  } catch {
    // Neither endpoint is in the CAP spec yet; let a failure surface instead
    // of reporting a broadcast that was never sent.
    const res = await orchestratorClient.post<{ message: string }>(
      "/conversations/broadcast",
      payload,
    );
    return res.data;
  }
}
