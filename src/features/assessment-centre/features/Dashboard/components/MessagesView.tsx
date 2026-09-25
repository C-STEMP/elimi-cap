"use client";

import React, { useEffect, useState } from "react";
import { FiSearch, FiSend } from "react-icons/fi";
import { Avatar } from "@/src/components/ui/avatar";
import { useAppSelector } from "@/src/store/hooks";
import {
  useGetConversations,
  useGetConversationMessages,
  useSendMessage,
} from "@/src/features/shared/messages/hooks";

export const MessagesView: React.FC = () => {
  const authUser = useAppSelector((state) => state.auth.user);
  const currentUserId = authUser?.userId || authUser?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isConversationsError,
  } = useGetConversations({
    q: searchQuery || undefined,
  });

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) || null;

  const { data: messages = [], isLoading: isLoadingMessages } = useGetConversationMessages(
    selectedConversationId || "",
  );

  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedConversationId) return;

    sendMessage({
      conversationId: selectedConversationId,
      payload: { body: inputMessage.trim() },
    });
    setInputMessage("");
  };

  const isBroadcastConversation = (subject?: string) =>
    Boolean(subject?.toLowerCase().startsWith("broadcast"));

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-150">
        {/* Left Contact List Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl p-4 sm:p-5 shadow-2xs border border-gray-100 flex flex-col gap-4">
          {/* Search Chat Input */}
          <div className="relative w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-transparent focus:border-gray-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-primary outline-none transition-all"
            />
          </div>

          {/* Conversations List */}
          <div className="flex flex-col gap-2">
            {isLoadingConversations ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-2xl flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
                  <div className="flex flex-col flex-1 gap-1.5">
                    <div className="h-3 bg-gray-100 rounded w-24" />
                    <div className="h-2.5 bg-gray-100 rounded w-32" />
                  </div>
                </div>
              ))
            ) : isConversationsError ? (
              <p className="text-xs text-rose-500 text-center py-6">
                Couldn&apos;t load conversations. Please try again later.
              </p>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No conversations yet.
              </p>
            ) : (
              conversations.map((conversation) => {
                const isSelected = conversation.id === selectedConversationId;
                const name =
                  conversation.recipientName || conversation.title || "Conversation";
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected ? "bg-gray-100/90 shadow-2xs" : "hover:bg-gray-50"
                    }`}
                  >
                    <Avatar
                      src={conversation.recipientAvatar}
                      name={name}
                      className="w-11 h-11 shrink-0 border border-gray-100"
                      alt={name}
                    />

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs sm:text-sm text-neutral-primary truncate">
                          {name}
                        </span>
                        {(conversation.unreadCount ?? 0) > 0 && (
                          <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-normal truncate mt-0.5">
                        {conversation.lastMessage?.body || "No messages yet"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Panel */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl p-4 sm:p-6 shadow-2xs border border-gray-100 flex flex-col justify-between h-150">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
              {isLoadingConversations
                ? "Loading conversations…"
                : "Select a conversation to start chatting."}
            </div>
          ) : (
            <>
              {/* Active Contact Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <Avatar
                  src={selectedConversation.recipientAvatar}
                  name={selectedConversation.recipientName || selectedConversation.title}
                  className="w-10 h-10 shrink-0 border border-gray-100"
                  alt={selectedConversation.recipientName || "Conversation"}
                />

                <div className="flex flex-col">
                  <span className="font-extrabold text-sm sm:text-base text-neutral-primary">
                    {selectedConversation.recipientName ||
                      selectedConversation.title ||
                      "Conversation"}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {isBroadcastConversation(selectedConversation.subject)
                      ? "Broadcast"
                      : "Online"}
                  </span>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4 scrollbar-thin">
                {isLoadingMessages ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    Loading messages…
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No messages in this conversation yet.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.senderId === currentUserId;
                    const isBroadcast = isBroadcastConversation(
                      selectedConversation.subject,
                    );
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${
                          isSelf ? "self-end items-end" : "self-start items-start"
                        }`}
                      >
                        <div
                          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isSelf
                              ? "bg-[#fbab2a] text-white rounded-br-none"
                              : "bg-[#F8F9FA] text-neutral-primary rounded-bl-none"
                          }`}
                        >
                          {isBroadcast && (
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-200 mb-1">
                              📢 Broadcast Message
                            </span>
                          )}
                          <p>{msg.body}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="pt-3 border-t border-gray-100 flex items-center gap-3 bg-[#F8F9FA] p-2.5 rounded-2xl border"
              >
                <input
                  type="text"
                  placeholder="Type here"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-primary outline-none px-3"
                />

                <button
                  type="submit"
                  disabled={isSending || !inputMessage.trim()}
                  className="p-2.5 text-neutral-primary hover:text-[#a31d38] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 focus:outline-none"
                  title="Send Message"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
