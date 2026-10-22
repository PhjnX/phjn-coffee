import Image from "next/image";
import type { ProductArtSpec } from "@/lib/types";
import { ProductArt } from "./ProductArt";

type Source = { name: string; image?: string; photo?: string; art: ProductArtSpec };

/**
 * Real product photo filling a frame the caller shapes with `className` (size, rounding, arch).
 * Falls back to the cut-out on a cream ground when an item has no photo.
 */
export function ProductPhoto({
  item,
  className = "",
  sizes = "(min-width: 768px) 320px, 60vw",
  priority = false,
}: {
  item: Source;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const positioned = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";
  return (
    <div className={`${positioned} overflow-hidden bg-paper-2 ${className}`}>
      {item.photo ? (
        <Image
          src={item.photo}
          alt={item.name}
          fill
          sizes={sizes}
          priority={priority}
          // Admin uploads are already resized to 800×1000 WebP and served by a route handler.
          unoptimized={item.photo.startsWith("/uploads/")}
          className="object-cover"
        />
      ) : (
        <ProductImage item={item} className="absolute inset-[10%]" sizes={sizes} />
      )}
    </div>
  );
}

/** Main colour of an item, taken from its drawn art. Used for the soft disc behind the photo. */
export function productTint(art: ProductArtSpec): string {
  return art.kind === "cup" ? art.liquid[0] : art.color;
}

/** Blend two #rrggbb colours; `amount` is the share of `color`. Plain hex so Motion can animate it. */
export function mixHex(color: string, base: string, amount: number): string {
  const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = parse(color);
  const b = parse(base);
  return `#${a.map((v, i) => Math.round(v * amount + b[i] * (1 - amount)).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Cut-out product photo, bottom-centred inside a box the caller sizes with `className`.
 * Falls back to the SVG illustration for items that have no photo yet.
 */
export function ProductImage({
  item,
  className = "",
  sizes = "(min-width: 768px) 280px, 45vw",
  priority = false,
}: {
  item: Source;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!item.image) {
    return (
      <div className={`flex items-end justify-center ${className}`}>
        <ProductArt art={item.art} className="h-full w-auto" />
      </div>
    );
  }
  // `fill` needs a positioned parent; keep the caller's absolute/fixed if it set one.
  const positioned = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";
  return (
    <div className={`${positioned} ${className}`}>
      <Image
        src={item.image}
        alt={item.name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain object-bottom drop-shadow-[0_24px_24px_rgb(36_22_13/0.22)]"
      />
    </div>
  );
}
