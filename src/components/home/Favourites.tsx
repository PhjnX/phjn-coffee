"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatVND } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductPhoto } from "../ProductImage";
import { Reveal } from "./Reveal";

const badgeText = { bestseller: "Bán chạy", new: "Mới", signature: "Đặc biệt" } as const;

/**
 * Favourites on a dark espresso band that opens with a soft curve: a grid of the same kind of
 * card for every item (square photo, name, two-line note, price), two across on phones.
 */
export function Favourites({ products }: { products: Product[] }) {
  return (
    <section id="yeu-thich" className="relative scroll-mt-16 bg-espresso pb-16 text-cream md:pb-24">
      {/* Curve from the cream section above into the dark band */}
      <svg aria-hidden viewBox="0 0 1440 80" preserveAspectRatio="none" className="block h-10 w-full text-paper md:h-20">
        <path d="M0 0h1440v20C1080 90 360 90 0 20Z" fill="currentColor" />
      </svg>

      <div className="mx-auto max-w-6xl px-5 pt-8 md:px-10 md:pt-10">
        <Reveal className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-caramel uppercase">Được yêu thích</p>
          <h2 className="mt-2 font-display text-[32px] leading-tight md:text-5xl">
            Ly quen của <em className="font-medium text-caramel">khách quen</em>
          </h2>
        </Reveal>

        <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-4 md:gap-5">
          {products.map((p, i) => (
            <motion.li
              key={p.id}
              // Six on phones keeps the band short; wide screens show two full rows of four.
              className={i >= 6 ? "hidden md:block" : undefined}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/menu?mon=${p.slug}`} className="group block h-full rounded-2xl bg-cream/[0.06] p-2 transition-colors hover:bg-cream/10 md:p-2.5">
                <div className="relative">
                  <ProductPhoto
                    item={p}
                    className="aspect-square rounded-xl [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105"
                    sizes="(min-width: 768px) 260px, 46vw"
                  />
                  {p.badge && (
                    <span className="absolute top-2 left-2 rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-espresso">{badgeText[p.badge]}</span>
                  )}
                </div>
                <div className="px-1 pt-3 pb-1">
                  <p className="font-display text-[17px] leading-snug md:text-lg">{p.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-snug text-cream/65">{p.description}</p>
                  <p className="mt-2 text-sm font-bold tabular-nums text-caramel">{formatVND(p.basePrice)}</p>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="/menu"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-cream/40 px-7 text-sm font-semibold transition-colors hover:bg-cream hover:text-espresso"
          >
            Xem toàn bộ thực đơn <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
