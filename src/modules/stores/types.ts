export type StoreImage = {
  src: string;
  alt: string;
  label: "Фасад" | "Интерьер" | "Ресепшен" | "Детали";
};

export type StoreLocation = {
  city: string;
  address: string;
  hours: string;
  description: string;
  images: readonly StoreImage[];
};
