import type { Product } from "@/modules/catalog/types";

function toTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function isActiveNewArrival(product: Product, now = new Date()): boolean {
  const newFrom = toTimestamp(product.newFrom);
  const newUntil = toTimestamp(product.newUntil);
  const currentTimestamp = now.getTime();

  if (newFrom === null || newUntil === null || Number.isNaN(currentTimestamp)) return false;

  return newFrom <= currentTimestamp && currentTimestamp <= newUntil;
}

export function getActiveNewArrivals(
  products: readonly Product[],
  now = new Date(),
): readonly Product[] {
  return products
    .filter((product) => isActiveNewArrival(product, now))
    .toSorted(
      (first, second) => Date.parse(second.newFrom ?? "") - Date.parse(first.newFrom ?? ""),
    );
}
