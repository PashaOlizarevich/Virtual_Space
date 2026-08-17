export type CartItemOption = Readonly<{
  groupId: string;
  optionId: string;
}>;

export type CartItem = Readonly<{
  productId: string;
  quantity: number;
  selectedOptions: readonly CartItemOption[];
  observedPrice: number;
}>;

export type AddCartItemInput = Omit<CartItem, "quantity"> & Readonly<{ quantity?: number }>;
