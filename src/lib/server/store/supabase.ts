import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus, PaymentMethod, StoredOrder } from "../../order";
import type { Category, Menu, OptionGroup, Product, ProductArtSpec } from "../../types";
import { seedData } from "./seed";
import type { Store, Table } from "./types";

/**
 * Production store on Supabase (Postgres + Storage). Tables are created by supabase/schema.sql.
 * The service-role key is server-only and bypasses row-level security; RLS is on with no policies,
 * so the public anon key can read or write nothing.
 */

export const PHOTO_BUCKET = "menu-photos";

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function check<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Supabase ${what}: ${res.error.message}`);
  return res.data;
}

// ── Row shapes ─────────────────────────────────────────────────────────────

type ProductRow = {
  id: string;
  slug: string;
  category_id: string;
  name: string;
  description: string;
  base_price: number;
  is_available: boolean;
  badge: Product["badge"] | null;
  option_group_ids: string[];
  art: ProductArtSpec;
  image: string | null;
  photo: string | null;
  sort: number;
};

type OrderRow = {
  code: string;
  created_at: string;
  updated_at: string;
  type: "delivery" | "table";
  table_number: string | null;
  name: string;
  phone: string;
  address: string | null;
  note: string | null;
  payment: PaymentMethod;
  status: OrderStatus;
  paid: boolean;
  lines: StoredOrder["lines"];
  subtotal: number;
  shipping: number;
  total: number;
  demo: boolean;
};

const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  slug: r.slug,
  categoryId: r.category_id,
  name: r.name,
  description: r.description,
  basePrice: r.base_price,
  isAvailable: r.is_available,
  ...(r.badge ? { badge: r.badge } : {}),
  optionGroupIds: r.option_group_ids ?? [],
  art: r.art,
  ...(r.image ? { image: r.image } : {}),
  ...(r.photo ? { photo: r.photo } : {}),
});

const fromProduct = (p: Product, sort: number): ProductRow => ({
  id: p.id,
  slug: p.slug,
  category_id: p.categoryId,
  name: p.name,
  description: p.description,
  base_price: p.basePrice,
  is_available: p.isAvailable,
  badge: p.badge ?? null,
  option_group_ids: p.optionGroupIds,
  art: p.art,
  image: p.image ?? null,
  photo: p.photo ?? null,
  sort,
});

const toOrder = (r: OrderRow): StoredOrder => ({
  code: r.code,
  createdAt: new Date(r.created_at).toISOString(),
  updatedAt: new Date(r.updated_at).toISOString(),
  type: r.type,
  ...(r.table_number ? { table: r.table_number } : {}),
  name: r.name,
  phone: r.phone,
  ...(r.address ? { address: r.address } : {}),
  ...(r.note ? { note: r.note } : {}),
  payment: r.payment,
  status: r.status,
  paid: r.paid,
  lines: r.lines,
  subtotal: r.subtotal,
  shipping: r.shipping,
  total: r.total,
  ...(r.demo ? { demo: true } : {}),
});

const fromOrder = (o: StoredOrder): OrderRow => ({
  code: o.code,
  created_at: o.createdAt,
  updated_at: o.updatedAt,
  type: o.type,
  table_number: o.table ?? null,
  name: o.name,
  phone: o.phone,
  address: o.address ?? null,
  note: o.note ?? null,
  payment: o.payment,
  status: o.status,
  paid: o.paid,
  lines: o.lines,
  subtotal: o.subtotal,
  shipping: o.shipping,
  total: o.total,
  demo: o.demo === true,
});

// ── First run ──────────────────────────────────────────────────────────────

let seeding: Promise<void> | null = null;

/** Fills an empty project with the starting menu and 12 tables, once. */
function ensureSeeded(): Promise<void> {
  seeding ??= (async () => {
    const { count } = await db().from("categories").select("id", { count: "exact", head: true });
    if (count && count > 0) return;
    const { menu, tables } = seedData();
    check(await db().from("categories").upsert(menu.categories.map((c) => ({ ...c }))), "seed categories");
    check(
      await db()
        .from("option_groups")
        .upsert(
          Object.values(menu.optionGroups).map((g, i) => ({
            id: g.id,
            name: g.name,
            select_type: g.selectType,
            is_required: g.isRequired,
            max_select: g.maxSelect ?? null,
            options: g.options,
            sort: i,
          })),
        ),
      "seed option groups",
    );
    check(await db().from("products").upsert(menu.products.map((p, i) => fromProduct(p, i))), "seed products");
    check(await db().from("shop_tables").upsert(tables), "seed tables");
  })().catch((err) => {
    seeding = null;
    throw err;
  });
  return seeding;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const supabaseStore: Store = {
  async getMenu(): Promise<Menu> {
    await ensureSeeded();
    const [cats, groups, prods] = await Promise.all([
      db().from("categories").select("*").order("sort"),
      db().from("option_groups").select("*").order("sort"),
      db().from("products").select("*").order("sort"),
    ]);
    const categories = check(cats, "categories") as Category[];
    const optionGroups: Record<string, OptionGroup> = {};
    for (const g of check(groups, "option groups") as {
      id: string;
      name: string;
      select_type: "single" | "multi";
      is_required: boolean;
      max_select: number | null;
      options: OptionGroup["options"];
    }[]) {
      optionGroups[g.id] = {
        id: g.id,
        name: g.name,
        selectType: g.select_type,
        isRequired: g.is_required,
        ...(g.max_select ? { maxSelect: g.max_select } : {}),
        options: g.options,
      };
    }
    return { categories, optionGroups, products: (check(prods, "products") as ProductRow[]).map(toProduct) };
  },

  async getTables() {
    await ensureSeeded();
    const rows = check(await db().from("shop_tables").select("number, area"), "tables") as Table[];
    return rows.sort((a, b) => Number(a.number) - Number(b.number));
  },

  async ordersBetween(from, to) {
    // Supabase returns at most 1000 rows per request, so page through.
    const out: StoredOrder[] = [];
    for (let start = 0; ; start += 1000) {
      const rows = check(
        await db().from("orders").select("*").gte("created_at", from).lt("created_at", to).order("created_at", { ascending: false }).range(start, start + 999),
        "orders",
      ) as OrderRow[];
      out.push(...rows.map(toOrder));
      if (rows.length < 1000) return out;
    }
  },

  async countOrders() {
    const [all, demo] = await Promise.all([
      db().from("orders").select("code", { count: "exact", head: true }),
      db().from("orders").select("code", { count: "exact", head: true }).eq("demo", true),
    ]);
    return { total: all.count ?? 0, demo: demo.count ?? 0 };
  },

  async insertOrder(order) {
    check(await db().from("orders").insert(fromOrder(order)), "insert order");
  },

  async updateOrder(code, patch) {
    check(await db().from("orders").update({ ...patch, updated_at: new Date().toISOString() }).eq("code", code), "update order");
  },

  async replaceDemoOrders(orders) {
    check(await db().from("orders").delete().eq("demo", true), "clear demo orders");
    const rows = (orders ?? []).map(fromOrder);
    for (let i = 0; i < rows.length; i += 500) check(await db().from("orders").insert(rows.slice(i, i + 500)), "insert demo orders");
  },

  async saveProduct(product) {
    const existing = check(await db().from("products").select("sort").eq("id", product.id).maybeSingle(), "find product") as { sort: number } | null;
    let sort = existing?.sort;
    if (sort === undefined) {
      const last = check(await db().from("products").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle(), "last sort") as {
        sort: number;
      } | null;
      sort = (last?.sort ?? -1) + 1;
    }
    check(await db().from("products").upsert(fromProduct(product, sort)), "save product");
  },

  async setAvailable(id, isAvailable) {
    check(await db().from("products").update({ is_available: isAvailable }).eq("id", id), "set available");
  },

  async deleteProduct(id) {
    check(await db().from("products").delete().eq("id", id), "delete product");
  },

  async addTable(table) {
    const res = await db().from("shop_tables").insert(table);
    if (res.error?.code === "23505") return false; // unique violation: number already used
    check(res, "add table");
    return true;
  },

  async deleteTable(number) {
    check(await db().from("shop_tables").delete().eq("number", number), "delete table");
  },

  async savePhoto(name, data, contentType) {
    const storage = db().storage.from(PHOTO_BUCKET);
    check(await storage.upload(name, data, { contentType, upsert: false, cacheControl: "31536000" }), "upload photo");
    return storage.getPublicUrl(name).data.publicUrl;
  },

  async hit(key, limit, windowMs) {
    const { data, error } = await db().rpc("hit_rate_limit", { p_key: key, p_limit: limit, p_window_ms: windowMs });
    // If the limiter itself fails, don't lock customers or the owner out.
    if (error) {
      console.error("rate limit:", error.message);
      return true;
    }
    return data === true;
  },

  async clearHits(key) {
    await db().from("rate_limits").delete().eq("key", key);
  },
};

/** Row converters, exported for tests. */
export const rows = { toProduct, fromProduct, toOrder, fromOrder };
