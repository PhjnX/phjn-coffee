import { priceProduct } from "./pricing";
import type { Menu, Selection } from "./types";

export const MAX_QTY = 20;
export const DELIVERY_FEE = 15000;
export const FREE_DELIVERY_FROM = 200000;

export type OrderType = "delivery" | "table";
export type PaymentMethod = "cash" | "transfer";

/** What the browser sends. Prices are deliberately absent: the server works them out again. */
export type OrderInput = {
  type: OrderType;
  table?: string;
  name: string;
  phone: string;
  address?: string;
  note?: string;
  payment: PaymentMethod;
  lines: { productId: string; selection: Selection; note: string; quantity: number }[];
};

export type OrderLine = { productId: string; name: string; summary: string; note: string; quantity: number; unitPrice: number; total: number };

export type Order = {
  code: string;
  type: OrderType;
  table?: string;
  name: string;
  phone: string;
  address?: string;
  note?: string;
  payment: PaymentMethod;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
};

export type OrderErrors = Partial<Record<"name" | "phone" | "address" | "table" | "lines" | "form", string>>;

export type OrderResult = { ok: true; order: Order } | { ok: false; errors: OrderErrors };

/** 0912 345 678, 091.234.5678 or +84 912 345 678 -> 0912345678; null if it is not a Vietnamese mobile number. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[\s.\-()]/g, "").replace(/^\+84/, "0");
  return /^0[35789]\d{8}$/.test(digits) ? digits : null;
}

/** Table numbers come from the QR code on each table: 1 to 3 digits, no leading zeros. */
export function normalizeTable(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  return /^[1-9]\d{0,2}$/.test(t) ? t : null;
}

export function shippingFee(type: OrderType, subtotal: number): number {
  if (type !== "delivery") return 0;
  return subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
}

/** Short order code customers can read out at the counter or put in a transfer note, e.g. "PJ-7K3F9Q". */
export function orderCode(now = Date.now(), random = Math.random): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const time = now.toString(36).toUpperCase().slice(-4);
  let tail = "";
  for (let i = 0; i < 2; i++) tail += alphabet[Math.floor(random() * alphabet.length)];
  return `PJ-${time}${tail}`;
}

/** Same short summary the product sheet shows: "Vừa · 50% đường · Trân châu đen". */
function summarize(picked: { group: { id: string }; option: { name: string; isDefault?: boolean } }[]): string {
  return picked
    .filter(({ group, option }) => group.id === "size" || !option.isDefault)
    .map(({ group, option }) => (group.id === "sugar" && option.name.endsWith("%") ? `${option.name} đường` : option.name))
    .join(" · ");
}

/**
 * Checks an order and prices it from the menu. Anything the browser claims about prices is
 * ignored; every line goes through priceProduct again.
 */
export function buildOrder(input: OrderInput, menu: Menu, code: string, createdAt: string): OrderResult {
  const errors: OrderErrors = {};

  const name = (input.name ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 50) errors.name = "Vui lòng nhập tên (2–50 ký tự).";

  const phone = normalizePhone(input.phone ?? "");
  if (!phone) errors.phone = "Số điện thoại chưa đúng, ví dụ 0912 345 678.";

  const type: OrderType = input.type === "table" ? "table" : "delivery";
  const table = type === "table" ? normalizeTable(input.table) : null;
  if (type === "table" && !table) errors.table = "Không nhận ra số bàn, hãy quét lại mã QR trên bàn.";

  const address = (input.address ?? "").trim();
  if (type === "delivery" && address.length < 8) errors.address = "Vui lòng nhập địa chỉ giao hàng đầy đủ.";

  const payment: PaymentMethod = input.payment === "transfer" ? "transfer" : "cash";
  const note = (input.note ?? "").trim().slice(0, 200);

  const lines: OrderLine[] = [];
  if (!Array.isArray(input.lines) || input.lines.length === 0) errors.lines = "Giỏ hàng đang trống.";
  else if (input.lines.length > 30) errors.lines = "Đơn có quá nhiều món, vui lòng tách thành nhiều đơn.";
  else {
    for (const line of input.lines) {
      const product = menu.products.find((p) => p.id === line.productId);
      const quantity = Number(line.quantity);
      if (!product) {
        errors.lines = "Có món không còn trong thực đơn, vui lòng xoá khỏi giỏ.";
        break;
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
        errors.lines = `Số lượng ${product.name} không hợp lệ.`;
        break;
      }
      const priced = priceProduct(product, menu.optionGroups, line.selection ?? {});
      if (!priced.ok) {
        errors.lines = `${product.name}: ${priced.errors[0]}`;
        break;
      }
      lines.push({
        productId: product.id,
        name: product.name,
        summary: summarize(priced.picked),
        note: (line.note ?? "").trim().slice(0, 120),
        quantity,
        unitPrice: priced.unitPrice,
        total: priced.unitPrice * quantity,
      });
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const shipping = shippingFee(type, subtotal);
  return {
    ok: true,
    order: {
      code,
      type,
      ...(table ? { table } : {}),
      name,
      phone: phone as string,
      ...(type === "delivery" ? { address } : {}),
      ...(note ? { note } : {}),
      payment,
      lines,
      subtotal,
      shipping,
      total: subtotal + shipping,
      createdAt,
    },
  };
}

/** Kitchen flow for an order. "ready" means waiting at the counter (table) or out for delivery. */
export type OrderStatus = "new" | "preparing" | "ready" | "completed" | "cancelled";

export const STATUS_FLOW: OrderStatus[] = ["new", "preparing", "ready", "completed"];

/** An order as kept by the shop, with where it is in the kitchen and whether it has been paid. */
export type StoredOrder = Order & {
  status: OrderStatus;
  paid: boolean;
  updatedAt: string;
  /** Generated sample data for the dashboard; can be removed in one click. */
  demo?: boolean;
};

/** Calendar day of an ISO time in Vietnam (UTC+7), as "YYYY-MM-DD". Orders are grouped by it. */
export function vnDay(iso: string | number | Date): string {
  return new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 10);
}
