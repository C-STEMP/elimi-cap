"use client";

import React from "react";
import { motion } from "framer-motion";
import { Logo } from "@/src/components/ui/logo-solid";

export interface LoaderProps {
  fullscreen?: boolean;
  tip?: string;
  className?: string;
  size?: "small" | "default" | "large";
}

export const Loader: React.FC<LoaderProps> = ({
  fullscreen = true,
  tip,
  className = "",
  size = "default",
}) => {
  const scale = size === "small" ? 0.75 : size === "large" ? 1.2 : 1;
  const barWidth = size === "small" ? "w-24" : size === "large" ? "w-40" : "w-32";

  const containerClasses = fullscreen
    ? `fixed inset-0 bg-white flex flex-col items-center justify-center z-50 ${className}`
    : `w-full flex flex-col items-center justify-center py-8 ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center gap-5 select-none" style={{ transform: `scale(${scale})` }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <Logo />
        </motion.div>

        <div className={`${barWidth} h-1 bg-gray-100 rounded-full overflow-hidden relative shadow-inner`}>
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-primary rounded-full"
          />
        </div>

        {tip && (
          <p className="text-gray-400 text-xs font-medium tracking-normal mt-1 animate-pulse">
            {tip}
          </p>
        )}
      </div>
    </div>
  );
};

export const InlineSpinner: React.FC<LoaderProps> = (props) => {
  return <Loader fullscreen={false} size="small" {...props} />;
};

export default Loader;
