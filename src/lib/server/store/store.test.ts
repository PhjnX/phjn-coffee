import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { seedMenu } = await import("../../menu-data");
const { rows } = await import("./supabase");
const { vnDayBounds } = await import("./index");
import type { StoredOrder } from "../../order";

describe("vnDayBounds", () => {
  it("covers one Vietnam calendar day (UTC+7)", () => {
    expect(vnDayBounds("2026-10-22")).toEqual(["2026-10-21T17:00:00.000Z", "2026-10-22T17:00:00.000Z"]);
  });
});

describe("Supabase row converters", () => {
  it("round-trips every seed product without losing fields", () => {
    for (const [i, p] of seedMenu.products.entries()) expect(rows.toProduct(rows.fromProduct(p, i))).toEqual(p);
  });

  it("round-trips table and delivery orders", () => {
    const base: StoredOrder = {
      code: "PJ-TEST01",
      type: "table",
      table: "5",
      name: "Lan",
      phone: "0912345678",
      payment: "cash",
      lines: [{ productId: "p-latte", name: "Latte", summary: "Nhỏ", note: "", quantity: 1, unitPrice: 45000, total: 45000 }],
      subtotal: 45000,
      shipping: 0,
      total: 45000,
      createdAt: "2026-10-22T02:00:00.000Z",
      updatedAt: "2026-10-22T02:00:00.000Z",
      status: "new",
      paid: false,
    };
    expect(rows.toOrder(rows.fromOrder(base))).toEqual(base);
    const delivery: StoredOrder = { ...base, type: "delivery", table: undefined, address: "12 Nguyễn Huệ", note: "Gọi trước", shipping: 15000, total: 60000, demo: true };
    delete delivery.table;
    expect(rows.toOrder(rows.fromOrder(delivery))).toEqual(delivery);
  });
});
