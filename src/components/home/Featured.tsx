"use client";

import { type MotionValue, motion, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { formatVND } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useSectionProgress } from "@/lib/use-section-progress";
import { ProductPhoto } from "../ProductImage";
import { SectionTitle } from "./SectionTitle";

const badgeText = { bestseller: "Bán chạy", new: "Mới", signature: "Đặc biệt" } as const;

/**
 * Favourites: two rows of drinks and bakes that drift sideways in opposite directions as the
 * page scrolls past, so the section moves gently without anything spinning.
 */
export function Featured({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement>(null);
  const p = useSectionProgress(ref, "through");
  const rowA = useTransform(p, [0, 1], ["4%", "-22%"]);
  const rowB = useTransform(p, [0, 1], ["-22%", "4%"]);
  const half = Math.ceil(products.length / 2);

  return (
    <section id="yeu-thich" ref={ref} className="scroll-mt-16 overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <SectionTitle script="Được yêu thích" title="Món khách *hay quay lại*" />
      </div>
      <div className="mt-14 space-y-10">
        <Row products={products.slice(0, half)} x={rowA} />
        <Row products={products.slice(half)} x={rowB} />
      </div>
      <div className="mt-14 text-center">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-[15px] font-semibold text-cream transition-colors hover:bg-caramel"
        >
          Xem toàn bộ thực đơn <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

function Row({ products, x }: { products: Product[]; x: MotionValue<string> }) {
  return (
    <motion.ul style={{ x }} className="flex w-max gap-6 px-6 md:gap-10">
      {products.map((p, i) => (
        <motion.li
          key={p.id}
          className="w-48 shrink-0 md:w-60"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: (i % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={`/menu?mon=${p.slug}`} className="group block rounded-[28px] bg-card p-3 pb-5 text-center shadow-[0_18px_40px_-28px_rgb(35_22_14/0.5)]">
            <ProductPhoto
              item={p}
              className="aspect-[4/5] rounded-t-full rounded-b-[18px] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              sizes="(min-width: 768px) 240px, 190px"
            />
            {p.badge && <p className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-caramel-dark uppercase">{badgeText[p.badge]}</p>}
            <p className={`${p.badge ? "mt-1" : "mt-4"} font-display text-xl transition-colors group-hover:text-caramel-dark`}>
              {p.name}
            </p>
            <p className="mt-1.5 inline-block rounded-full bg-paper-2 px-3 py-1 text-sm font-semibold">{formatVND(p.basePrice)}</p>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
