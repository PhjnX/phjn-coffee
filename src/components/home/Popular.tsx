"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatVND } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductPhoto } from "../ProductImage";
import { Reveal } from "./Reveal";

const badgeText = {
  bestseller: "Bán chạy",
  new: "Mới",
  signature: "Đặc biệt",
} as const;

/**
 * "Our popular flavour": a row of cards, each a tan tag on top, the real photo in a dark frame,
 * and a white strip with the name, price and a button. Scrolls sideways with dots below. Cards
 * rise in each time the row scrolls into view and drop away when it leaves.
 */
export function Popular({ products }: { products: Product[] }) {
  const rail = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const update = () => {
      setPages(Math.max(1, Math.round(el.scrollWidth / el.clientWidth)));
      setPage(Math.round(el.scrollLeft / el.clientWidth));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (i: number) =>
    rail.current?.scrollTo({
      left: i * rail.current.clientWidth,
      behavior: "smooth",
    });

  return (
    <section id="yeu-thich" className="scroll-mt-16 bg-card py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <Reveal>
          <h2 className="text-center font-display text-2xl font-extrabold tracking-[0.04em] uppercase md:text-[32px]">
            Món được yêu thích
          </h2>
        </Reveal>

        <ul
          ref={rail}
          className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pt-8 pb-4 md:mx-0 md:mt-12 md:gap-6 md:px-0"
        >
          {products.map((p, i) => (
            <motion.li
              key={p.id}
              className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[calc((100%-4.5rem)/4)]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
            >
              <Link href={`/menu?mon=${p.slug}`} className="group block">
                <div className="relative">
                  <span className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 rounded-t-md bg-caramel px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] whitespace-nowrap text-ink uppercase md:text-[11px]">
                    {p.badge ? badgeText[p.badge] : "Phjn"}
                  </span>
                  <div className="rounded-t-2xl bg-espresso p-2 pb-0">
                    <ProductPhoto
                      item={p}
                      className="aspect-[4/5] rounded-t-xl [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105"
                      sizes="(min-width: 768px) 240px, 45vw"
                    />
                  </div>
                </div>
                <div className="rounded-b-2xl border border-t-0 border-line bg-card p-3 md:p-4">
                  <p className="line-clamp-1 text-[13px] font-semibold md:text-sm">
                    {p.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-bold tabular-nums">
                      {formatVND(p.basePrice)}
                    </span>
                    <span className="shrink-0 rounded-full border border-ink/70 px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] whitespace-nowrap uppercase transition-colors group-hover:bg-espresso group-hover:text-cream md:px-3">
                      Xem<span className="hidden md:inline"> món</span>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>

        {pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Trang ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === page ? "w-8 bg-espresso" : "w-1.5 bg-ink/25"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
