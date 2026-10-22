"use client";

import { motion } from "motion/react";
import { Fragment } from "react";

/**
 * Small orange kicker over a bold heading, fading up when it enters the view. Words wrapped in
 * *asterisks* in `title` are set in the italic accent serif, e.g. "Món khách *hay quay lại*".
 */
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
      <p className={`text-[13px] font-semibold tracking-[0.18em] uppercase ${light ? "text-[#f0a46f]" : "text-caramel-dark"}`}>{script}</p>
      <h2 className={`mt-3 font-display text-[40px] leading-[1.05] md:text-6xl ${light ? "text-cream" : "text-ink"}`}>
        <Emphasis text={title} />
      </h2>
    </motion.div>
  );
}

/** Renders "plain *accent* plain" with the starred part in <em>. */
export function Emphasis({ text }: { text: string }) {
  return text.split("*").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>));
}
