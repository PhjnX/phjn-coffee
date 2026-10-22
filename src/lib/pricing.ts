import type { Option, OptionGroup, Product, Selection } from "./types";

/** Selection pre-filled with each group's default option (or the first one for required single groups). */
export function defaultSelection(product: Product, groups: Record<string, OptionGroup>): Selection {
  const selection: Selection = {};
  for (const id of product.optionGroupIds) {
    const group = groups[id];
    if (!group) continue;
    const defaults = group.options.filter((o) => o.isDefault).map((o) => o.id);
    if (defaults.length > 0) {
      selection[id] = group.selectType === "single" ? defaults.slice(0, 1) : defaults;
    } else if (group.selectType === "single" && group.isRequired && group.options[0]) {
      selection[id] = [group.options[0].id];
    } else {
      selection[id] = [];
    }
  }
  return selection;
}

/** Toggles one option, respecting single/multi rules and maxSelect. */
export function toggleOption(selection: Selection, group: OptionGroup, optionId: string): Selection {
  const current = selection[group.id] ?? [];
  let next: string[];

  if (group.selectType === "single") {
    // A required radio group cannot be emptied; an optional one can be unticked.
    next = current.includes(optionId) && !group.isRequired ? [] : [optionId];
  } else if (current.includes(optionId)) {
    next = current.filter((id) => id !== optionId);
  } else {
    const max = group.maxSelect ?? group.options.length;
    if (current.length >= max) return selection;
    next = [...current, optionId];
  }

  return { ...selection, [group.id]: next };
}

export type PriceResult =
  | { ok: true; unitPrice: number; picked: { group: OptionGroup; option: Option }[] }
  | { ok: false; errors: string[] };

/**
 * Validates a selection against the product's option groups and returns the unit price.
 * The server runs the same function when an order is placed, so a tampered cart cannot
 * change what the customer pays.
 */
export function priceProduct(
  product: Product,
  groups: Record<string, OptionGroup>,
  selection: Selection,
): PriceResult {
  const errors: string[] = [];
  const picked: { group: OptionGroup; option: Option }[] = [];

  for (const groupId of Object.keys(selection)) {
    if (!product.optionGroupIds.includes(groupId)) {
      errors.push(`Tuỳ chọn "${groupId}" không áp dụng cho món này.`);
    }
  }

  for (const groupId of product.optionGroupIds) {
    const group = groups[groupId];
    if (!group) {
      errors.push(`Thiếu nhóm tuỳ chọn "${groupId}".`);
      continue;
    }
    const ids = [...new Set(selection[groupId] ?? [])];

    if (group.isRequired && ids.length === 0) errors.push(`Vui lòng chọn ${group.name.toLowerCase()}.`);
    if (group.selectType === "single" && ids.length > 1) errors.push(`${group.name}: chỉ được chọn 1.`);
    if (group.selectType === "multi" && group.maxSelect !== undefined && ids.length > group.maxSelect) {
      errors.push(`${group.name}: tối đa ${group.maxSelect} lựa chọn.`);
    }

    for (const id of ids) {
      const option = group.options.find((o) => o.id === id);
      if (!option) errors.push(`${group.name}: lựa chọn không hợp lệ.`);
      else picked.push({ group, option });
    }
  }

  if (!product.isAvailable) errors.push(`${product.name} đang tạm hết.`);
  if (errors.length > 0) return { ok: false, errors };

  const unitPrice = picked.reduce((sum, p) => sum + p.option.priceDelta, product.basePrice);
  return { ok: true, unitPrice, picked };
}

/**
 * Two cart lines are the same item only if product, options and note all match.
 * Option ids are sorted so the order the customer clicked them in does not matter.
 */
export function lineKey(productId: string, selection: Selection, note: string): string {
  const parts = Object.keys(selection)
    .sort()
    .map((g) => `${g}:${[...(selection[g] ?? [])].sort().join(",")}`)
    .filter((p) => !p.endsWith(":"));
  return [productId, ...parts, note.trim().toLowerCase()].join("|");
}
