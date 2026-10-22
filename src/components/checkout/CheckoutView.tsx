"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { placeOrder } from "@/app/(site)/checkout/actions";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatVND } from "@/lib/format";
import { FREE_DELIVERY_FROM, type Order, type OrderErrors, type OrderType, type PaymentMethod, shippingFee } from "@/lib/order";
import { useMounted } from "@/lib/use-mounted";
import { ProductPhoto } from "../ProductImage";
import { OrderConfirmation } from "./OrderConfirmation";

const CONTACT_KEY = "phjn-contact";

/** Checkout: how to receive the order, contact details, payment, and the order summary. */
export function CheckoutView() {
  const mounted = useMounted();
  const lines = useCart((s) => s.lines);
  const table = useCart((s) => s.table);
  const clear = useCart((s) => s.clear);
  const openCart = useCart((s) => s.open);

  const [type, setType] = useState<OrderType>("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [errors, setErrors] = useState<OrderErrors>({});
  const [order, setOrder] = useState<Order | null>(null);
  const [pending, startTransition] = useTransition();

  // Order at the table when the visitor came in through a table's QR code.
  useEffect(() => setType(table ? "table" : "delivery"), [table]);

  // Fill in the details used last time on this device.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONTACT_KEY) ?? "null") as { name?: string; phone?: string; address?: string } | null;
      if (saved) {
        setName(saved.name ?? "");
        setPhone(saved.phone ?? "");
        setAddress(saved.address ?? "");
      }
    } catch {}
  }, []);

  if (!mounted) return <div className="min-h-[60dvh]" />;
  if (order) return <OrderConfirmation order={order} />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60dvh] max-w-md place-items-center px-4 text-center">
        <div>
          <h1 className="font-display text-3xl">Giỏ hàng đang trống</h1>
          <p className="mt-2 text-ink-soft">Chọn vài món trong thực đơn rồi quay lại đây để đặt nhé.</p>
          <Link href="/menu" className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-caramel-dark">
            Xem thực đơn
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(lines);
  const shipping = shippingFee(type, subtotal);
  const total = subtotal + shipping;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await placeOrder({
        type,
        table: table ?? undefined,
        name,
        phone,
        address,
        note,
        payment,
        lines: lines.map((l) => ({ productId: l.productId, selection: l.selection, note: l.note, quantity: l.quantity })),
      });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      try {
        localStorage.setItem(CONTACT_KEY, JSON.stringify({ name, phone, address }));
      } catch {}
      setErrors({});
      clear();
      setOrder(result.order);
      window.scrollTo({ top: 0 });
    });
  }

  const submitLabel = pending ? "Đang gửi đơn…" : `Đặt hàng · ${formatVND(total)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-36 md:px-8 lg:pt-10 lg:pb-16">
      <Link href="/menu" className="text-sm text-ink-soft hover:text-ink">
        ← Thực đơn
      </Link>
      <h1 className="mt-2 font-display text-4xl">Thanh toán</h1>

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
        <form id="checkout-form" onSubmit={submit} noValidate className="space-y-4">
          <Card title="Nhận món">
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-paper-2 p-1">
              {(
                [
                  ["delivery", "Giao tận nơi", "Khoảng 30 phút"],
                  ["table", table ? `Tại bàn ${table}` : "Tại bàn", table ? "Mang ra bàn" : "Quét QR trên bàn"],
                ] as const
              ).map(([value, label, sub]) => {
                const disabled = value === "table" && !table;
                const on = type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={disabled}
                    onClick={() => setType(value)}
                    aria-pressed={on}
                    className="relative rounded-xl px-3 py-2.5 text-center disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {on && (
                      <motion.span
                        layoutId="checkout-type"
                        className="absolute inset-0 rounded-xl bg-card shadow-[0_2px_8px_-2px_rgb(59_46_37/0.25)]"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span className={`relative block text-sm font-semibold ${on ? "text-ink" : "text-ink-soft"}`}>{label}</span>
                    <span className="relative block text-[11px] text-ink-soft">{sub}</span>
                  </button>
                );
              })}
            </div>
            {errors.table && <FieldError>{errors.table}</FieldError>}
          </Card>

          <Card title="Thông tin">
            <div className="space-y-4">
              <Field label="Tên của bạn" error={errors.name}>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ví dụ: Lan" className={inputClass(errors.name)} />
              </Field>
              <Field label="Số điện thoại" error={errors.phone}>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0912 345 678"
                  className={inputClass(errors.phone)}
                />
              </Field>
              <AnimatePresence initial={false}>
                {type === "delivery" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <Field label="Địa chỉ giao hàng" error={errors.address}>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        autoComplete="street-address"
                        rows={2}
                        placeholder="Số nhà, đường, phường, quận"
                        className={`${inputClass(errors.address)} resize-none`}
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
              <Field label="Ghi chú cho đơn (không bắt buộc)">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 200))}
                  placeholder={type === "table" ? "Ví dụ: mang ra cùng lúc" : "Ví dụ: gọi trước khi tới, để ở bảo vệ"}
                  className={inputClass()}
                />
              </Field>
            </div>
          </Card>

          <Card title="Thanh toán">
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {(
                [
                  ["cash", "Tiền mặt", type === "table" ? "Trả tại quầy hoặc khi nhân viên mang món ra" : "Trả cho shipper khi nhận hàng"],
                  ["transfer", "Chuyển khoản VietQR", "Quét mã QR sau khi đặt, đơn được làm khi nhận tiền"],
                ] as const
              ).map(([value, label, sub]) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 bg-card px-4 py-3.5 has-[:focus-visible]:bg-paper-2">
                  <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="sr-only" />
                  <span
                    aria-hidden
                    className={`grid size-5 shrink-0 place-items-center rounded-full border ${payment === value ? "border-ink bg-ink" : "border-ink/25"}`}
                  >
                    {payment === value && <span className="size-2 rounded-full bg-cream" />}
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium">{label}</span>
                    <span className="block text-xs text-ink-soft">{sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          {(errors.lines || errors.form) && (
            <p role="alert" className="rounded-2xl bg-[#b4442b]/10 px-4 py-3 text-sm text-[#9a3a24]">
              {errors.lines ?? errors.form}
            </p>
          )}
        </form>

        {/* Order summary */}
        <aside className="mt-4 lg:sticky lg:top-28 lg:mt-0">
          <Card
            title={`Đơn của bạn · ${lines.reduce((n, l) => n + l.quantity, 0)} món`}
            action={
              <button type="button" onClick={openCart} className="text-sm text-caramel-dark underline-offset-2 hover:underline">
                Sửa
              </button>
            }
          >
            <ul className="space-y-3">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-3">
                  <ProductPhoto item={l} className="size-14 shrink-0 rounded-xl" sizes="56px" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <p className="truncate text-[15px] font-medium">
                        {l.quantity} × {l.name}
                      </p>
                      <p className="shrink-0 text-[15px] tabular-nums">{formatVND(l.unitPrice * l.quantity)}</p>
                    </div>
                    {l.summary && <p className="mt-0.5 text-xs text-ink-soft">{l.summary}</p>}
                    {l.note && <p className="mt-0.5 text-xs text-ink-soft italic">“{l.note}”</p>}
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Tạm tính</dt>
                <dd className="tabular-nums">{formatVND(subtotal)}</dd>
              </div>
              {type === "delivery" && (
                <div className="flex justify-between">
                  <dt className="text-ink-soft">
                    Phí giao hàng
                    {shipping > 0 && <span className="block text-xs">Miễn phí cho đơn từ {formatVND(FREE_DELIVERY_FROM)}</span>}
                  </dt>
                  <dd className="tabular-nums">{shipping === 0 ? "Miễn phí" : formatVND(shipping)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
                <dt>Tổng cộng</dt>
                <dd className="tabular-nums">{formatVND(total)}</dd>
              </div>
            </dl>
            <button
              type="submit"
              form="checkout-form"
              disabled={pending}
              className="mt-5 hidden h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-cream transition-colors hover:bg-caramel-dark disabled:opacity-60 lg:flex"
            >
              {submitLabel}
            </button>
          </Card>
          <p className="mt-3 px-1 text-xs leading-relaxed text-ink-soft">
            Phjn Coffee là dự án demo: đơn hàng không được gửi tới quán thật và không có khoản thanh toán nào được thực hiện.
          </p>
        </aside>
      </div>

      {/* Phones: sticky order bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <button
          type="submit"
          form="checkout-form"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-cream transition-colors disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <FieldError>{error}</FieldError>}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <span className="mt-1.5 block text-xs text-[#9a3a24]">{children}</span>;
}

/** 16px text on phones so iOS doesn't zoom into the field. */
function inputClass(error?: string) {
  return `w-full rounded-xl border bg-paper px-4 py-3 text-base outline-none placeholder:text-ink-soft/60 focus:border-caramel md:text-[15px] ${
    error ? "border-[#b4442b]" : "border-line"
  }`;
}
