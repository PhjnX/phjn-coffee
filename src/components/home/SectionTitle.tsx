"use client";

import { motion } from "motion/react";
import { BeansIcon } from "../brand/Logo";

/** Script kicker, spaced serif title and a small phin divider, fading up when it enters the view. */
export function SectionTitle({
  script,
  title,
  align = "center",
  light = false,
}: {
  script: string;
  title: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  const center = align === "center";
  return (
    <motion.div
      className={center ? "text-center" : ""}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className={`text-xs font-semibold tracking-[0.3em] uppercase ${light ? "text-[#e3c27a]" : "text-caramel-dark"}`}>{script}</p>
      <h2
        className={`mt-3 font-display text-4xl leading-tight md:text-5xl ${light ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      <div className={`mt-5 flex items-center gap-3 ${center ? "justify-center" : ""}`} aria-hidden>
        <span className={`h-px w-16 ${light ? "bg-white/40" : "bg-caramel/50"}`} />
        <BeansIcon className={`h-5 w-6 ${light ? "text-[#e3c27a]" : "text-caramel"}`} />
        <span className={`h-px w-16 ${light ? "bg-white/40" : "bg-caramel/50"}`} />
      </div>
    </motion.div>
  );
}
