import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ProductConfigurator } from "@/modules/catalog/components/product-configurator";
import { ProductGallery } from "@/modules/catalog/components/product-gallery";
import { allProducts, getProductBySlug } from "@/modules/catalog/mock-data";

export function generateStaticParams() {
  return allProducts.map((product) => ({ id: product.slug }));
}

type ProductPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug((await props.params).id);
  return product
    ? { title: `${product.name} — Virtual Space`, description: product.description }
    : {};
}

export default async function ProductPage(props: ProductPageProps) {
  const product = getProductBySlug((await props.params).id);
  if (!product) notFound();
  return (
    <main className="product-detail">
      <Container>
        <nav className="product-detail__breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/catalog">Каталог</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>
        <div className="product-detail__layout">
          <ProductGallery
            images={product.gallery}
            productId={product.id}
            productName={product.name}
          />
          <section className="product-detail__summary" aria-labelledby="product-title">
            <div className="product-detail__intro">
              <h1 id="product-title">{product.name}</h1>
              <p className="text-body-md text-secondary">{product.description}</p>
            </div>
            <ProductConfigurator product={product} />
            <div className="product-specifications">
              <h2>Характеристики</h2>
              <dl>
                {product.specifications.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
