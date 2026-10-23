"use client";

import { motion, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { useSectionProgress } from "@/lib/use-section-progress";
import { SectionTitle } from "./SectionTitle";

const features = [
  { title: "Rang mộc", text: "Robusta Đắk Lắk và Arabica Cầu Đất, rang mỗi tuần.", icon: <BeanIcon /> },
  { title: "Pha tay", text: "Phin, espresso hay pour-over đều pha theo từng ly.", icon: <DripIcon /> },
  { title: "Gọi tại bàn", text: "Quét mã QR trên bàn, món mang ra tận nơi.", icon: <QrIcon /> },
];

/** Story block: text and three promises on the left, a layered photo collage that drifts on scroll on the right. */
export function Welcome() {
  const ref = useRef<HTMLElement>(null);
  const scrollYProgress = useSectionProgress(ref, "through");
  const bigY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const smallY = useTransform(scrollYProgress, [0, 1], [140, -140]);

  return (
    <section id="cau-chuyen" ref={ref} className="scroll-mt-20 overflow-hidden py-20 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 md:grid-cols-2 md:px-10">
        <div>
          <SectionTitle script="Chào bạn đến với" title="Phjn Coffee" align="left" />
          <motion.div
            className="mt-8 space-y-4 text-[17px] leading-relaxed text-ink-soft"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <p>
              Một quán nhỏ cho cả nhóm bạn: người thích cà phê đậm, người chỉ uống trà trái cây, người ghé vì chiếc croissant vừa
              ra lò. Phjn gom cả ba vào một thực đơn và để bạn tự chỉnh từng ly cho đúng khẩu vị.
            </p>
            <p>Mỗi sáng 6 giờ, mẻ bánh đầu tiên ra lò. Cold brew được ủ 16 tiếng, trân châu nấu lại mỗi 4 tiếng.</p>
          </motion.div>

          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            {features.map((f, i) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              >
                <span className="text-caramel">{f.icon}</span>
                <p className="mt-3 text-xs font-semibold tracking-[0.18em] uppercase">{f.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.text}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto h-[380px] w-full max-w-[480px] md:h-[600px]">
          <motion.div style={{ y: bigY }} className="absolute top-0 right-0 h-[82%] w-[76%] overflow-hidden">
            <Image src="/images/scenes/barista-smile.webp" alt="Barista mỉm cười đưa ly latte" fill sizes="(min-width: 768px) 360px, 76vw" className="object-cover" />
          </motion.div>
          <motion.div
            style={{ y: smallY }}
            className="absolute bottom-0 left-0 h-[46%] w-[52%] overflow-hidden border-[10px] border-paper shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]"
          >
            <Image src="/images/scenes/latte-art.webp" alt="Rót sữa tạo hình latte art" fill sizes="(min-width: 768px) 250px, 52vw" className="object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BeanIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <ellipse cx="17" cy="17" rx="9" ry="13" transform="rotate(30 17 17)" />
      <path d="M11 7c6 6 2 14 12 20" />
    </svg>
  );
}

function DripIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M9 6h16l-3 10H12z" />
      <path d="M5 17h24" />
      <path d="M17 19v3" />
      <path d="M10 25h14l-1.5 6h-11z" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <rect x="5" y="5" width="9" height="9" rx="1.5" />
      <rect x="20" y="5" width="9" height="9" rx="1.5" />
      <rect x="5" y="20" width="9" height="9" rx="1.5" />
      <path d="M20 20h3v3h-3zM26 20h3M20 29h3M26 26v3h3M8.5 8.5h2v2h-2zM23.5 8.5h2v2h-2zM8.5 23.5h2v2h-2z" />
    </svg>
  );
}
