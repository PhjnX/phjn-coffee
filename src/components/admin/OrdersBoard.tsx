"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { listOrders, setOrderPaid, setOrderStatus } from "@/app/admin/actions";
import { formatVND, normalize } from "@/lib/format";
import { EmptyState, field, PageHeader } from "./AdminUI";
import type { OrderStatus, StoredOrder } from "@/lib/order";

const POLL_MS = 5000;

type StatusFilter = "open" | "all" | OrderStatus;

const STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  new: { label: "Mới", tone: "bg-caramel text-cream" },
  preparing: { label: "Đang pha", tone: "bg-[#e9c46a]/40 text-ink" },
  ready: { label: "Sẵn sàng", tone: "bg-[#7a8a55]/20 text-[#4d5a30]" },
  completed: { label: "Hoàn tất", tone: "bg-paper-2 text-ink-soft" },
  cancelled: { label: "Đã huỷ", tone: "bg-paper-2 text-ink-soft line-through" },
};

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "open", label: "Đang xử lý" },
  { id: "new", label: "Mới" },
  { id: "preparing", label: "Đang pha" },
  { id: "ready", label: "Sẵn sàng" },
  { id: "completed", label: "Hoàn tất" },
  { id: "cancelled", label: "Đã huỷ" },
  { id: "all", label: "Tất cả" },
];

/** What the main button on an order card does next. */
function nextStep(o: StoredOrder): { to: OrderStatus; label: string } | null {
  if (o.status === "new") return { to: "preparing", label: "Bắt đầu pha" };
  if (o.status === "preparing") return { to: "ready", label: o.type === "table" ? "Pha xong, mang ra" : "Giao cho shipper" };
  if (o.status === "ready") return { to: "completed", label: "Hoàn tất" };
  return null;
}

const time = (iso: string) => new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });

/**
 * The counter's order board. Polls for new orders every few seconds, filters by day, status,
 * table/delivery and search, and can group the day's table orders by table to settle a bill.
 */
export function OrdersBoard({ today, initialOrders, tables }: { today: string; initialOrders: StoredOrder[]; tables: string[] }) {
  const [day, setDay] = useState(today);
  const [orders, setOrders] = useState(initialOrders);
  const [status, setStatus] = useState<StatusFilter>("open");
  const [type, setType] = useState<"all" | "table" | "delivery">("all");
  const [table, setTable] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "tables">("list");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const seen = useRef(new Set(initialOrders.map((o) => o.code)));

  const load = useCallback(async (d: string) => {
    const next = await listOrders(d);
    const arrived = next.filter((o) => !seen.current.has(o.code)).map((o) => o.code);
    next.forEach((o) => seen.current.add(o.code));
    if (arrived.length && d === today) {
      setFresh((f) => new Set([...f, ...arrived]));
      document.title = `(${arrived.length}) Đơn mới · Quản trị Phjn`;
    }
    setOrders(next);
  }, [today]);

  // Poll while the tab is visible.
  useEffect(() => {
    const tick = () => document.visibilityState === "visible" && load(day);
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [day, load]);

  function changeDay(d: string) {
    setDay(d);
    startTransition(() => load(d));
  }

  function act(code: string, fn: () => Promise<void>, patch: Partial<StoredOrder>) {
    setOrders((list) => list.map((o) => (o.code === code ? { ...o, ...patch } : o)));
    setFresh((f) => {
      const n = new Set(f);
      n.delete(code);
      return n;
    });
    document.title = "Đơn hàng · Quản trị Phjn";
    startTransition(async () => {
      await fn();
      await load(day);
    });
  }

  const q = normalize(query);
  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (status === "open" && !["new", "preparing", "ready"].includes(o.status)) return false;
        if (status !== "open" && status !== "all" && o.status !== status) return false;
        if (type !== "all" && o.type !== type) return false;
        if (table && o.table !== table) return false;
        if (q && !normalize(`${o.code} ${o.name} ${o.phone} ${o.table ?? ""}`).includes(q)) return false;
        return true;
      }),
    [orders, status, type, table, q],
  );

  const countFor = (f: StatusFilter) =>
    orders.filter((o) => (f === "all" ? true : f === "open" ? ["new", "preparing", "ready"].includes(o.status) : o.status === f)).length;

  const live = orders.filter((o) => o.status !== "cancelled");

  return (
    <div>
      <PageHeader
        kicker="Quầy pha chế"
        title="Đơn hàng"
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              {live.length} đơn · {formatVND(live.reduce((s, o) => s + o.total, 0))}
            </span>
            {day === today && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-matcha/15 px-2.5 py-0.5 text-xs text-[#4d5a30]">
                <span className="size-1.5 animate-pulse rounded-full bg-matcha" />
                Tự cập nhật
              </span>
            )}
          </span>
        }
        actions={
          <>
            <input
              type="date"
              value={day}
              max={today}
              onChange={(e) => e.target.value && changeDay(e.target.value)}
              className="rounded-full border border-line bg-card px-4 py-2 text-sm outline-none focus:border-caramel"
              aria-label="Ngày"
            />
            <div className="flex rounded-full bg-paper-2 p-1 text-sm" role="group" aria-label="Cách xem">
              {(["list", "tables"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`rounded-full px-4 py-1.5 transition-colors ${view === v ? "bg-card font-semibold shadow-sm" : "text-ink-soft hover:text-ink"}`}
                >
                  {v === "list" ? "Danh sách" : "Theo bàn"}
                </button>
              ))}
            </div>
          </>
        }
      />

      {/* Filters */}
      <div className="sticky top-14 z-20 -mx-4 mt-8 space-y-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 lg:top-0 lg:-mx-12 lg:px-12">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatus(f.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap ${
                status === f.id ? "border-ink bg-ink text-cream" : "border-line bg-card text-ink-soft"
              }`}
            >
              {f.label} <span className="tabular-nums opacity-70">{countFor(f.id)}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="rounded-full border border-line bg-card px-4 py-2 text-sm outline-none focus:border-caramel"
            aria-label="Hình thức"
          >
            <option value="all">Tại bàn + giao hàng</option>
            <option value="table">Chỉ tại bàn</option>
            <option value="delivery">Chỉ giao hàng</option>
          </select>
          <select value={table} onChange={(e) => setTable(e.target.value)} className="rounded-full border border-line bg-card px-4 py-2 text-sm outline-none focus:border-caramel" aria-label="Bàn">
            <option value="">Mọi bàn</option>
            {tables.map((t) => (
              <option key={t} value={t}>
                Bàn {t}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mã đơn, tên, số điện thoại…"
            className={`min-w-48 flex-1 ${field}`}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        orders.length === 0 ? (
        <EmptyState title="Chưa có đơn nào" text={day === today ? "Đơn khách đặt trên web hoặc quét QR tại bàn sẽ hiện ở đây trong vài giây." : "Ngày này không có đơn hàng."} />
      ) : (
        <EmptyState title="Không có đơn khớp bộ lọc" text="Thử chọn trạng thái khác hoặc xoá ô tìm kiếm." />
      )
      ) : view === "list" ? (
        <ul className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {filtered.map((o) => (
              <motion.li key={o.code} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <OrderCard order={o} fresh={fresh.has(o.code)} onAct={act} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <ByTable orders={filtered} onAct={act} />
      )}
    </div>
  );
}

type Act = (code: string, fn: () => Promise<void>, patch: Partial<StoredOrder>) => void;

function OrderCard({ order: o, fresh, onAct }: { order: StoredOrder; fresh: boolean; onAct: Act }) {
  const step = nextStep(o);
  const canCancel = o.status === "new" || o.status === "preparing";
  return (
    <article className={`flex h-full flex-col rounded-[24px] border bg-card p-5 transition-shadow ${fresh ? "border-caramel shadow-[0_0_0_3px_rgb(176_129_85/0.25)]" : "border-line shadow-[0_18px_40px_-34px_rgb(59_46_37/0.6)]"}`}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl leading-none">{o.type === "table" ? `Bàn ${o.table}` : "Giao hàng"}</p>
          <p className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
            <span className="tabular-nums">{time(o.createdAt)}</span>
            <span>·</span>
            <span className="tracking-wider">{o.code}</span>
            {fresh && <span className="rounded-full bg-caramel px-2 py-0.5 font-semibold text-cream">Mới đến</span>}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[o.status].tone}`}>{STATUS[o.status].label}</span>
      </header>

      <p className="mt-3 text-[15px]">
        <span className="font-semibold">{o.name}</span> ·{" "}
        <a href={`tel:${o.phone}`} className="text-caramel-dark underline-offset-2 hover:underline">
          {o.phone}
        </a>
      </p>
      {o.address && <p className="mt-0.5 text-sm text-ink-soft">{o.address}</p>}

      <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-[15px]">
        {o.lines.map((l, i) => (
          <li key={i}>
            <span className="font-semibold tabular-nums">{l.quantity} ×</span> {l.name}
            {l.summary && <span className="block text-xs text-ink-soft">{l.summary}</span>}
            {l.note && <span className="block text-xs text-caramel-dark">“{l.note}”</span>}
          </li>
        ))}
      </ul>
      {o.note && <p className="mt-2 rounded-xl bg-paper-2 px-3 py-2 text-sm">Ghi chú: {o.note}</p>}

      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
          <span>
            <span className="font-semibold">{formatVND(o.total)}</span>
            <span className="text-ink-soft"> · {o.payment === "cash" ? "Tiền mặt" : "Chuyển khoản"}</span>
          </span>
          {o.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onAct(o.code, () => setOrderPaid(o.code, !o.paid), { paid: !o.paid })}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${o.paid ? "bg-[#7a8a55]/20 text-[#4d5a30]" : "border border-line text-ink-soft"}`}
            >
              {o.paid ? "Đã thu" : "Chưa thu"}
            </button>
          )}
        </div>
        {(step || canCancel) && (
          <div className="mt-3 flex gap-2">
            {canCancel && (
              <button
                type="button"
                onClick={() => confirm(`Huỷ đơn ${o.code}?`) && onAct(o.code, () => setOrderStatus(o.code, "cancelled"), { status: "cancelled" })}
                className="rounded-full border border-line px-4 py-2.5 text-sm text-ink-soft hover:border-[#b4442b] hover:text-[#9a3a24]"
              >
                Huỷ
              </button>
            )}
            {step && (
              <button
                type="button"
                onClick={() => onAct(o.code, () => setOrderStatus(o.code, step.to), { status: step.to, ...(step.to === "completed" ? { paid: true } : {}) })}
                className="flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-caramel-dark"
              >
                {step.label}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** Groups orders by table (deliveries in their own group) with what each table still owes. */
function ByTable({ orders, onAct }: { orders: StoredOrder[]; onAct: Act }) {
  const groups = new Map<string, StoredOrder[]>();
  for (const o of orders) {
    const key = o.type === "table" ? `Bàn ${o.table}` : "Giao hàng";
    groups.set(key, [...(groups.get(key) ?? []), o]);
  }
  const keys = [...groups.keys()].sort((a, b) =>
    a === "Giao hàng" ? 1 : b === "Giao hàng" ? -1 : Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")),
  );

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {keys.map((key) => {
        const list = groups.get(key) ?? [];
        const live = list.filter((o) => o.status !== "cancelled");
        const owed = live.filter((o) => !o.paid).reduce((s, o) => s + o.total, 0);
        return (
          <section key={key} className="rounded-3xl border border-line bg-card p-4">
            <header className="flex items-baseline justify-between">
              <h2 className="font-display text-xl">{key}</h2>
              <span className="text-sm text-ink-soft">
                {live.length} đơn · {formatVND(live.reduce((s, o) => s + o.total, 0))}
              </span>
            </header>
            <ul className="mt-3 divide-y divide-line">
              {list.map((o) => (
                <li key={o.code} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="tabular-nums text-ink-soft">{time(o.createdAt)}</span> · {o.lines.reduce((n, l) => n + l.quantity, 0)} món ·{" "}
                    <span className="font-semibold">{formatVND(o.total)}</span>
                    <span className="block truncate text-xs text-ink-soft">{o.lines.map((l) => `${l.quantity} ${l.name}`).join(", ")}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[o.status].tone}`}>{STATUS[o.status].label}</span>
                </li>
              ))}
            </ul>
            {owed > 0 && (
              <button
                type="button"
                onClick={() => live.filter((o) => !o.paid).forEach((o) => onAct(o.code, () => setOrderPaid(o.code, true), { paid: true }))}
                className="mt-3 w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-caramel-dark"
              >
                Thu tiền {key === "Giao hàng" ? "các đơn giao" : key.toLowerCase()} · {formatVND(owed)}
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
