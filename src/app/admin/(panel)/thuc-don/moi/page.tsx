import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/AdminUI";
import { ProductForm } from "@/components/admin/ProductForm";
import { store } from "@/lib/server/store";

export const metadata: Metadata = { title: "Thêm món" };

export default async function NewProductPage() {
  const menu = await store.getMenu();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/thuc-don" className="text-sm text-ink-soft hover:text-ink">
        ← Thực đơn
      </Link>
      <div className="mt-4 mb-8">
        <PageHeader kicker="Thực đơn" title="Thêm món" />
      </div>
      <ProductForm categories={[...menu.categories].sort((a, b) => a.sort - b.sort)} groups={Object.values(menu.optionGroups)} />
    </div>
  );
}
