import { promises as fs } from "node:fs";
import path from "node:path";
import type { StoredOrder } from "../../order";
import type { Menu } from "../../types";
import { seedData } from "./seed";
import type { Store, Table } from "./types";

/**
 * Local-development store: one JSON file (data/db.json, created from the seed on first use) and
 * uploaded photos in data/uploads, served by app/uploads/[file]. Needs a writable disk, so it is
 * only used when Supabase isn't configured.
 */

type Db = { version: 1; menu: Menu; orders: StoredOrder[]; tables: Table[] };

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "db.json");

async function readDb(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const db: Db = { version: 1, ...seedData(), orders: [] };
    await write(db);
    return db;
  }
}

async function write(db: Db) {
  await fs.mkdir(DIR, { recursive: true });
  // Write to a temp file first so a crash mid-write never leaves a half-written database.
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 1), "utf8");
  await fs.rename(tmp, FILE);
}

// One write at a time, so two orders arriving together don't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();
function update<T>(change: (db: Db) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = change(db);
    await write(db);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

const hits = new Map<string, { count: number; resetAt: number }>();

export const fileStore: Store = {
  async getMenu() {
    return (await readDb()).menu;
  },
  async getTables() {
    return (await readDb()).tables;
  },

  async ordersBetween(from, to) {
    return (await readDb()).orders.filter((o) => o.createdAt >= from && o.createdAt < to).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async countOrders() {
    const { orders } = await readDb();
    return { total: orders.length, demo: orders.filter((o) => o.demo).length };
  },
  async insertOrder(order) {
    await update((db) => void db.orders.push(order));
  },
  async updateOrder(code, patch) {
    await update((db) => {
      const o = db.orders.find((x) => x.code === code);
      if (o) Object.assign(o, patch, { updatedAt: new Date().toISOString() });
    });
  },
  async replaceDemoOrders(orders) {
    await update((db) => {
      db.orders = [...db.orders.filter((o) => !o.demo), ...(orders ?? [])];
    });
  },

  async saveProduct(product) {
    await update((db) => {
      const i = db.menu.products.findIndex((p) => p.id === product.id);
      if (i >= 0) db.menu.products[i] = product;
      else db.menu.products.push(product);
    });
  },
  async setAvailable(id, isAvailable) {
    await update((db) => {
      const p = db.menu.products.find((x) => x.id === id);
      if (p) p.isAvailable = isAvailable;
    });
  },
  async deleteProduct(id) {
    await update((db) => {
      db.menu.products = db.menu.products.filter((p) => p.id !== id);
    });
  },

  async addTable(table) {
    return update((db) => {
      if (db.tables.some((t) => t.number === table.number)) return false;
      db.tables.push(table);
      db.tables.sort((a, b) => Number(a.number) - Number(b.number));
      return true;
    });
  },
  async deleteTable(number) {
    await update((db) => {
      db.tables = db.tables.filter((t) => t.number !== number);
    });
  },

  async savePhoto(name, data) {
    await fs.mkdir(path.join(DIR, "uploads"), { recursive: true });
    await fs.writeFile(path.join(DIR, "uploads", name), data);
    return `/uploads/${name}`;
  },

  async hit(key, limit, windowMs) {
    const now = Date.now();
    const b = hits.get(key);
    if (!b || b.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    b.count += 1;
    return b.count <= limit;
  },
  async clearHits(key) {
    hits.delete(key);
  },
};
