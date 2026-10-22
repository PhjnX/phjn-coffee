"use client";

import { motion } from "motion/react";

/**
 * Fades and slides its content in each time it scrolls into view, and back out when it leaves,
 * so a section comes alive again on every pass instead of animating only once.
 */
export function Reveal({
  children,
  className,
  from = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  from?: "up" | "left" | "right";
  delay?: number;
}) {
  const offset = from === "up" ? { y: 36 } : { x: from === "left" ? -48 : 48 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
