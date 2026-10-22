"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MAX_QTY, useCart } from "@/lib/cart-store";
import { formatVND } from "@/lib/format";
import { defaultSelection, priceProduct } from "@/lib/pricing";
import type { Category, OptionGroup, Product } from "@/lib/types";
import { useMounted } from "@/lib/use-mounted";
import { ProductPhoto } from "../ProductImage";
import { summarize } from "../ProductSheet";
import { Reveal } from "./Reveal";

const ease = [0.22, 1, 0.36, 1] as const;

/** Cup volume shown under each size, and how tall its cup icon is drawn (px). */
const SIZES: Record<string, { ml: string; icon: number }> = {
  "size-s": { ml: "350ml", icon: 22 },
  "size-m": { ml: "500ml", icon: 28 },
  "size-l": { ml: "700ml", icon: 34 },
};

/**
 * "Chọn món, chọn size": category tabs, then one drink at a time with its real photo in an arch,
 * its name and price, and the sizes as three cards with a cup icon that gets taller, the volume
 * and the price, the way café ordering apps show them. Arrows on the photo step through the
 * category.
 */
export function Spotlight({
  categories,
  products,
  groups,
}: {
  categories: Category[];
  products: Product[];
  groups: Record<string, OptionGroup>;
}) {
  const shown = useMemo(() => products.filter((p) => p.isAvailable && p.photo), [products]);
  const tabs = categories.filter((c) => shown.some((p) => p.categoryId === c.id));
  const [cat, setCat] = useState(tabs[0]?.id ?? "");
  const [index, setIndex] = useState(0);
  const list = shown.filter((p) => p.categoryId === cat);
  const product = list[Math.min(index, list.length - 1)];

  const pick = (id: string) => {
    setCat(id);
    setIndex(0);
  };
  const step = (dir: 1 | -1) => setIndex((i) => (i + dir + list.length) % list.length);

  return (
    <section id="thuc-don" className="scroll-mt-16 bg-paper pt-14 pb-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <Reveal className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-caramel-dark uppercase">Hôm nay uống gì?</p>
          <h2 className="mt-2 font-display text-[32px] leading-tight md:text-5xl">
            Chọn món, <em className="font-medium text-caramel-dark">chọn size</em>
          </h2>
        </Reveal>

        <div
          role="tablist"
          aria-label="Danh mục"
          className="no-scrollbar -mx-5 mt-6 flex justify-start overflow-x-auto px-5 [mask-image:linear-gradient(to_right,black_85%,transparent)] md:mx-0 md:mt-8 md:justify-center md:px-0 md:[mask-image:none]"
        >
          {tabs.map((c, i) => (
            <div key={c.id} className="flex shrink-0 items-center">
              {i > 0 && <span aria-hidden className="mx-3 h-4 w-px bg-ink/20 md:mx-5" />}
              <button
                type="button"
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => pick(c.id)}
                className={`relative py-2.5 text-[13px] tracking-[0.08em] whitespace-nowrap uppercase transition-colors ${
                  cat === c.id ? "font-bold text-ink" : "font-medium text-ink-soft hover:text-ink"
                }`}
              >
                {c.name}
                {cat === c.id && <motion.span layoutId="spot-tab" aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-caramel" />}
              </button>
            </div>
          ))}
        </div>

        {product && (
          <AnimatePresence mode="wait">
            <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Showcase
                product={product}
                groups={groups}
                position={`${Math.min(index, list.length - 1) + 1} / ${list.length}`}
                onStep={list.length > 1 ? step : undefined}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

function Showcase({
  product,
  groups,
  position,
  onStep,
}: {
  product: Product;
  groups: Record<string, OptionGroup>;
  position: string;
  onStep?: (dir: 1 | -1) => void;
}) {
  const mounted = useMounted();
  const table = useCart((s) => s.table);
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const canOrder = mounted && table !== null;

  const sizeGroup = product.optionGroupIds.includes("size") ? groups.size : undefined;
  const [selection, setSelection] = useState(() => defaultSelection(product, groups));
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const size = selection.size?.[0];
  const priced = priceProduct(product, groups, selection);
  const unit = priced.ok ? priced.unitPrice : product.basePrice;

  function addToCart() {
    if (!priced.ok || !table) return;
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      photo: product.photo,
      art: product.art,
      selection,
      summary: summarize(priced.picked),
      note: "",
      unitPrice: priced.unitPrice,
      quantity,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2400);
  }

  return (
    <div className="mt-8 grid items-center gap-8 md:mt-12 md:grid-cols-2 md:gap-16">
      {/* Photo in an arch, a latte disc behind it, arrows on its sides */}
      <Reveal from="left" className="relative mx-auto w-[76%] max-w-[340px]">
        <div aria-hidden className="absolute -right-[12%] -bottom-[6%] size-[70%] rounded-full bg-caramel/25" />
        <Image src="/images/deco/bean-2.webp" alt="" aria-hidden width={60} height={80} className="absolute -top-[4%] -left-[10%] z-10 w-[14%] -rotate-12 drop-shadow-md" />
        <ProductPhoto
          item={product}
          className="aspect-[4/5] rounded-t-full rounded-b-[28px] shadow-[0_30px_50px_-26px_rgb(42_31_25/0.7)]"
          sizes="(min-width: 768px) 340px, 76vw"
          priority
        />
        {onStep && (
          <>
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="Món trước"
              className="absolute top-1/2 -left-5 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-card text-lg shadow-md transition-colors hover:bg-espresso hover:text-cream"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="Món tiếp theo"
              className="absolute top-1/2 -right-5 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-card text-lg shadow-md transition-colors hover:bg-espresso hover:text-cream"
            >
              ›
            </button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-semibold tabular-nums">{position}</span>
          </>
        )}
      </Reveal>

      {/* Name, price, sizes, ordering */}
      <Reveal from="right" delay={0.08} className="md:max-w-md">
        <h3 className="text-center font-display text-[30px] leading-tight md:text-left md:text-[40px]">{product.name}</h3>
        <p className="mt-2 text-center text-[15px] leading-relaxed text-ink-soft md:text-left">{product.description}</p>

        {sizeGroup ? (
          <div role="radiogroup" aria-label="Chọn size" className="mt-6 grid grid-cols-3 gap-2.5">
            {sizeGroup.options.map((o) => {
              const on = size === o.id;
              const info = SIZES[o.id];
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSelection((s) => ({ ...s, size: [o.id] }))}
                  className={`flex flex-col items-center rounded-2xl border px-2 pt-3 pb-2.5 transition-colors ${
                    on ? "border-espresso bg-espresso text-cream" : "border-line bg-card hover:border-ink/40"
                  }`}
                >
                  <span className="flex h-9 items-end">
                    <CupIcon height={info?.icon ?? 28} />
                  </span>
                  <span className="mt-1.5 text-sm font-semibold">{o.name}</span>
                  {info && <span className={`text-[11px] ${on ? "text-cream/75" : "text-ink-soft"}`}>{info.ml}</span>}
                  <span className="mt-1 text-[13px] font-bold tabular-nums">{formatVND(product.basePrice + o.priceDelta)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 text-center text-2xl font-bold tabular-nums md:text-left">{formatVND(unit)}</p>
        )}

        <div className="mt-6 flex items-center gap-3">
          {canOrder ? (
            <>
              <div role="group" aria-label="Số lượng" className="inline-flex h-12 shrink-0 items-center rounded-full border border-line bg-card">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Giảm" className="grid size-11 place-items-center text-lg">
                  −
                </button>
                <span className="min-w-5 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))} aria-label="Tăng" className="grid size-11 place-items-center text-lg">
                  +
                </button>
              </div>
              {added ? (
                <button type="button" onClick={openCart} className="h-12 flex-1 rounded-full border-2 border-espresso text-sm font-semibold">
                  Đã thêm ✓ · Xem giỏ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addToCart}
                  className="flex h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-espresso pr-5 pl-5 text-sm font-semibold whitespace-nowrap text-cream transition-colors hover:bg-ink"
                >
                  <span>Thêm vào giỏ</span>
                  <span className="tabular-nums">{formatVND(unit * quantity)}</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full text-center md:text-left">
              <Link
                href={`/menu?mon=${product.slug}`}
                className="inline-flex h-12 items-center rounded-full bg-espresso px-7 text-sm font-semibold text-cream transition-colors hover:bg-ink"
              >
                Xem chi tiết món
              </Link>
              <p className="mt-2.5 text-xs text-ink-soft">Quét mã QR trên bàn để gọi món.</p>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

/** A takeaway cup: domed lid, tapered body and a sleeve band. Drawn at the given height. */
function CupIcon({ height }: { height: number }) {
  return (
    <svg width={(height * 24) / 32} height={height} viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
      <path d="M6 5.5h12l1 3H5z" />
      <path d="M8.5 5.5 9.5 3h5l1 2.5" />
      <path d="M5.6 8.5 7.6 29h8.8l2-20.5" />
      <path d="M6.6 14h10.8l-.7 7.5H7.3z" />
    </svg>
  );
}
