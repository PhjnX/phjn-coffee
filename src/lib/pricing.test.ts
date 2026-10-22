import { describe, expect, it } from "vitest";
import { seedMenu } from "./menu-data";
import { defaultSelection, lineKey, priceProduct, toggleOption } from "./pricing";
import type { Product } from "./types";

const groups = seedMenu.optionGroups;
const byId = (id: string) => seedMenu.products.find((p) => p.id === id) as Product;

const milkTea = byId("p-ts-truyen-thong"); // 35.000, size / sugar / ice / topping
const croissant = byId("p-croissant"); // 35.000, warm / spread
const soldOut = byId("p-hong-tra-kem-muoi");

describe("defaultSelection", () => {
  it("picks the default option of every required group and leaves optional groups empty", () => {
    expect(defaultSelection(milkTea, groups)).toEqual({
      size: ["size-s"],
      sugar: ["sugar-100"],
      ice: ["ice-normal"],
      topping: [],
    });
  });

  it("gives a valid price for the default selection", () => {
    const r = priceProduct(milkTea, groups, defaultSelection(milkTea, groups));
    expect(r).toMatchObject({ ok: true, unitPrice: 35000 });
  });
});

describe("priceProduct", () => {
  it("adds size and topping prices to the base price", () => {
    const sel = { ...defaultSelection(milkTea, groups), size: ["size-l"], topping: ["top-black-pearl", "top-pudding"] };
    // 35.000 + 10.000 (Lớn) + 6.000 + 8.000
    expect(priceProduct(milkTea, groups, sel)).toMatchObject({ ok: true, unitPrice: 59000 });
  });

  it("rejects a missing required group", () => {
    const sel = { ...defaultSelection(milkTea, groups), size: [] };
    expect(priceProduct(milkTea, groups, sel).ok).toBe(false);
  });

  it("rejects two choices in a single-choice group", () => {
    const sel = { ...defaultSelection(milkTea, groups), size: ["size-s", "size-l"] };
    expect(priceProduct(milkTea, groups, sel).ok).toBe(false);
  });

  it("rejects more toppings than maxSelect", () => {
    const sel = {
      ...defaultSelection(milkTea, groups),
      topping: ["top-black-pearl", "top-white-pearl", "top-pudding", "top-peach-jelly"],
    };
    expect(priceProduct(milkTea, groups, sel).ok).toBe(false);
  });

  it("rejects an option id from another group", () => {
    const sel = { ...defaultSelection(milkTea, groups), size: ["milk-oat"] };
    expect(priceProduct(milkTea, groups, sel).ok).toBe(false);
  });

  it("rejects a group the product does not have (a coffee option on a croissant)", () => {
    expect(priceProduct(croissant, groups, { shot: ["shot-extra"] }).ok).toBe(false);
  });

  it("counts a duplicated option id once", () => {
    const sel = { ...defaultSelection(milkTea, groups), topping: ["top-pudding", "top-pudding"] };
    expect(priceProduct(milkTea, groups, sel)).toMatchObject({ ok: true, unitPrice: 43000 });
  });

  it("rejects products that are sold out", () => {
    expect(priceProduct(soldOut, groups, defaultSelection(soldOut, groups)).ok).toBe(false);
  });

  it("prices bakery items with optional add-ons", () => {
    const sel = { warm: ["warm-yes"], spread: ["spread-butter", "spread-jam"] };
    expect(priceProduct(croissant, groups, sel)).toMatchObject({ ok: true, unitPrice: 45000 });
  });
});

describe("toggleOption", () => {
  it("replaces the choice in a required single group and never empties it", () => {
    const size = groups.size;
    let sel = toggleOption({ size: ["size-s"] }, size, "size-m");
    expect(sel.size).toEqual(["size-m"]);
    sel = toggleOption(sel, size, "size-m");
    expect(sel.size).toEqual(["size-m"]);
  });

  it("stops adding toppings at maxSelect", () => {
    const topping = groups.topping;
    let sel = { topping: [] as string[] };
    for (const id of ["top-black-pearl", "top-white-pearl", "top-pudding", "top-peach-jelly"]) {
      sel = toggleOption(sel, topping, id) as { topping: string[] };
    }
    expect(sel.topping).toEqual(["top-black-pearl", "top-white-pearl", "top-pudding"]);
  });
});

describe("lineKey", () => {
  it("ignores the order options were clicked in", () => {
    const a = lineKey("p", { topping: ["b", "a"], size: ["s"] }, "");
    const b = lineKey("p", { size: ["s"], topping: ["a", "b"] }, "");
    expect(a).toBe(b);
  });

  it("separates lines with different options or notes", () => {
    const base = lineKey("p", { size: ["s"] }, "");
    expect(lineKey("p", { size: ["l"] }, "")).not.toBe(base);
    expect(lineKey("p", { size: ["s"] }, "ít ngọt")).not.toBe(base);
  });
});
