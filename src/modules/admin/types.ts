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
