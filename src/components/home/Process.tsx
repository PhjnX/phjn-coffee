"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";

const steps = [
  {
    title: "Rang mộc",
    text: "Robusta Đắk Lắk, Arabica Cầu Đất, rang mỗi tuần.",
    icon: <BeanIcon />,
    tone: "dark",
  },
  {
    title: "Pha tay",
    text: "Phin, espresso hay pour-over, pha theo từng ly.",
    icon: <DripIcon />,
    tone: "tan",
  },
  {
    title: "Gọi tại bàn",
    text: "Quét mã QR trên bàn, món mang ra tận nơi.",
    icon: <QrIcon />,
    tone: "dark",
  },
] as const;

/** "Taste from the process": a short heading and note, then three steps as dark / tan / dark cards. */
export function Process() {
  return (
    <section id="cau-chuyen" className="scroll-mt-16 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <div className="grid gap-5 md:grid-cols-2 md:items-end md:gap-16">
          <Reveal from="left">
            <h2 className="font-display text-[30px] leading-tight md:text-[40px]">
              Hương vị ngon
              <br />
              từ cả quy trình
            </h2>
          </Reveal>
          <Reveal from="right" className="md:justify-self-end">
            <p className="max-w-md text-[15px] leading-relaxed text-ink-soft">
              Một quán nhỏ cho cả nhóm bạn: người thích cà phê đậm, người chỉ
              uống trà trái cây, người ghé vì chiếc croissant vừa ra lò. Mỗi ly
              đi qua ba bước, không bước nào làm vội.
            </p>
          </Reveal>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3 md:mt-14 md:gap-8">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`flex flex-col items-center rounded-2xl px-6 py-9 text-center shadow-[0_18px_36px_-24px_rgb(58_31_22/0.6)] ${
                s.tone === "dark"
                  ? "bg-espresso text-cream"
                  : "bg-caramel text-ink"
              }`}
            >
              <span className="[&_svg]:size-12">{s.icon}</span>
              <p className="mt-4 font-display text-base font-bold">{s.title}</p>
              <p
                className={`mt-1.5 text-sm leading-snug ${s.tone === "dark" ? "text-cream/80" : "text-ink/80"}`}
              >
                {s.text}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BeanIcon() {
  return (
    <svg
      viewBox="0 0 34 34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden
    >
      <ellipse cx="13" cy="18" rx="6.5" ry="9.5" transform="rotate(25 13 18)" />
      <path d="M9 10c4 4 1.5 10 8 15" />
      <ellipse
        cx="23.5"
        cy="14"
        rx="5"
        ry="7.5"
        transform="rotate(-25 23.5 14)"
      />
      <path d="M22 7.5c2.5 3 .5 7 3.5 12" />
    </svg>
  );
}

function DripIcon() {
  return (
    <svg
      viewBox="0 0 34 34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden
    >
      <path d="M13 4c-1 1.5 1 2.5 0 4M18 4c-1 1.5 1 2.5 0 4" />
      <path d="M9 11h16l-2.5 19h-11z" />
      <path d="M8 11h18" />
      <path d="M10.4 18h13.2" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg
      viewBox="0 0 34 34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden
    >
      <rect x="5" y="5" width="9" height="9" rx="1.5" />
      <rect x="20" y="5" width="9" height="9" rx="1.5" />
      <rect x="5" y="20" width="9" height="9" rx="1.5" />
      <path d="M20 20h3v3h-3zM26 20h3M20 29h3M26 26v3h3M8.5 8.5h2v2h-2zM23.5 8.5h2v2h-2zM8.5 23.5h2v2h-2z" />
    </svg>
  );
}
