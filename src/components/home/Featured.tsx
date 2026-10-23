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
    <section id="yeu-thich" ref={ref} className="scroll-mt-16 overflow-hidden py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <SectionTitle script="Được yêu thích" title="Món khách hay quay lại" />
      </div>
      <div className="mt-14 space-y-10">
        <Row products={products.slice(0, half)} x={rowA} />
        {/* One row on phones keeps the section short; the second row drifts the other way on wide screens. */}
        <div className="hidden md:block">
          <Row products={products.slice(half)} x={rowB} />
        </div>
      </div>
      <div className="mt-14 text-center">
        <Link
          href="/menu"
          className="inline-block rounded-full bg-ink px-9 py-3.5 text-xs font-semibold tracking-[0.2em] text-cream uppercase transition-colors hover:bg-caramel hover:text-ink"
        >
          Xem toàn bộ thực đơn
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
          <Link href={`/menu?mon=${p.slug}`} className="group block text-center">
            <ProductPhoto
              item={p}
              className="aspect-[4/5] rounded-t-full shadow-[0_24px_40px_-28px_rgb(29_43_69/0.6)] transition-transform duration-700 ease-out group-hover:-translate-y-1.5"
              sizes="(min-width: 768px) 240px, 190px"
            />
            {p.badge && <p className="mt-4 text-[10px] font-semibold tracking-[0.25em] text-caramel uppercase">{badgeText[p.badge]}</p>}
            <p className={`${p.badge ? "mt-1" : "mt-4"} font-display text-xl transition-colors group-hover:text-caramel-dark`}>
              {p.name}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{formatVND(p.basePrice)}</p>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
