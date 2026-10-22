"use client";

import { motion, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { useSectionProgress } from "@/lib/use-section-progress";

/** Dark full-width band with a slow parallax photo behind a short line in script. */
export function QuoteBand() {
  const ref = useRef<HTMLElement>(null);
  const scrollYProgress = useSectionProgress(ref, "through");
  const y = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-espresso py-32 text-center text-white md:py-44">
      <motion.div style={{ y }} className="absolute -inset-y-[20%] inset-x-0">
        <Image src="/images/scenes/beans.webp" alt="" fill sizes="100vw" className="object-cover opacity-45" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-espresso/70 via-espresso/30 to-espresso/70" />
      <motion.blockquote
        className="relative mx-auto max-w-3xl px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-display text-4xl leading-snug text-white md:text-6xl">Cà phê ngon không cần vội.</p>
        <footer className="mt-6 font-display text-lg text-[#e0c39f]">Phjn Coffee · Sài Gòn</footer>
      </motion.blockquote>
    </section>
  );
}
