"use client";

import React from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "@/src/components/ui/button";

interface MessagesHeaderProps {
  onSendBroadcast: () => void;
}

export const MessagesHeader: React.FC<MessagesHeaderProps> = ({
  onSendBroadcast,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Messages
      </h1>

      <Button
        type="button"
        onClick={onSendBroadcast}
        variant="amber"
        size="md"
        rightIcon={<FiPlus className="w-4.5 h-4.5" />}
        className="px-6 h-11 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
      >
        Send Broadcast Message
      </Button>
    </div>
  );
};
