import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { products } from "@/modules/catalog/mock-data";

export const metadata: Metadata = { title: "Каталог — Virtual Space" };

export default function CatalogPage() {
  return (
    <main className="catalog-page">
      <Container>
        <header className="catalog-page__header">
          <p className="text-label-caps text-secondary">Каталог</p>
          <h1>Мебель для спокойного дома</h1>
          <p className="text-body-md text-secondary">
            Предметы с ясной формой, натуральными материалами и вниманием к ежедневному комфорту.
          </p>
        </header>
        <div className="catalog-page__grid">
          {products.map((product) => (
            <ProductPreview key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </main>
  );
}
