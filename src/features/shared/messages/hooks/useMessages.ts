import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import {
  getConversationsApi,
  getConversationDetailsApi,
  getConversationMessagesApi,
  sendMessageApi,
  startConversationApi,
  sendBroadcastMessageApi,
  type SendMessagePayload,
  type StartConversationPayload,
  type BroadcastMessagePayload,
} from "../api/messages.api";

export const MESSAGE_QUERY_KEYS = {
  all: ["messages"] as const,
  conversations: (params?: { limit?: number; cursor?: string; q?: string }) =>
    [...MESSAGE_QUERY_KEYS.all, "conversations", params] as const,
  conversation: (id: string) =>
    [...MESSAGE_QUERY_KEYS.all, "conversation", id] as const,
  threadMessages: (
    conversationId: string,
    params?: { limit?: number; cursor?: string },
  ) =>
    [
      ...MESSAGE_QUERY_KEYS.all,
      "thread-messages",
      conversationId,
      params,
    ] as const,
};

export function useGetConversations(params?: {
  limit?: number;
  cursor?: string;
  q?: string;
}) {
  return useQuery({
    queryKey: MESSAGE_QUERY_KEYS.conversations(params),
    queryFn: () => getConversationsApi(params),
  });
}

export function useGetConversationDetails(id: string) {
  return useQuery({
    queryKey: MESSAGE_QUERY_KEYS.conversation(id),
    queryFn: () => getConversationDetailsApi(id),
    enabled: Boolean(id),
  });
}

export function useGetConversationMessages(
  conversationId: string,
  params?: { limit?: number; cursor?: string },
) {
  return useQuery({
    queryKey: MESSAGE_QUERY_KEYS.threadMessages(conversationId, params),
    queryFn: () => getConversationMessagesApi(conversationId, params),
    enabled: Boolean(conversationId),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: SendMessagePayload;
    }) => sendMessageApi(conversationId, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: MESSAGE_QUERY_KEYS.threadMessages(vars.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: MESSAGE_QUERY_KEYS.conversations(),
      });
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Message Failed",
        description: err.message || "Failed to send message.",
      });
    },
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: StartConversationPayload) =>
      startConversationApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MESSAGE_QUERY_KEYS.conversations(),
      });
      toast({
        type: "success",
        title: "Conversation Started",
        description: "Your message has been sent.",
      });
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Failed to Start Conversation",
        description: err.message || "Unable to send message.",
      });
    },
  });
}

export function useSendBroadcastMessage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: BroadcastMessagePayload) =>
      sendBroadcastMessageApi(payload),
    onSuccess: () => {
      toast({
        type: "success",
        title: "Broadcast Sent",
        description: "Broadcast message has been dispatched successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Broadcast Failed",
        description: err.message || "Unable to dispatch broadcast.",
      });
    },
  });
}
