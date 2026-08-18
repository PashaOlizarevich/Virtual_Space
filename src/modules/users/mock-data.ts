import type { ProfileDetails, ProfileOrder } from "@/modules/users/types";

export const previewProfile: ProfileDetails = {
  name: "Анна Ковалёва",
  email: "anna@example.com",
  phone: "+375 29 123-45-67",
};

export const previewOrders: readonly ProfileOrder[] = [
  { id: "VS-24018", createdAt: "2026-08-12", status: "in-progress", itemCount: 2, total: 3360 },
  { id: "VS-23891", createdAt: "2026-07-28", status: "completed", itemCount: 1, total: 1240 },
];
