"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessagesView } from "./MessagesView";

export const MessagesTab: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <MessagesView />
    </motion.div>
  );
};
