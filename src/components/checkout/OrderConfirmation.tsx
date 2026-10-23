"use client";

import { motion } from "motion/react";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { formatVND } from "@/lib/format";
import type { Order } from "@/lib/order";

/** Thank-you screen with the order code, what happens next, and a transfer QR when paying by bank. */
export function OrderConfirmation({ order }: { order: Order }) {
  const [qr, setQr] = useState<string | null>(null);

  // Demo only: the QR holds the order code and amount, not a real bank account.
  useEffect(() => {
    if (order.payment !== "transfer") return;
    QRCode.toDataURL(`PHJN-DEMO|${order.code}|${order.total}`, { margin: 1, width: 440, color: { dark: "#1d2b45", light: "#fbf7f1" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [order]);

  const next =
    order.type === "table"
      ? `Quán đang pha, nhân viên sẽ mang ra bàn ${order.table} trong ít phút.`
      : `Đơn sẽ được giao tới ${order.address} trong khoảng 30 phút. Shipper sẽ gọi ${order.phone} khi tới.`;

  return (
    <div className="mx-auto max-w-lg px-4 pt-10 pb-16 text-center md:pt-16">
      <motion.div
        className="mx-auto grid size-16 place-items-center rounded-full bg-ink text-cream"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path d="M5 12.5 10 17 19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.4 }} />
        </svg>
      </motion.div>
      <h1 className="mt-5 font-display text-3xl md:text-4xl">Đặt món thành công</h1>
      <p className="mt-2 text-ink-soft">
        Mã đơn <strong className="font-semibold tracking-wider text-ink">{order.code}</strong>
      </p>
      <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-soft">{next}</p>

      {order.payment === "transfer" && (
        <div className="mt-8 rounded-3xl border border-line bg-card p-5 text-left">
          <h2 className="text-center font-display text-xl">Chuyển khoản VietQR</h2>
          <div className="mx-auto mt-4 aspect-square w-56 overflow-hidden rounded-2xl bg-paper">
            {qr && <img src={qr} alt={`Mã QR thanh toán đơn ${order.code}`} className="size-full" />}
          </div>
          <dl className="mt-4 space-y-1.5 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Số tiền</dt>
              <dd className="font-semibold tabular-nums">{formatVND(order.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Nội dung</dt>
              <dd className="font-semibold tracking-wider">{order.code}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-xl bg-paper-2 px-3 py-2 text-center text-xs text-ink-soft">
            Bản demo: mã QR chỉ chứa mã đơn và số tiền, không dùng để chuyển khoản thật.
          </p>
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-line bg-card p-5 text-left">
        <ul className="space-y-2 text-[15px]">
          {order.lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>
                {l.quantity} × {l.name}
                {l.summary && <span className="block text-xs text-ink-soft">{l.summary}</span>}
              </span>
              <span className="shrink-0 tabular-nums">{formatVND(l.total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-line pt-3 text-[15px]">
          {order.type === "delivery" && (
            <div className="flex justify-between text-ink-soft">
              <span>Phí giao hàng</span>
              <span className="tabular-nums">{order.shipping === 0 ? "Miễn phí" : formatVND(order.shipping)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold">
            <span>Tổng cộng</span>
            <span className="tabular-nums">{formatVND(order.total)}</span>
          </div>
          <p className="text-xs text-ink-soft">{order.payment === "cash" ? "Thanh toán bằng tiền mặt" : "Thanh toán chuyển khoản"}</p>
        </div>
      </div>

      <Link href="/menu" className="mt-8 inline-flex rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-caramel-dark">
        Tiếp tục xem thực đơn
      </Link>
      <p className="mt-4 text-xs text-ink-soft">Đây là dự án demo, đơn hàng không được gửi tới quán thật.</p>
    </div>
  );
}
