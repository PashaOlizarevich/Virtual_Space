import type { Product } from "../src/modules/catalog/types";
import { allProducts } from "../src/modules/catalog/mock-data";
import { storeProfile } from "../src/modules/settings/mock-data";
import { MONEY_CURRENCY, moneyToNumber } from "../src/shared/money";

export const categoryNames = {
  armchairs: "Кресла",
  beds: "Кровати",
  chairs: "Стулья",
  "dining-tables": "Столы обеденные",
  "living-room-tables": "Столы для гостиной",
  mattresses: "Матрасы",
  poufs: "Пуфики",
  sofas: "Диваны",
  tableware: "Посуда",
  "textiles-decor": "Текстиль и декор",
} as const;

export type SeedCategorySlug = keyof typeof categoryNames;

function categorySlugFrom(product: Product): SeedCategorySlug {
  const categorySlug = product.image.split("/")[2];

  if (!categorySlug || !(categorySlug in categoryNames)) {
    throw new Error(`Unknown seed category for product: ${product.slug}`);
  }

  return categorySlug as SeedCategorySlug;
}

function specificationValue(product: Product, label: string): string | undefined {
  return product.specifications.find((item) => item.label === label)?.value;
}

function imagePublicId(src: string): string {
  return `virtual-space${src.replace(/^\/images/, "").replace(/\.[^/.]+$/, "")}`;
}

export const catalogSeed = allProducts.map((product: Product) => ({
  slug: product.slug,
  categorySlug: categorySlugFrom(product),
  name: product.name,
  description: product.description,
  price: moneyToNumber(product.price).toFixed(2),
  currency: product.currency ?? MONEY_CURRENCY,
  stock: 10,
  isActive: true,
  newFrom: product.newFrom ? new Date(product.newFrom) : null,
  newUntil: product.newUntil ? new Date(product.newUntil) : null,
  material:
    specificationValue(product, "Материал") ??
    specificationValue(product, "Обивка") ??
    specificationValue(product, "Каркас") ??
    "Не указан",
  style: "Современный",
  dimensions: specificationValue(product, "Размер") ?? "Не указаны",
  images: product.gallery.map((image, position) => ({
    cloudinaryPublicId: imagePublicId(image.src),
    secureUrl: image.src,
    alt: image.alt,
    position,
  })),
  specifications: product.specifications.map((specification, position) => ({
    ...specification,
    position,
  })),
  optionGroups: product.optionGroups.map((group, position) => ({
    key: group.id,
    label: group.label,
    position,
    options: group.options.map((option, optionPosition) => ({
      key: option.id,
      label: option.label,
      position: optionPosition,
    })),
  })),
}));

export const storeSettingsSeed = {
  key: "primary",
  name: storeProfile.name,
  description: storeProfile.description,
  contacts: storeProfile.contacts.map((contact) => ({ ...contact })),
  socials: storeProfile.socials.map((social) => ({ ...social })),
};
