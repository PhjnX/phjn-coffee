"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MAX_QTY, useCart } from "@/lib/cart-store";
import { formatVND } from "@/lib/format";
import { defaultSelection, priceProduct, toggleOption } from "@/lib/pricing";
import type { Option, OptionGroup, Product, Selection } from "@/lib/types";
import { ProductPhoto } from "./ProductImage";
import { QuantityStepper } from "./QuantityStepper";

type Props = {
  product: Product | null;
  groups: Record<string, OptionGroup>;
  onClose: () => void;
  onAdded: (name: string) => void;
};

/** "Vừa · 50% đường · Trân châu đen". Default choices other than size are left out to keep it short. */
function summarize(picked: { group: OptionGroup; option: Option }[]): string {
  const parts = picked
    .filter(({ group, option }) => group.id === "size" || !option.isDefault)
    .map(({ group, option }) =>
      group.id === "sugar" && option.name.endsWith("%")
        ? `${option.name} đường`
        : option.name,
    );
  return parts.join(" · ");
}

export function ProductSheet({ product, groups, onClose, onAdded }: Props) {
  return (
    <AnimatePresence>
      {product && (
        <Sheet
          key={product.id}
          product={product}
          groups={groups}
          onClose={onClose}
          onAdded={onAdded}
        />
      )}
    </AnimatePresence>
  );
}

/**
 * Order form, styled like a café ordering app: one column on every screen size. A rounded photo on
 * top (close button in its corner), the name and price, then each choice as a segmented control
 * (size, sugar, ice) or a list of rows with a tick and the extra cost (milk, toppings), and a sticky
 * add-to-cart bar. On phones it slides up from the bottom and can be dragged down to close.
 */
function Sheet({
  product,
  groups,
  onClose,
  onAdded,
}: Props & { product: Product }) {
  const add = useCart((s) => s.add);
  const table = useCart((s) => s.table);
  const [selection, setSelection] = useState<Selection>(() =>
    defaultSelection(product, groups),
  );
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useDragControls();

  const result = useMemo(
    () => priceProduct(product, groups, selection),
    [product, groups, selection],
  );
  const productGroups = product.optionGroupIds
    .map((id) => groups[id])
    .filter((g): g is OptionGroup => Boolean(g));

  // Escape to close, lock page scroll, move focus into the dialog.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  function handleAdd() {
    if (!result.ok || !table) return;
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      photo: product.photo,
      art: product.art,
      selection,
      summary: summarize(result.picked),
      note: note.trim(),
      unitPrice: result.unitPrice,
      quantity,
    });
    onAdded(product.name);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <motion.div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        tabIndex={-1}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 38 }}
        drag="y"
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
        className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-paper shadow-2xl outline-none md:max-h-[90dvh] md:max-w-[460px] md:rounded-[28px]"
      >
        {/* Drag handle (phones) */}
        <div
          className="grid h-6 shrink-0 touch-none place-items-center md:hidden"
          onPointerDown={(e) => drag.start(e)}
        >
          <span aria-hidden className="h-1 w-10 rounded-full bg-ink/20" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
          <div className="relative px-4 md:px-5 md:pt-5">
            <ProductPhoto
              item={product}
              className="aspect-[5/4] w-full rounded-[20px]"
              sizes="(min-width: 768px) 420px, 100vw"
              priority
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute top-3 right-7 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur transition-colors hover:bg-white md:top-8 md:right-8"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M3 3l10 10M13 3 3 13" />
              </svg>
            </button>
          </div>

          <div className="px-5 pt-5 md:px-6">
            <div className="flex items-start justify-between gap-4">
              <h2
                id="sheet-title"
                className="font-display text-[26px] leading-tight"
              >
                {product.name}
              </h2>
              <p className="shrink-0 pt-1.5 font-display text-lg text-caramel-dark">
                {formatVND(product.basePrice)}
              </p>
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
              {product.description}
            </p>
          </div>

          <div className="mt-2 space-y-6 px-5 md:px-6">
            {productGroups.map((group) => (
              <OptionGroupField
                key={group.id}
                group={group}
                selected={selection[group.id] ?? []}
                onToggle={(optionId) =>
                  setSelection((s) => toggleOption(s, group, optionId))
                }
              />
            ))}

            <label className="block border-t border-line pt-5">
              <span className="text-[15px] font-semibold">Ghi chú</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 120))}
                rows={2}
                placeholder="Ví dụ: ít ngọt hơn nữa, không lấy ống hút"
                className="mt-2.5 w-full resize-none rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none placeholder:text-ink-soft/60 focus:border-caramel md:text-[15px]"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-line bg-paper px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6 md:pb-4">
          {!result.ok && (
            <p role="alert" className="mb-2 text-xs text-caramel-dark">
              {result.errors[0]}
            </p>
          )}
          {!table ? (
            <div className="flex items-center gap-3 rounded-2xl bg-paper-2 px-4 py-3">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="shrink-0 text-caramel"
                aria-hidden
              >
                <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
                <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
                <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
                <path d="M14.5 14.5h2v2h-2zM18.5 14.5h2M14.5 20.5h2M18.5 18.5v2h2" />
              </svg>
              <p className="text-sm leading-snug">
                <span className="font-semibold">
                  Quét mã QR trên bàn để gọi món
                </span>
                <span className="block text-xs text-ink-soft">
                  Phjn chỉ nhận đơn tại quán. Món sẽ được mang ra tận bàn.
                </span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={MAX_QTY}
                label="Số lượng"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!result.ok}
                className="flex h-12 flex-1 items-center justify-between rounded-full bg-ink pr-5 pl-6 text-[15px] font-semibold text-cream transition-colors hover:bg-caramel-dark disabled:opacity-40"
              >
                <span>Thêm vào giỏ</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={result.ok ? result.unitPrice * quantity : "x"}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="tabular-nums"
                  >
                    {result.ok ? formatVND(result.unitPrice * quantity) : "—"}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/** Short labels for segmented controls, where long names would not fit. */
const SHORT: Record<string, string> = {
  "Không đường": "0%",
  "Không thêm đường": "Không",
};

/**
 * One option group. Single choices with up to five short, free options (or the size) render as a
 * segmented control; everything else as rows with a radio or checkbox and the extra cost.
 */
function OptionGroupField({
  group,
  selected,
  onToggle,
}: {
  group: OptionGroup;
  selected: string[];
  onToggle: (optionId: string) => void;
}) {
  const multi = group.selectType === "multi";
  const max = group.maxSelect ?? group.options.length;
  const full = multi && selected.length >= max;
  const segmented =
    !multi &&
    group.options.length <= 5 &&
    (group.id === "size" || group.options.every((o) => o.priceDelta === 0));
  const hint = group.isRequired
    ? "Bắt buộc"
    : multi && max > 1
      ? `Chọn tối đa ${max}`
      : "Không bắt buộc";

  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="sr-only">{group.name}</legend>
      <div aria-hidden className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-semibold">{group.name}</span>
        <span className="text-xs text-ink-soft">{hint}</span>
      </div>

      {segmented ? (
        <div
          className="mt-3 grid gap-1 rounded-2xl bg-paper-2 p-1"
          style={{
            gridTemplateColumns: `repeat(${group.options.length}, minmax(0, 1fr))`,
          }}
        >
          {group.options.map((option) => {
            const checked = selected.includes(option.id);
            return (
              <label
                key={option.id}
                className="relative flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-xl px-1 py-2 text-center leading-tight has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-caramel"
              >
                <input
                  type="radio"
                  name={group.id}
                  value={option.id}
                  checked={checked}
                  onChange={() => onToggle(option.id)}
                  className="sr-only"
                />
                {checked && (
                  <motion.span
                    layoutId={`seg-${group.id}`}
                    className="absolute inset-0 rounded-xl bg-card shadow-[0_2px_8px_-2px_rgb(59_46_37/0.25)]"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span
                  className={`relative text-[13px] font-medium transition-colors ${checked ? "text-ink" : "text-ink-soft"}`}
                >
                  {SHORT[option.name] ?? option.name}
                </span>
                {group.id === "size" && (
                  <span className="relative mt-0.5 text-[11px] text-ink-soft tabular-nums">
                    {option.priceDelta > 0
                      ? `+${formatVND(option.priceDelta)}`
                      : "Mặc định"}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {group.options.map((option) => {
            const checked = selected.includes(option.id);
            const disabled = !checked && full;
            return (
              <label
                key={option.id}
                className={`flex min-h-12 cursor-pointer items-center gap-3 px-4 py-3 text-[15px] transition-colors has-[:focus-visible]:bg-paper-2 ${
                  disabled
                    ? "cursor-not-allowed opacity-40"
                    : "hover:bg-paper-2/60"
                }`}
              >
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={group.id}
                  value={option.id}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(option.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`grid size-5 shrink-0 place-items-center border transition-colors ${multi ? "rounded-md" : "rounded-full"} ${
                    checked ? "border-ink bg-ink text-cream" : "border-ink/25"
                  }`}
                >
                  {checked &&
                    (multi ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M2 6.5 5 9l5-6" />
                      </svg>
                    ) : (
                      <span className="size-2 rounded-full bg-cream" />
                    ))}
                </span>
                <span className="flex-1">{option.name}</span>
                {option.priceDelta > 0 && (
                  <span className="text-sm text-ink-soft tabular-nums">
                    +{formatVND(option.priceDelta)}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
