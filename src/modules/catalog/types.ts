export type ProductPreview = Readonly<{
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: "BYN";
  image: string;
  imageAlt: string;
}>;
