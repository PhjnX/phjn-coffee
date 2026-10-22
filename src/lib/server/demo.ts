import { buildOrder, type StoredOrder, vnDay } from "../order";
import { defaultSelection } from "../pricing";
import type { Menu } from "../types";
import { dayRange } from "../stats";

const NAMES = ["Lan", "Minh", "Hà", "Tuấn", "Vy", "Khoa", "Thảo", "Phúc", "My", "Đức", "Ngân", "Quân"];
// Relative weight of each opening hour 7..21: a morning rush, a quiet lunch, an afternoon peak.
const HOUR_WEIGHT = [9, 12, 8, 5, 4, 3, 4, 7, 9, 8, 5, 4, 5, 4, 2];

/** Small seeded generator so the same day always produces the same orders. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function pick<T>(r: () => number, items: T[], weight: (t: T) => number = () => 1): T {
  const total = items.reduce((s, t) => s + weight(t), 0);
  let x = r() * total;
  for (const t of items) if ((x -= weight(t)) <= 0) return t;
  return items[items.length - 1];
}

/**
 * Sample orders for the last `days` days so the dashboard has something to show. Prices go
 * through buildOrder like real ones. Past days are completed; today's are spread across statuses.
 */
export function demoOrders(menu: Menu, tables: string[], days = 30, now = Date.now()): StoredOrder[] {
  const today = vnDay(now);
  const nowHour = new Date(now + 7 * 3600_000).getUTCHours();
  const products = menu.products.filter((p) => p.isAvailable);
  const out: StoredOrder[] = [];

  for (const [i, day] of dayRange(today, days).entries()) {
    const r = rng(Number(day.replace(/-/g, "")));
    const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
    const weekend = weekday === 0 || weekday === 6;
    const growth = 0.8 + (i / days) * 0.4; // a gentle upward trend over the month
    let count = Math.round((22 + r() * 14) * (weekend ? 1.35 : 1) * growth);
    if (day === today) count = Math.round((count * Math.max(0, Math.min(15, nowHour - 6))) / 15);

    for (let n = 0; n < count; n++) {
      const hour = pick(r, HOUR_WEIGHT.map((w, h) => ({ h: 7 + h, w })), (x) => x.w).h;
      if (day === today && hour > nowHour) continue;
      const minute = Math.floor(r() * 60);
      const createdAt = new Date(Date.parse(`${day}T00:00:00Z`) + ((hour - 7) * 60 + minute) * 60_000).toISOString();
      const atTable = r() < 0.62 && tables.length > 0;
      const lineCount = 1 + Math.floor(r() * r() * 3);
      const lines = Array.from({ length: lineCount }, () => {
        const p = pick(r, products, (x) => (x.badge === "bestseller" ? 4 : x.badge ? 2 : 1));
        const selection = defaultSelection(p, menu.optionGroups);
        if (selection.size && r() < 0.45) selection.size = [r() < 0.6 ? "size-m" : "size-l"];
        return { productId: p.id, selection, note: "", quantity: r() < 0.8 ? 1 : 2 };
      });
      const built = buildOrder(
        {
          type: atTable ? "table" : "delivery",
          table: atTable ? pick(r, tables) : undefined,
          name: pick(r, NAMES),
          phone: `09${String(Math.floor(r() * 1e8)).padStart(8, "0")}`,
          address: "Địa chỉ mẫu, Quận 1, TP.HCM",
          payment: r() < 0.55 ? "transfer" : "cash",
          lines,
        },
        menu,
        `PJ-D${day.slice(5).replace("-", "")}${String(n).padStart(2, "0")}`,
        createdAt,
      );
      if (!built.ok) continue;
      const late = day !== today || Date.parse(createdAt) < now - 45 * 60_000;
      const status = late ? (r() < 0.04 ? "cancelled" : "completed") : pick(r, ["new", "preparing", "ready"] as const);
      out.push({ ...built.order, status, paid: status === "completed", updatedAt: createdAt, demo: true });
    }
  }
  return out;
}
