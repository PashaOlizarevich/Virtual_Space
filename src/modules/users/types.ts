export type ProfileDetails = Readonly<{
  name: string;
  email: string;
  phone: string;
}>;

export type OrderStatus = "new" | "confirmed" | "in-progress" | "completed" | "cancelled";

export type ProfileOrder = Readonly<{
  id: string;
  createdAt: string;
  status: OrderStatus;
  itemCount: number;
  total: number;
}>;
