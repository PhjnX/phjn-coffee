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

/** How big the main photo is drawn for each size, and the size class of its button on the ring. */
const SIZE_SCALE: Record<string, { big: number; button: string }> = {
  "size-s": { big: 0.74, button: "size-11 md:size-12" },
  "size-m": { big: 0.87, button: "size-14 md:size-16" },
  "size-l": { big: 1, button: "size-[68px] md:size-20" },
};

/** Where the size buttons sit: on the left of the circle, top to bottom (degrees from 3 o'clock). */
const ARC = [148, 180, 212];

/**
 * Product spotlight, after the Milton's coffee layout: category tabs, the drink's real photo in a
 * large circle inside a ring, its sizes as small, medium and large round buttons on the ring, and the
 * name, rating, price and order controls beside it. Picking a size grows or shrinks the photo and
 * updates the price.
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
  const shown = useMemo(
    () => products.filter((p) => p.isAvailable && p.photo),
    [products],
  );
  const tabs = categories.filter((c) =>
    shown.some((p) => p.categoryId === c.id),
  );
  const [cat, setCat] = useState(tabs[0]?.id ?? "");
  const [index, setIndex] = useState(0);
  const list = shown.filter((p) => p.categoryId === cat);
  const product = list[Math.min(index, list.length - 1)];

  const pick = (id: string) => {
    setCat(id);
    setIndex(0);
  };
  const step = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + list.length) % list.length);

  return (
    <section id="thuc-don" className="scroll-mt-16 bg-card py-14 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <div
          role="tablist"
          aria-label="Danh mục"
          className="no-scrollbar -mx-5 flex justify-start overflow-x-auto px-5 [mask-image:linear-gradient(to_right,black_85%,transparent)] md:mx-0 md:justify-center md:px-0 md:[mask-image:none]"
        >
          {tabs.map((c, i) => (
            <div key={c.id} className="flex shrink-0 items-center">
              {i > 0 && (
                <span aria-hidden className="mx-3 h-4 w-px bg-ink/25 md:mx-5" />
              )}
              <button
                type="button"
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => pick(c.id)}
                className={`relative px-1 py-3 text-[13px] tracking-[0.08em] whitespace-nowrap uppercase transition-colors md:text-sm ${
                  cat === c.id
                    ? "font-bold text-ink"
                    : "font-semibold text-ink-soft hover:text-ink"
                }`}
              >
                {cat === c.id && (
                  <motion.span
                    layoutId="spot-tab"
                    aria-hidden
                    className="absolute inset-x-[-10px] top-1/2 -z-0 h-4 -translate-y-1/2 -rotate-2 rounded-full bg-caramel/45"
                  />
                )}
                <span className="relative">{c.name}</span>
              </button>
            </div>
          ))}
        </div>

        {product && (
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease }}
            >
              <Showcase
                product={product}
                groups={groups}
                position={`${String(Math.min(index, list.length - 1) + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`}
                onStep={list.length > 1 ? step : undefined}
                categoryName={tabs.find((t) => t.id === cat)?.name ?? ""}
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
  categoryName,
}: {
  product: Product;
  groups: Record<string, OptionGroup>;
  position: string;
  onStep?: (dir: 1 | -1) => void;
  categoryName: string;
}) {
  const mounted = useMounted();
  const table = useCart((s) => s.table);
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const canOrder = mounted && table !== null;

  const sizeGroup = product.optionGroupIds.includes("size")
    ? groups.size
    : undefined;
  const [selection, setSelection] = useState(() =>
    defaultSelection(product, groups),
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const size = selection.size?.[0];
  const priced = priceProduct(product, groups, selection);
  const unit = priced.ok ? priced.unitPrice : product.basePrice;
  const scale = size ? (SIZE_SCALE[size]?.big ?? 1) : 1;

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
    <div className="mt-4 grid items-center gap-2 md:mt-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-14">
      {/* The ring with the drink and its sizes */}
      <Reveal
        from="left"
        className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px]"
      >
        <div
          aria-hidden
          className="absolute top-[8%] left-[22%] size-[76%] rounded-full border border-ink/20"
        />
        <Image
          src="/images/deco/bean-2.webp"
          alt=""
          aria-hidden
          width={60}
          height={80}
          className="absolute top-[10%] right-[10%] z-10 w-[9%] rotate-45 drop-shadow-md"
        />
        <Image
          src="/images/deco/bean-4.webp"
          alt=""
          aria-hidden
          width={60}
          height={80}
          className="absolute right-[3%] bottom-[24%] z-10 w-[7%] -rotate-12 drop-shadow-md"
        />

        <motion.div
          className="absolute top-[18%] left-[32%] size-[56%]"
          initial={false}
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
        >
          <ProductPhoto
            item={product}
            className="size-full rounded-full border-[6px] border-card shadow-[0_24px_40px_-18px_rgb(58_31_22/0.55)]"
            sizes="(min-width: 768px) 300px, 60vw"
            priority
          />
        </motion.div>

        {sizeGroup &&
          sizeGroup.options.map((o, i) => {
            const angle = (ARC[i] * Math.PI) / 180;
            const on = size === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelection((s) => ({ ...s, size: [o.id] }))}
                aria-pressed={on}
                aria-label={`Size ${o.name}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${60 + 38 * Math.cos(angle)}%`,
                  top: `${46 - 38 * Math.sin(angle)}%`,
                }}
              >
                <ProductPhoto
                  item={product}
                  className={`${SIZE_SCALE[o.id]?.button ?? "size-14"} rounded-full border-[3px] border-card shadow-[0_6px_16px_-6px_rgb(58_31_22/0.5)] transition-transform ${
                    on
                      ? "scale-110 ring-2 ring-caramel"
                      : "group-hover:scale-105"
                  }`}
                  sizes="80px"
                />
                <span
                  className={`absolute top-1/2 right-full mr-2 -translate-y-1/2 text-xs font-semibold whitespace-nowrap md:text-[13px] ${on ? "text-ink" : "text-ink-soft"}`}
                >
                  {o.name}
                </span>
              </button>
            );
          })}
      </Reveal>

      {/* Name, rating, price and ordering */}
      <Reveal from="right" delay={0.1} className="text-center md:text-left">
        <p className="text-xs font-semibold tracking-[0.2em] text-caramel-dark uppercase">
          {categoryName}
        </p>
        <h2 className="mt-2 font-display text-[32px] leading-tight md:text-[44px]">
          {product.name}
        </h2>
        <div className="mt-3 flex items-center justify-center gap-4 md:justify-start">
          <span aria-label="5 sao" className="flex gap-0.5 text-caramel">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                width="15"
                height="15"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path d="m10 1.5 2.6 5.5 6 .7-4.4 4.1 1.2 6L10 14.8 4.6 17.8l1.2-6L1.4 7.7l6-.7L10 1.5Z" />
              </svg>
            ))}
          </span>
          <motion.span
            key={unit}
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl font-bold tabular-nums"
          >
            {formatVND(unit)}
          </motion.span>
        </div>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft md:mx-0">
          {product.description}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          {canOrder ? (
            <>
              <div
                role="group"
                aria-label="Số lượng"
                className="inline-flex h-11 items-center rounded-full bg-espresso text-cream"
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Giảm"
                  className="grid size-11 place-items-center text-lg"
                >
                  −
                </button>
                <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
                  aria-label="Tăng"
                  className="grid size-11 place-items-center text-lg"
                >
                  +
                </button>
              </div>
              {added ? (
                <button
                  type="button"
                  onClick={openCart}
                  className="h-11 rounded-full border-2 border-caramel px-6 text-[13px] font-bold tracking-[0.08em] uppercase"
                >
                  Đã thêm ✓ · Xem giỏ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addToCart}
                  className="h-11 rounded-full bg-caramel px-7 text-[13px] font-bold tracking-[0.08em] text-ink uppercase transition-colors hover:bg-[#c78a4f]"
                >
                  Thêm vào giỏ
                </button>
              )}
            </>
          ) : (
            <>
              <Link
                href={`/menu?mon=${product.slug}`}
                className="inline-flex h-11 items-center rounded-full bg-caramel px-7 text-[13px] font-bold tracking-[0.08em] text-ink uppercase transition-colors hover:bg-[#c78a4f]"
              >
                Xem chi tiết
              </Link>
              <p className="w-full text-xs text-ink-soft">
                Quét mã QR trên bàn để gọi món.
              </p>
            </>
          )}
        </div>

        {onStep && (
          <div className="mt-8 flex items-center justify-center gap-4 md:justify-start">
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="Món trước"
              className="grid size-10 place-items-center rounded-full border border-ink/25 transition-colors hover:bg-espresso hover:text-cream"
            >
              ‹
            </button>
            <span className="text-sm font-semibold tabular-nums text-ink-soft">
              {position}
            </span>
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="Món tiếp theo"
              className="grid size-10 place-items-center rounded-full border border-ink/25 transition-colors hover:bg-espresso hover:text-cream"
            >
              ›
            </button>
          </div>
        )}
      </Reveal>
    </div>
  );
}
