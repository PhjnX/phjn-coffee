"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { formatVND } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { ProductPhoto } from "../ProductImage";
import { SectionTitle } from "./SectionTitle";

const PER_TAB = 8;

/** Classic café menu board: category tabs, two columns of round photos, names, dotted leaders and prices. */
export function MenuList({ categories, products }: { categories: Category[]; products: Product[] }) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const items = products.filter((p) => p.categoryId === active).slice(0, PER_TAB);

  return (
    <section id="thuc-don" className="scroll-mt-16 bg-paper-2 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <SectionTitle script="Hôm nay uống gì?" title="Thực đơn" />

        <div role="tablist" aria-label="Danh mục" className="no-scrollbar mt-12 flex justify-start gap-8 overflow-x-auto md:justify-center">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active === c.id}
              onClick={() => setActive(c.id)}
              className={`relative shrink-0 pb-2 font-condensed text-[16px] font-medium tracking-[0.06em] whitespace-nowrap uppercase transition-colors ${
                active === c.id ? "text-caramel" : "text-ink-soft hover:text-ink"
              }`}
            >
              {c.name}
              {active === c.id && <motion.span layoutId="menu-tab" className="absolute inset-x-0 -bottom-px h-px bg-caramel" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.ul
            key={active}
            className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{ show: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
          >
            {items.map((p) => (
              <motion.li
                key={p.id}
                variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              >
                <Link href={`/menu?mon=${p.slug}`} className="group flex items-center gap-5">
                  <ProductPhoto
                    item={p}
                    className="size-[72px] shrink-0 rounded-full ring-4 ring-espresso/90 transition-transform duration-500 group-hover:scale-105 md:size-20"
                    sizes="96px"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline">
                      <span className="font-condensed text-[18px] leading-tight font-medium uppercase transition-colors group-hover:text-caramel-dark md:text-[20px]">
                        {p.name}
                      </span>
                      <span aria-hidden className="leader" />
                      <span className="shrink-0 font-condensed text-[18px] font-medium tabular-nums md:text-[20px]">{formatVND(p.basePrice)}</span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-sm text-ink-soft">
                      {p.isAvailable ? p.description : "Tạm hết hôm nay"}
                    </span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>

        <div className="mt-16 text-center">
          <Link
            href={`/menu#cat-${active}`}
            className="inline-block rounded-full border border-ink/40 px-9 py-3.5 text-sm font-medium tracking-[0.16em] uppercase transition-colors hover:border-caramel hover:bg-caramel hover:text-cream"
          >
            Xem toàn bộ thực đơn
          </Link>
        </div>
      </div>
    </section>
  );
}
