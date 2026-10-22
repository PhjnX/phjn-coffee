import type { StoredOrder } from "../../order";
import type { Menu, Product } from "../../types";

export type Table = {
  /** What the QR code carries: "?ban=<number>". */
  number: string;
  /** Where it is, e.g. "Tầng 1", "Sân trước". */
  area: string;
};

/**
 * Everything the app reads or writes. Two implementations: a JSON file for local development
 * (store/file.ts) and Supabase for production (store/supabase.ts). Pages and actions only see this.
 */
export interface Store {
  getMenu(): Promise<Menu>;
  getTables(): Promise<Table[]>;

  /** Orders with createdAt in [fromIso, toIso), newest first. */
  ordersBetween(fromIso: string, toIso: string): Promise<StoredOrder[]>;
  countOrders(): Promise<{ total: number; demo: number }>;
  insertOrder(order: StoredOrder): Promise<void>;
  updateOrder(code: string, patch: Partial<Pick<StoredOrder, "status" | "paid">>): Promise<void>;
  /** Remove all sample orders, then insert `orders` (if given). */
  replaceDemoOrders(orders: StoredOrder[] | null): Promise<void>;

  /** Insert or replace a product by id. */
  saveProduct(product: Product): Promise<void>;
  setAvailable(id: string, isAvailable: boolean): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  /** False when the table number already exists. */
  addTable(table: Table): Promise<boolean>;
  deleteTable(number: string): Promise<void>;

  /** Stores an image and returns the URL to show it. */
  savePhoto(name: string, data: Buffer, contentType: string): Promise<string>;

  /** Fixed-window rate limit; true if this attempt is allowed. */
  hit(key: string, limit: number, windowMs: number): Promise<boolean>;
  clearHits(key: string): Promise<void>;
}
