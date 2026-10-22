"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { normalize } from "@/lib/format";
import { normalizeTable, type OrderStatus, type StoredOrder } from "@/lib/order";
import { requireAdmin, signIn, signOut } from "@/lib/server/auth";
import { allow, clientIp, reset } from "@/lib/server/rate-limit";
import { store, vnDayBounds } from "@/lib/server/store";
import type { Product } from "@/lib/types";

/** Pages that show menu data; refreshed after every menu change. */
function refreshShop() {
  revalidatePath("/", "layout");
}

// ── Sign in ────────────────────────────────────────────────────────────────

export async function login(_: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  const key = `login:${await clientIp()}`;
  if (!(await allow(key, 5, 10 * 60_000))) return { error: "Sai mật khẩu quá nhiều lần. Vui lòng thử lại sau 10 phút." };
  const ok = await signIn(String(form.get("password") ?? ""));
  if (!ok) return { error: "Mật khẩu không đúng." };
  await reset(key);
  redirect("/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin/login");
}

// ── Orders ─────────────────────────────────────────────────────────────────

/** Orders placed on a day (Vietnam time), newest first. */
export async function listOrders(day: string): Promise<StoredOrder[]> {
  await requireAdmin();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return [];
  return store.ordersBetween(...vnDayBounds(day));
}

const STATUSES: OrderStatus[] = ["new", "preparing", "ready", "completed", "cancelled"];

export async function setOrderStatus(code: string, status: OrderStatus) {
  await requireAdmin();
  if (!STATUSES.includes(status)) return;
  // A completed order has been paid, one way or another.
  await store.updateOrder(code, status === "completed" ? { status, paid: true } : { status });
  revalidatePath("/admin", "layout");
}

export async function setOrderPaid(code: string, paid: boolean) {
  await requireAdmin();
  await store.updateOrder(code, { paid: paid === true });
  revalidatePath("/admin", "layout");
}

// ── Menu ───────────────────────────────────────────────────────────────────

export type ProductFormState = { error?: string; saved?: boolean };

function slugify(name: string): string {
  return normalize(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Saves an uploaded photo the way the shop's own photos are framed: 4:5, 800×1000 WebP. */
async function savePhoto(file: File, slug: string): Promise<string> {
  const input = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(input).rotate().resize(800, 1000, { fit: "cover", position: "attention" }).webp({ quality: 80 }).toBuffer();
  return store.savePhoto(`${slug}-${Date.now().toString(36)}.webp`, webp, "image/webp");
}

export async function saveProduct(_: ProductFormState | undefined, form: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const categoryId = String(form.get("categoryId") ?? "");
  const basePrice = Number(String(form.get("basePrice") ?? "").replace(/\D/g, ""));
  const description = String(form.get("description") ?? "").trim();
  const badgeRaw = String(form.get("badge") ?? "");
  const badge = (["bestseller", "new", "signature"] as const).find((b) => b === badgeRaw);
  const optionGroupIds = form.getAll("optionGroupIds").map(String);
  const isAvailable = form.get("isAvailable") === "on";
  const photo = form.get("photo");

  if (name.length < 2) return { error: "Vui lòng nhập tên món." };
  if (!Number.isFinite(basePrice) || basePrice < 1000 || basePrice > 2_000_000) return { error: "Giá phải từ 1.000đ đến 2.000.000đ." };
  if (photo instanceof File && photo.size > 4 * 1024 * 1024) return { error: "Ảnh quá lớn (tối đa 4MB), hãy chọn ảnh khác." };

  const menu = await store.getMenu();
  if (!menu.categories.some((c) => c.id === categoryId)) return { error: "Vui lòng chọn danh mục." };
  const groups = optionGroupIds.filter((g) => g in menu.optionGroups);

  const existing = menu.products.find((p) => p.id === id);
  let slug = slugify(name) || "mon";
  if (existing && existing.name === name) {
    slug = existing.slug;
  } else {
    const base = slug;
    for (let n = 2; menu.products.some((p) => p.slug === slug && p.id !== id); n++) slug = `${base}-${n}`;
  }

  let photoUrl: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    try {
      photoUrl = await savePhoto(photo, slug);
    } catch (err) {
      console.error(err);
      return { error: "Không lưu được ảnh, hãy thử ảnh JPG hoặc PNG khác." };
    }
  }

  const product: Product = {
    ...(existing ?? {
      id: `p-${slug}`,
      art:
        categoryId === "banh"
          ? { kind: "pastry", shape: "croissant", color: "#d9973f", accent: "#a8641f" }
          : { kind: "cup", liquid: ["#a8754b", "#5b3a22"], ice: true },
    }),
    name,
    slug,
    categoryId,
    basePrice,
    description,
    optionGroupIds: groups,
    isAvailable,
    ...(photoUrl ? { photo: photoUrl } : {}),
  } as Product;
  if (badge) product.badge = badge;
  else delete product.badge;

  await store.saveProduct(product);
  refreshShop();
  redirect("/admin/thuc-don");
}

export async function setAvailable(id: string, isAvailable: boolean) {
  await requireAdmin();
  await store.setAvailable(id, isAvailable === true);
  refreshShop();
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await store.deleteProduct(id);
  refreshShop();
  redirect("/admin/thuc-don");
}

// ── Tables ─────────────────────────────────────────────────────────────────

export async function addTable(_: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const number = normalizeTable(String(form.get("number") ?? ""));
  const area = String(form.get("area") ?? "").trim().slice(0, 40) || "Trong quán";
  if (!number) return { error: "Số bàn là số từ 1 đến 999." };
  if (!(await store.addTable({ number, area }))) return { error: `Bàn ${number} đã có.` };
  revalidatePath("/admin/ban");
  return {};
}

export async function deleteTable(number: string) {
  await requireAdmin();
  await store.deleteTable(number);
  revalidatePath("/admin/ban");
}

// ── Demo data ──────────────────────────────────────────────────────────────

/** Fills the last 30 days with sample orders (marked demo) so the charts have data. */
export async function addDemoData() {
  await requireAdmin();
  const { demoOrders } = await import("@/lib/server/demo");
  const [menu, tables] = await Promise.all([store.getMenu(), store.getTables()]);
  await store.replaceDemoOrders(demoOrders(menu, tables.map((t) => t.number)));
  revalidatePath("/admin", "layout");
}

/** Removes every sample order and keeps the real ones. */
export async function clearDemoData() {
  await requireAdmin();
  await store.replaceDemoOrders(null);
  revalidatePath("/admin", "layout");
}
