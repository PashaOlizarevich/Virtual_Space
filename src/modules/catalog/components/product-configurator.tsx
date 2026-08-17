"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Product } from "@/modules/catalog/types";

const priceFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

export function ProductConfigurator({ product }: Readonly<{ product: Product }>) {
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
      <Button
        className="product-configurator__submit"
        onClick={() =>
          setConfirmation(`«${product.name}» добавлен в корзину: ${selectedLabels.join(", ")}.`)
        }
      >
        <ShoppingBag data-icon="inline-start" aria-hidden="true" />
        Добавить в корзину
      </Button>
      <p className="product-configurator__status" role="status" aria-live="polite">
        {confirmation}
      </p>
    </div>
  );
}
