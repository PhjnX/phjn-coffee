"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";

const hours = [
  ["Thứ 2 – Thứ 6", "7:00 – 22:00"],
  ["Thứ 7 – Chủ nhật", "7:00 – 23:00"],
] as const;

/** Visit band: opening hours and how ordering works on the left, a real photo among scattered beans on the right. */
export function Visit() {
  return (
    <section
      id="cua-hang"
      className="kraft scroll-mt-16 overflow-hidden py-20 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2 md:px-10">
        <Reveal from="left">
          <span className="inline-block rounded-full border border-ink/30 px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase">
            Sắp khai trương
          </span>
          <h2 className="mt-4 font-display text-[30px] leading-tight md:text-[40px]">
            Ghé Phjn, gọi món
            <br />
            ngay tại bàn
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Quán đầu tiên đang được hoàn thiện ở Sài Gòn. Mỗi bàn có một mã QR
            riêng: quét, chọn món, chỉnh từng ly theo ý, nhân viên mang ra tận
            bàn.
          </p>
          <dl className="mt-7 flex max-w-md overflow-hidden rounded-xl border border-ink/80">
            {hours.map(([d, h]) => (
              <div
                key={d}
                className="flex-1 px-4 py-3 not-last:border-r not-last:border-ink/80"
              >
                <dt className="text-xs text-ink-soft">{d}</dt>
                <dd className="mt-0.5 font-bold tabular-nums">{h}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/menu"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-espresso px-7 text-[13px] font-bold tracking-[0.08em] text-cream uppercase transition-colors hover:bg-caramel hover:text-ink"
          >
            Xem thực đơn
          </Link>
        </Reveal>

        <div className="relative mx-auto aspect-square w-full max-w-[440px]">
          {[
            { b: 1, x: 6, y: 18, w: 18, r: -30 },
            { b: 2, x: 70, y: 6, w: 15, r: 40 },
            { b: 3, x: 2, y: 64, w: 16, r: 70 },
            { b: 4, x: 76, y: 60, w: 17, r: -50 },
            { b: 2, x: 24, y: 84, w: 12, r: 10 },
            { b: 1, x: 62, y: 86, w: 13, r: 120 },
          ].map((b, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%` }}
              initial={{ opacity: 0, y: -24, rotate: b.r - 40 }}
              whileInView={{ opacity: 1, y: 0, rotate: b.r }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.07 }}
            >
              <Image
                src={`/images/deco/bean-${b.b}.webp`}
                alt=""
                width={120}
                height={160}
                className="h-auto w-full drop-shadow-[0_10px_10px_rgb(58_31_22/0.35)]"
              />
            </motion.div>
          ))}
          <motion.div
            className="absolute inset-[16%]"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9 }}
          >
            <div className="relative size-full overflow-hidden rounded-full border-8 border-card shadow-[0_30px_50px_-24px_rgb(58_31_22/0.6)]">
              <Image
                src="/images/scenes/iced-coffees.webp"
                alt="Hai ly cà phê sữa đá trên đế gỗ"
                fill
                sizes="(min-width: 768px) 300px, 70vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
