export type CartItemOption = Readonly<{
  groupId: string;
  optionId: string;
}>;

export type CartItem = Readonly<{
  productId: string;
  quantity: number;
  selectedOptions: readonly CartItemOption[];
  observedPrice: number;
  productSnapshot?: Readonly<{
    slug: string;
    name: string;
    description: string;
    image: string;
    imageAlt: string;
    optionGroups: readonly Readonly<{
      id: string;
      label: string;
      options: readonly Readonly<{ id: string; label: string }>[];
    }>[];
  }>;
}>;

export type AddCartItemInput = Omit<CartItem, "quantity"> & Readonly<{ quantity?: number }>;
