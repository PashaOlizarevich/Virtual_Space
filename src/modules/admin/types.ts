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
  position: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string;
  description: string;
  price: number;
  stock: number;
  published: boolean;
  material: string;
  style: string;
  dimensions: string;
  newFrom: string | null;
  newUntil: string | null;
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

export type AdminStoreSettings = {
  name: string;
  description: string;
  phone: string;
  email: string;
  workingHours: string;
  address: string;
  instagram: string;
  pinterest: string;
  telegram: string;
};
