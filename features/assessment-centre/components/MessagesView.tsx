"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiSearch,
  FiCamera,
  FiPaperclip,
  FiSmile,
  FiSend,
  FiPlus,
} from "react-icons/fi";
import { Button } from "@/src/components/ui/button";
import { BroadcastModal } from "./BroadcastModal";
import { MOCK_CONTACTS, MOCK_CHAT_MESSAGES } from "../utils/constants";
import { ChatMessage } from "../types";

export const MessagesView: React.FC = () => {
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [selectedContactId, setSelectedContactId] = useState("c-1");
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_MESSAGES);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const selectedContact =
    contacts.find((c) => c.id === selectedContactId) || contacts[0];
  const activeMessages = chatMessages[selectedContactId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "self",
      senderName: "Me",
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isSelf: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMessage],
    }));

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? { ...c, lastMessage: inputMessage.trim() }
          : c,
      ),
    );

    setInputMessage("");
  };

  const handleBroadcastSent = (text: string, recipient: string) => {
    const broadcastMsg: ChatMessage = {
      id: `bmsg-${Date.now()}`,
      senderId: "self",
      senderName: `Broadcast (${recipient})`,
      text: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isSelf: true,
      isBroadcast: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      "c-2": [...(prev["c-2"] || []), broadcastMsg],
    }));
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[600px]">
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

          {/* Contacts List */}
          <div className="flex flex-col gap-2">
            {filteredContacts.map((contact) => {
              const isSelected = contact.id === selectedContactId;
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gray-100/90 shadow-2xs"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                    <Image
                      src={contact.avatar}
                      alt={contact.name}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-xs sm:text-sm text-neutral-primary truncate">
                        {contact.name}
                      </span>
                      {contact.unread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-normal truncate mt-0.5">
                      {contact.lastMessage}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Chat Panel */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl p-4 sm:p-6 shadow-2xs border border-gray-100 flex flex-col justify-between h-[600px]">
          {/* Active Contact Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
              <Image
                src={selectedContact.avatar}
                alt={selectedContact.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-neutral-primary">
                {selectedContact.name}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                {selectedContact.isBroadcast ? "Broadcast" : "Online"}
              </span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4 scrollbar-thin">
            {activeMessages.map((msg, index) => (
              <React.Fragment key={msg.id}>
                {index === 2 && (
                  <div className="flex items-center justify-center my-1 select-none">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      TODAY
                    </span>
                  </div>
                )}
                <div
                  className={`flex flex-col max-w-[80%] ${
                    msg.isSelf ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.isSelf
                        ? "bg-[#fbab2a] text-white rounded-br-none"
                        : "bg-[#F8F9FA] text-neutral-primary rounded-bl-none"
                    }`}
                  >
                    {msg.isBroadcast && (
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-200 mb-1">
                        📢 Broadcast Message
                      </span>
                    )}
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="pt-3 border-t border-gray-100 flex items-center gap-3 bg-[#F8F9FA] p-2.5 rounded-2xl border"
          >
            <div className="flex items-center gap-2 text-gray-400 pl-2 shrink-0">
              <button
                type="button"
                onClick={() => setInputMessage((prev) => prev + "📷 ")}
                className="p-1.5 hover:text-neutral-primary transition-colors cursor-pointer"
                title="Attach Camera Photo"
              >
                <FiCamera className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setInputMessage((prev) => prev + "📎 ")}
                className="p-1.5 hover:text-neutral-primary transition-colors cursor-pointer"
                title="Attach File"
              >
                <FiPaperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setInputMessage((prev) => prev + "😊 ")}
                className="p-1.5 hover:text-neutral-primary transition-colors cursor-pointer"
                title="Insert Emoji"
              >
                <FiSmile className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Type here"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-primary outline-none px-2"
            />

            <button
              type="submit"
              className="p-2.5 text-neutral-primary hover:text-[#a31d38] transition-colors cursor-pointer shrink-0 focus:outline-none"
              title="Send Message"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Broadcast Message Modal */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onSendSuccess={handleBroadcastSent}
      />
    </div>
  );
};
