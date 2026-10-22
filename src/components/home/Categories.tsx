import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import { ProductPhoto } from "../ProductImage";
import { Reveal } from "./Reveal";

/**
 * "Khám phá thực đơn": one photo tile per category with a small arrow in the corner and the name
 * on a cream strip, plus a dark "see everything" tile. Two across on phones, three on wide screens.
 */
export function Categories({ categories, products }: { categories: Category[]; products: Product[] }) {
  const tiles = categories
    .map((c) => ({ category: c, cover: products.find((p) => p.categoryId === c.id && p.isAvailable && p.photo) }))
    .filter((t) => t.cover);

  return (
    <section className="bg-paper py-14 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[1fr_2fr] md:gap-14 md:px-10">
        <Reveal from="left" className="md:pt-6">
          <h2 className="font-display text-[32px] leading-tight md:text-5xl">
            Khám phá <em className="font-medium text-caramel-dark">thực đơn</em>
          </h2>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-soft">
            Từ ly phin buổi sáng đến trà trái cây buổi chiều, cùng bánh nướng trong ngày. Chỉnh size, đường, đá theo ý bạn.
          </p>
        </Reveal>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {tiles.map(({ category, cover }, i) => (
            <li key={category.id}>
              <Reveal delay={(i % 3) * 0.06}>
                <Link href={`/menu#cat-${category.id}`} className="group block overflow-hidden rounded-2xl bg-card">
                  <div className="relative">
                    <ProductPhoto
                      item={cover!}
                      className="aspect-[4/3] [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105"
                      sizes="(min-width: 768px) 240px, 46vw"
                    />
                    <span aria-hidden className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-espresso/80 text-xs text-cream">
                      ↗
                    </span>
                  </div>
                  <p className="px-3 py-2.5 text-center text-[13px] font-semibold">{category.name}</p>
                </Link>
              </Reveal>
            </li>
          ))}
          <li>
            <Reveal delay={0.12} className="h-full">
              <Link href="/menu" className="flex h-full min-h-32 flex-col justify-between rounded-2xl bg-espresso p-4 text-cream transition-colors hover:bg-ink">
                <span className="font-display text-xl leading-tight">
                  Xem tất cả <em className="font-medium text-caramel">món</em>
                </span>
                <span aria-hidden className="grid size-9 place-items-center self-end rounded-full bg-caramel text-espresso">
                  →
                </span>
              </Link>
            </Reveal>
          </li>
        </ul>
      </div>
    </section>
  );
}
