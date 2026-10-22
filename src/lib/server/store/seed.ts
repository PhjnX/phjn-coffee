import { seedMenu } from "../../menu-data";
import type { Menu } from "../../types";
import type { Table } from "./types";

/** Starting data used the first time a store is empty. */
export function seedData(): { menu: Menu; tables: Table[] } {
  return {
    menu: structuredClone(seedMenu),
    tables: Array.from({ length: 12 }, (_, i) => ({ number: String(i + 1), area: i < 8 ? "Tầng 1" : "Sân trước" })),
  };
}
