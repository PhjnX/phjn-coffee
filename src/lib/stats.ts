import { type StoredOrder, vnDay } from "./order";
import type { Menu } from "./types";

export type DayPoint = { day: string; label: string; revenue: number; orders: number };
export type HourPoint = { hour: number; orders: number; revenue: number };
export type Ranked = { name: string; value: number; qty: number };

export type Stats = {
  days: number;
  revenue: number;
  orders: number;
  avgTicket: number;
  prevRevenue: number;
  prevOrders: number;
  daily: DayPoint[];
  hourly: HourPoint[];
  split: { table: number; delivery: number };
  topProducts: Ranked[];
  byCategory: Ranked[];
  tables: Ranked[];
};

const DAY_MS = 86_400_000;
const vnHour = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3600_000).getUTCHours();

/** Day keys ("YYYY-MM-DD", Vietnam time) for the `count` days ending on `endDay`, oldest first. */
export function dayRange(endDay: string, count: number): string[] {
  const end = Date.parse(`${endDay}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) => new Date(end - (count - 1 - i) * DAY_MS).toISOString().slice(0, 10));
}

/**
 * Everything the dashboard draws, for the `days` days ending today (Vietnam time), plus the
 * same-length period before it for the deltas. Cancelled orders are left out everywhere.
 */
export function computeStats(all: StoredOrder[], menu: Menu, days: number, now = Date.now()): Stats {
  const today = vnDay(now);
  const range = dayRange(today, days);
  const prevRange = new Set(dayRange(range[0], days + 1).slice(0, days));
  const inRange = new Set(range);
  const live = all.filter((o) => o.status !== "cancelled");
  const orders = live.filter((o) => inRange.has(vnDay(o.createdAt)));
  const prev = live.filter((o) => prevRange.has(vnDay(o.createdAt)));

  const daily = range.map((day) => {
    const list = orders.filter((o) => vnDay(o.createdAt) === day);
    const [, m, d] = day.split("-");
    return { day, label: `${Number(d)}/${Number(m)}`, revenue: sum(list), orders: list.length };
  });

  // Opening hours 7:00–22:00, so the chart has a fixed, readable span.
  const hourly = Array.from({ length: 15 }, (_, i) => {
    const hour = 7 + i;
    const list = orders.filter((o) => vnHour(o.createdAt) === hour);
    return { hour, orders: list.length, revenue: sum(list) };
  });

  const products = new Map<string, Ranked>();
  const categories = new Map<string, Ranked>();
  const catName = new Map(menu.categories.map((c) => [c.id, c.name]));
  const catOf = new Map(menu.products.map((p) => [p.id, p.categoryId]));
  for (const o of orders) {
    for (const l of o.lines) {
      const p = products.get(l.productId) ?? { name: l.name, value: 0, qty: 0 };
      p.value += l.total;
      p.qty += l.quantity;
      products.set(l.productId, p);
      const cid = catOf.get(l.productId) ?? "other";
      const c = categories.get(cid) ?? { name: catName.get(cid) ?? "Khác", value: 0, qty: 0 };
      c.value += l.total;
      c.qty += l.quantity;
      categories.set(cid, c);
    }
  }

  const tables = new Map<string, Ranked>();
  for (const o of orders.filter((x) => x.type === "table")) {
    const t = tables.get(o.table ?? "?") ?? { name: `Bàn ${o.table}`, value: 0, qty: 0 };
    t.value += o.total;
    t.qty += 1;
    tables.set(o.table ?? "?", t);
  }

  const revenue = sum(orders);
  return {
    days,
    revenue,
    orders: orders.length,
    avgTicket: orders.length ? Math.round(revenue / orders.length) : 0,
    prevRevenue: sum(prev),
    prevOrders: prev.length,
    daily,
    hourly,
    split: { table: orders.filter((o) => o.type === "table").length, delivery: orders.filter((o) => o.type === "delivery").length },
    topProducts: [...products.values()].sort((a, b) => b.qty - a.qty).slice(0, 6),
    byCategory: [...categories.values()].sort((a, b) => b.value - a.value),
    tables: [...tables.values()].sort((a, b) => b.value - a.value).slice(0, 6),
  };
}

function sum(list: StoredOrder[]) {
  return list.reduce((s, o) => s + o.total, 0);
}
