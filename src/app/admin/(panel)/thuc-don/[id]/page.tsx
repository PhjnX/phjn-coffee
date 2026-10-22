import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/AdminUI";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { store } from "@/lib/server/store";

export const metadata: Metadata = { title: "Sửa món" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menu = await store.getMenu();
  const product = menu.products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/thuc-don" className="text-sm text-ink-soft hover:text-ink">
        ← Thực đơn
      </Link>
      <div className="mt-4 mb-8">
        <PageHeader kicker="Sửa món" title={product.name} />
      </div>
      <ProductForm product={product} categories={[...menu.categories].sort((a, b) => a.sort - b.sort)} groups={Object.values(menu.optionGroups)} />
    </div>
  );
}
