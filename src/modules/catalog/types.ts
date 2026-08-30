import type { FormattableMoney } from "@/shared/money";

export type ProductCurrency = "BYN";

export type ProductImage = Readonly<{ src: string; alt: string }>;
export type ProductOption = Readonly<{ id: string; label: string }>;
export type ProductOptionGroup = Readonly<{
  id: string;
  label: string;
  options: readonly ProductOption[];
}>;
export type ProductSpecification = Readonly<{ label: string; value: string }>;

export type ProductPreview = Readonly<{
  id: string;
  slug: string;
  name: string;
  description: string;
  price: FormattableMoney;
  currency?: ProductCurrency;
  image: string;
  imageAlt: string;
  newFrom?: string | null;
  newUntil?: string | null;
}>;

export type Product = ProductPreview &
  Readonly<{
    gallery: readonly ProductImage[];
    specifications: readonly ProductSpecification[];
    optionGroups: readonly ProductOptionGroup[];
  }>;
