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
