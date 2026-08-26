"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/modules/cart/store";
import type { Product } from "@/modules/catalog/types";
import { FavoriteButton } from "@/modules/favorites/components/favorite-button";

const priceFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

export function ProductConfigurator({ product }: Readonly<{ product: Product }>) {
  const addItem = useCartStore((state) => state.addItem);
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.optionGroups.map((group) => [group.id, group.options[0]?.id ?? ""])),
  );
  const [confirmation, setConfirmation] = useState("");
  const selectedLabels = product.optionGroups.map(
    (group) => group.options.find((item) => item.id === selection[group.id])?.label ?? "",
  );

  return (
    <div className="product-configurator">
      <p className="product-detail__price">{priceFormatter.format(product.price)}</p>
      <div className="product-configurator__options">
        {product.optionGroups.map((group) => (
          <fieldset className="product-option" key={group.id}>
            <legend>{group.label}</legend>
            <div className="product-option__choices">
              {group.options.map((option) => (
                <label className="product-option__choice" key={option.id}>
                  <input
                    checked={selection[group.id] === option.id}
                    name={group.id}
                    onChange={() => {
                      setSelection((current) => ({ ...current, [group.id]: option.id }));
                      setConfirmation("");
                    }}
                    type="radio"
                    value={option.id}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="product-configurator__actions">
        <Button
          className="product-configurator__submit"
          onClick={() => {
            const added = addItem({
              productId: product.id,
              selectedOptions: product.optionGroups.map((group) => ({
                groupId: group.id,
                optionId: selection[group.id] ?? "",
              })),
              observedPrice: product.price,
            });
            setConfirmation(
              added
                ? `«${product.name}» добавлен в корзину: ${selectedLabels.join(", ")}.`
                : "Не удалось добавить товар. Обновите страницу и попробуйте ещё раз.",
            );
          }}
        >
          <ShoppingBag data-icon="inline-start" aria-hidden="true" />
          Добавить в корзину
        </Button>
        <FavoriteButton appearance="detail" productId={product.id} productName={product.name} />
      </div>
      <p className="product-configurator__status" role="status" aria-live="polite">
        {confirmation}
      </p>
    </div>
  );
}
