"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/modules/favorites/store";
import { useFavoritesHydrated } from "@/modules/favorites/use-favorites-hydrated";

type FavoriteButtonProps = Readonly<{
  productId: string;
  productName: string;
  appearance?: "card" | "detail";
}>;

export function FavoriteButton({
  productId,
  productName,
  appearance = "card",
}: FavoriteButtonProps) {
  const hydrated = useFavoritesHydrated();
  const isFavorite = useFavoritesStore((state) => state.productIds.includes(productId));
  const toggle = useFavoritesStore((state) => state.toggle);
  const selected = hydrated && isFavorite;
  const label = selected
    ? `Удалить «${productName}» из избранного`
    : `Добавить «${productName}» в избранное`;

  return (
    <Button
      className={appearance === "card" ? "product-preview__favorite" : "product-detail__favorite"}
      variant={appearance === "card" ? "ghost" : "secondary"}
      size={appearance === "card" ? "icon" : "default"}
      aria-label={label}
      aria-pressed={selected}
      disabled={!hydrated}
      onClick={() => toggle(productId)}
    >
      <Heart aria-hidden="true" fill={selected ? "currentColor" : "none"} />
      {appearance === "detail" && (selected ? "В избранном" : "В избранное")}
    </Button>
  );
}
