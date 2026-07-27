"use client";

import React from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="relative flex flex-col items-center gap-6 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            scale: [0.98, 1.02, 0.98]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative"
        >
          <Logo />
        </motion.div>

        <div className="w-32 h-[3px] bg-border-gray/30 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-primary-solid rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
