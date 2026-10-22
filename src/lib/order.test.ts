import { describe, expect, it } from "vitest";
import { seedMenu } from "./menu-data";
import { buildOrder, normalizePhone, normalizeTable, type OrderInput, orderCode, shippingFee } from "./order";
import { defaultSelection } from "./pricing";
import type { Product } from "./types";

const milkTea = seedMenu.products.find((p) => p.id === "p-ts-truyen-thong") as Product; // 35.000
const soldOut = seedMenu.products.find((p) => p.id === "p-hong-tra-kem-muoi") as Product;

const base: OrderInput = {
  type: "delivery",
  name: "Lan",
  phone: "0912 345 678",
  address: "12 Nguyễn Huệ, Quận 1",
  payment: "cash",
  lines: [{ productId: milkTea.id, selection: defaultSelection(milkTea, seedMenu.optionGroups), note: "", quantity: 2 }],
};

const build = (patch: Partial<OrderInput>) => buildOrder({ ...base, ...patch }, seedMenu, "PJ-TEST", "2026-10-21T08:00:00Z");

describe("normalizePhone", () => {
  it("accepts common ways of writing a Vietnamese mobile number", () => {
    expect(normalizePhone("0912 345 678")).toBe("0912345678");
    expect(normalizePhone("+84 912.345.678")).toBe("0912345678");
  });
  it("rejects landlines and short numbers", () => {
    expect(normalizePhone("0283 812 3456")).toBeNull();
    expect(normalizePhone("09123")).toBeNull();
  });
});

describe("normalizeTable", () => {
  it("keeps 1–3 digit table numbers and rejects anything else", () => {
    expect(normalizeTable("12")).toBe("12");
    expect(normalizeTable("012")).toBeNull();
    expect(normalizeTable("12a")).toBeNull();
    expect(normalizeTable(null)).toBeNull();
  });
});

describe("shippingFee", () => {
  it("charges delivery under the free threshold and nothing at a table", () => {
    expect(shippingFee("delivery", 70000)).toBe(15000);
    expect(shippingFee("delivery", 200000)).toBe(0);
    expect(shippingFee("table", 70000)).toBe(0);
  });
});

describe("orderCode", () => {
  it("is short, prefixed and avoids look-alike characters", () => {
    const code = orderCode(1_790_000_000_000, () => 0.5);
    expect(code).toMatch(/^PJ-[0-9A-Z]{6}$/);
    expect(code.slice(-2)).toMatch(/^[2-9A-HJ-NP-Z]{2}$/);
  });
});

describe("buildOrder", () => {
  it("prices lines from the menu and adds the delivery fee", () => {
    const r = build({});
    expect(r).toMatchObject({ ok: true, order: { subtotal: 70000, shipping: 15000, total: 85000, phone: "0912345678" } });
  });

  it("ignores any price the browser might send", () => {
    const tampered = { ...base.lines[0], unitPrice: 1 } as OrderInput["lines"][number];
    const r = build({ lines: [tampered] });
    expect(r.ok && r.order.lines[0].unitPrice).toBe(35000);
  });

  it("needs a table number for table orders and skips the address", () => {
    expect(build({ type: "table", table: undefined, address: "" })).toMatchObject({ ok: false, errors: { table: expect.any(String) } });
    expect(build({ type: "table", table: "7", address: "" })).toMatchObject({ ok: true, order: { table: "7", shipping: 0 } });
  });

  it("reports missing contact details", () => {
    const r = build({ name: " ", phone: "123", address: "" });
    expect(r).toMatchObject({ ok: false, errors: { name: expect.any(String), phone: expect.any(String), address: expect.any(String) } });
  });

  it("rejects sold-out items, unknown items and bad quantities", () => {
    const line = (p: Product, quantity = 1) => ({ productId: p.id, selection: defaultSelection(p, seedMenu.optionGroups), note: "", quantity });
    expect(build({ lines: [line(soldOut)] }).ok).toBe(false);
    expect(build({ lines: [{ ...line(milkTea), productId: "nope" }] }).ok).toBe(false);
    expect(build({ lines: [line(milkTea, 0)] }).ok).toBe(false);
    expect(build({ lines: [] }).ok).toBe(false);
  });
});
