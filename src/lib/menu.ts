import { store } from "./server/store";
import type { Menu, Product } from "./types";

/** Single entry point for menu data, read from the shop's store so admin edits show up on the site. */
export async function getMenu(): Promise<Menu> {
  return store.getMenu();
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const menu = await getMenu();
  return menu.products.filter((p) => p.badge && p.isAvailable).slice(0, limit);
}
