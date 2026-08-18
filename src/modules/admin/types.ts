export type AdminMetric = {
  id: "orders" | "products" | "revenue";
  label: string;
  value: string;
  description: string;
};

export type AdminActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
};

export type AdminDashboardData = {
  metrics: AdminMetric[];
  activity: AdminActivityItem[];
};

export type AdminProductImage = {
  id: string;
  src: string;
  alt: string;
  name: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  published: boolean;
  images: AdminProductImage[];
};

export type AdminOrderStatus = "new" | "confirmed" | "in-progress" | "completed" | "cancelled";

export const adminOrderStatusTransitions: Readonly<
  Record<AdminOrderStatus, readonly AdminOrderStatus[]>
> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["in-progress", "cancelled"],
  "in-progress": ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransitionAdminOrderStatus(
  currentStatus: AdminOrderStatus,
  nextStatus: AdminOrderStatus,
): boolean {
  return adminOrderStatusTransitions[currentStatus].includes(nextStatus);
}

export type AdminOrderItem = {
  id: string;
  name: string;
  configuration: string;
  quantity: number;
  unitPrice: number;
};

export type AdminOrderCustomer = {
  name: string;
  email: string;
  phone: string;
  comment?: string;
};

export type AdminOrder = {
  id: string;
  createdAt: string;
  status: AdminOrderStatus;
  customer: AdminOrderCustomer;
  items: AdminOrderItem[];
  total: number;
};
