"use client";

import { motion } from "framer-motion";

export const FloatingCircles: React.FC = () => (
  <>
    <motion.div
      suppressHydrationWarning
      animate={{
        y: [0, -15, 0],
        x: [0, 10, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute -top-28 -right-60 w-105 h-105 rounded-full bg-white/6 pointer-events-none z-0"
      aria-hidden="true"
    />

    <motion.div
      suppressHydrationWarning
      animate={{
        y: [0, 15, 0],
        x: [0, -10, 0],
        scale: [1, 0.95, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute bottom-8 -left-42 w-90 h-90 rounded-full bg-secondary/15 pointer-events-none z-0"
      aria-hidden="true"
    />
  </>
);
