"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import type { Category, OptionGroup, Product } from "@/lib/types";
import { ProductPhoto } from "../ProductImage";

/** Add / edit a menu item: name, category, price, description, badge, option groups and a photo. */
export function ProductForm({
  product,
  categories,
  groups,
}: {
  product?: Product;
  categories: Category[];
  groups: OptionGroup[];
}) {
  const [state, action, pending] = useActionState(saveProduct, undefined);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={action} className="space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Ảnh món">
        <div className="flex items-center gap-4">
          <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-2xl bg-paper-2">
            {preview ? (
              <img src={preview} alt="" className="size-full object-cover" />
            ) : product ? (
              <ProductPhoto item={product} className="absolute inset-0" sizes="112px" />
            ) : (
              <span className="grid size-full place-items-center text-xs text-ink-soft">Chưa có ảnh</span>
            )}
          </div>
          <label className="cursor-pointer rounded-full border border-line px-4 py-2.5 text-sm hover:border-ink/40">
            {product ? "Đổi ảnh" : "Chọn ảnh"}
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={async (e) => {
                const input = e.currentTarget;
                const f = input.files?.[0];
                if (!f) return setPreview(null);
                setPreview(URL.createObjectURL(f));
                // Phone photos are often 5–10MB; shrink to ~1600px JPEG so the upload stays small.
                const small = await shrink(f).catch(() => null);
                if (small && small.size < f.size) {
                  const dt = new DataTransfer();
                  dt.items.add(small);
                  input.files = dt.files;
                }
              }}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-ink-soft">Ảnh được cắt về khung 4:5 giống các món khác. Nên dùng ảnh dọc, món nằm giữa.</p>
      </Section>

      <Section title="Thông tin">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên món" className="sm:col-span-2">
            <input name="name" defaultValue={product?.name} required className={input} placeholder="Ví dụ: Trà sữa ô long" />
          </Field>
          <Field label="Danh mục">
            <select name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id} className={input}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Giá (size nhỏ / mặc định)">
            <input name="basePrice" inputMode="numeric" defaultValue={product?.basePrice} required className={input} placeholder="35000" />
          </Field>
          <Field label="Mô tả ngắn" className="sm:col-span-2">
            <textarea name="description" defaultValue={product?.description} rows={2} className={`${input} resize-none`} placeholder="Một câu về hương vị" />
          </Field>
          <Field label="Nhãn">
            <select name="badge" defaultValue={product?.badge ?? ""} className={input}>
              <option value="">Không</option>
              <option value="bestseller">Bán chạy</option>
              <option value="new">Mới</option>
              <option value="signature">Đặc biệt</option>
            </select>
          </Field>
          <label className="flex items-center gap-3 self-end rounded-xl border border-line bg-paper px-4 py-3">
            <input type="checkbox" name="isAvailable" defaultChecked={product?.isAvailable ?? true} className="size-4 accent-[#3b2e25]" />
            <span className="text-[15px]">Đang bán</span>
          </label>
        </div>
      </Section>

      <Section title="Tuỳ chọn khách được chọn">
        <div className="grid gap-2 sm:grid-cols-2">
          {groups.map((g) => (
            <label key={g.id} className="flex items-start gap-3 rounded-xl border border-line bg-paper px-4 py-3">
              <input
                type="checkbox"
                name="optionGroupIds"
                value={g.id}
                defaultChecked={product?.optionGroupIds.includes(g.id)}
                className="mt-1 size-4 accent-[#3b2e25]"
              />
              <span>
                <span className="block text-[15px]">{g.name}</span>
                <span className="block text-xs text-ink-soft">{g.options.map((o) => o.name).join(", ")}</span>
              </span>
            </label>
          ))}
        </div>
      </Section>

      {state?.error && <p className="rounded-2xl bg-[#b4442b]/10 px-4 py-3 text-sm text-[#9a3a24]">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-caramel-dark disabled:opacity-60">
          {pending ? "Đang lưu…" : product ? "Lưu thay đổi" : "Thêm món"}
        </button>
        <Link href="/admin/thuc-don" className="rounded-full px-4 py-3 text-sm text-ink-soft hover:text-ink">
          Huỷ
        </Link>
        {product && (
          <button
            type="button"
            onClick={() => confirm(`Xoá "${product.name}" khỏi thực đơn?`) && deleteProduct(product.id)}
            className="ml-auto rounded-full px-4 py-3 text-sm text-[#9a3a24] hover:bg-[#b4442b]/10"
          >
            Xoá món
          </button>
        )}
      </div>
    </form>
  );
}

/** Resizes an image in the browser so its longest side is at most `max` px, as a JPEG. */
async function shrink(file: File, max = 1600): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  if (!blob) throw new Error("resize failed");
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

const input = "w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-caramel md:text-[15px]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-line bg-card p-5 shadow-[0_18px_40px_-34px_rgb(59_46_37/0.6)] md:p-6">
      <h2 className="mb-4 font-display text-xl">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
