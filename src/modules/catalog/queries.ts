import { queryOptions } from "@tanstack/react-query";

import { products } from "@/modules/catalog/mock-data";
import type { Product } from "@/modules/catalog/types";

export const catalogQueryKey = ["catalog", "products"] as const;

export async function fetchCatalogProducts(): Promise<readonly Product[]> {
  // This mock transport keeps the query contract asynchronous until /api/products
  // replaces it in the backend phase.
  await new Promise((resolve) => setTimeout(resolve, 250));
  return products;
}

export function catalogQueryOptions() {
  return queryOptions({
    queryKey: catalogQueryKey,
    queryFn: fetchCatalogProducts,
  });
}
