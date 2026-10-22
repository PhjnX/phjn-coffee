/**
 * Menu types. They mirror the tables in supabase/schema.sql so the seed data can be
 * swapped for a database query later without touching the UI.
 */

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort: number;
};

export type Option = {
  id: string;
  name: string;
  /** Added to the base price, in VND. Can be 0. */
  priceDelta: number;
  isDefault?: boolean;
};

export type OptionGroup = {
  id: string;
  name: string;
  /** single = radio buttons, multi = checkboxes. */
  selectType: "single" | "multi";
  isRequired: boolean;
  /** Only used for multi groups. */
  maxSelect?: number;
  options: Option[];
};

/** How ProductArt draws the item. Drinks are cups, bakery items are pastry shapes. */
export type ProductArtSpec =
  | {
      kind: "cup";
      /** Liquid colour from top to bottom. */
      liquid: [string, string];
      /** A creamy layer on top (milk foam, salted cream). */
      cream?: string;
      /** Tapioca pearls at the bottom. */
      pearls?: string;
      /** Fruit slices or leaves floating in the drink. */
      garnish?: string;
      ice?: boolean;
    }
  | {
      kind: "pastry";
      shape: "croissant" | "cake" | "cookie" | "loaf" | "tart";
      color: string;
      accent?: string;
    };

export type Product = {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  description: string;
  /** Price of the smallest / default configuration, in VND. */
  basePrice: number;
  isAvailable: boolean;
  badge?: "bestseller" | "new" | "signature";
  /** Option group ids, in display order. */
  optionGroupIds: string[];
  /** Cut-out product photo (transparent WebP) under /public. Falls back to `art` when missing. */
  image?: string;
  /** Real photo with its background, framed 4:5, used for menus and the product sheet. */
  photo?: string;
  /** Drawn fallback, and the source of the tint behind the photo. */
  art: ProductArtSpec;
};

export type Menu = {
  categories: Category[];
  products: Product[];
  optionGroups: Record<string, OptionGroup>;
};

/** What the customer picked in the product sheet: group id -> option ids. */
export type Selection = Record<string, string[]>;
