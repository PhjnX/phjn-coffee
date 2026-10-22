"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { formatVND } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { ProductPhoto } from "../ProductImage";
import { SectionTitle } from "./SectionTitle";

const PER_TAB = 8;

/** Café menu board on a dark espresso band: category pills, two columns of round photos, names, dotted leaders and prices. */
export function MenuList({ categories, products }: { categories: Category[]; products: Product[] }) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const items = products.filter((p) => p.categoryId === active).slice(0, PER_TAB);

  return (
    <section id="thuc-don" className="scroll-mt-16 bg-espresso py-24 text-cream md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <SectionTitle script="Hôm nay uống gì?" title="Thực đơn *mỗi ngày*" light />

        <div role="tablist" aria-label="Danh mục" className="no-scrollbar -mx-6 mt-10 flex justify-start gap-2 overflow-x-auto px-6 md:mx-0 md:justify-center md:px-0">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active === c.id}
              onClick={() => setActive(c.id)}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                active === c.id ? "text-white" : "text-cream/80 ring-1 ring-cream/25 hover:text-cream"
              }`}
            >
              {active === c.id && <motion.span layoutId="menu-tab" className="absolute inset-0 rounded-full bg-caramel" />}
              <span className="relative">{c.name}</span>
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
                    className="size-20 shrink-0 rounded-full ring-2 ring-cream/15 transition-transform duration-500 group-hover:scale-105 md:size-24"
                    sizes="96px"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline">
                      <span className="font-display text-lg transition-colors group-hover:text-[#f0a46f] md:text-xl">
                        {p.name}
                      </span>
                      <span aria-hidden className="leader" />
                      <span className="font-display text-lg text-[#f0a46f] md:text-xl">{formatVND(p.basePrice)}</span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-sm text-cream/75">
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
            className="inline-flex items-center gap-2 rounded-full bg-caramel px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-caramel-dark"
          >
            Xem toàn bộ thực đơn <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
