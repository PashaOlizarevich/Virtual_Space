"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/modules/admin/components/admin-shell";
import {
  createAdminImageSignatureAction,
  deleteAdminImageAction,
  deleteAdminProductAction,
  finalizeAdminImageAction,
  loadAdminCatalog,
  saveAdminProductAction,
} from "@/modules/admin/server/actions";
import {
  ADMIN_PRODUCT_IMAGE_LIMIT,
  adminProductEditorSchema,
  adminProductImagesSchema,
  type AdminProductValues,
} from "@/modules/admin/schemas";
import type { AdminProduct } from "@/modules/admin/types";
import { formatMoney } from "@/shared/money";

type CatalogData = Awaited<ReturnType<typeof loadAdminCatalog>>;
const EMPTY_VALUES: AdminProductValues = {
  name: "",
  slug: "",
  categoryId: "",
  description: "",
  price: 0,
  stock: 0,
  published: true,
  material: "",
  style: "",
  dimensions: "",
};

type EditorImage = AdminProduct["images"][number] & { file?: File };

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать изображение."));
    reader.readAsDataURL(file);
  });
}

async function uploadProductImage(productId: string, image: EditorImage, position: number) {
  if (!image.file) return;
  const signed = await createAdminImageSignatureAction(productId);
  const body = new FormData();
  body.set("file", image.file);
  body.set("api_key", signed.apiKey);
  body.set("timestamp", String(signed.timestamp));
  body.set("signature", signed.signature);
  body.set("public_id", signed.publicId);
  body.set("allowed_formats", signed.allowed_formats);
  body.set("transformation", signed.transformation);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`,
    { method: "POST", body },
  );
  if (!response.ok) throw new Error("Cloudinary не принял изображение.");
  await finalizeAdminImageAction({
    productId,
    publicId: signed.publicId,
    alt: image.alt,
    position,
  });
}

function toProduct(
  product: CatalogData["products"][number],
  categories: CatalogData["categories"],
): AdminProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: String(product.categoryId),
    category:
      categories.find((item) => String(item.id) === String(product.categoryId))?.name ??
      String(product.categoryId),
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    published: product.isActive,
    material: product.material,
    style: product.style,
    dimensions: product.dimensions,
    newFrom: product.newFrom,
    newUntil: product.newUntil,
    images: product.images.map((image) => ({
      id: image.id,
      src: image.secureUrl,
      alt: image.alt,
      name: image.alt,
      position: image.position,
    })),
  };
}

function ProductDialog({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: AdminProduct | null;
  categories: CatalogData["categories"];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submitError, setSubmitError] = useState("");
  const [galleryError, setGalleryError] = useState("");
  const [images, setImages] = useState<EditorImage[]>(product?.images ?? []);
  const form = useForm<AdminProductValues>({
    resolver: zodResolver(adminProductEditorSchema),
    defaultValues: product ? { ...product } : EMPTY_VALUES,
  });
  const submit = form.handleSubmit(async (values) => {
    setSubmitError("");
    setGalleryError("");
    if (images.length === 0) {
      setGalleryError("Добавьте хотя бы одно изображение.");
      return;
    }
    try {
      const productInput = {
        categoryId: values.categoryId,
        slug: values.slug,
        name: values.name,
        description: values.description,
        price: values.price.toFixed(2),
        stock: values.stock,
        isActive: product ? values.published : false,
        newFrom: product?.newFrom ?? null,
        newUntil: product?.newUntil ?? null,
        material: values.material,
        style: values.style,
        dimensions: values.dimensions,
      };
      const saved = await saveAdminProductAction(product?.id ?? null, productInput);
      const retainedIds = new Set(images.filter((image) => !image.file).map((image) => image.id));
      const removedImages = (product?.images ?? []).filter((image) => !retainedIds.has(image.id));
      const firstNewPosition =
        Math.max(-1, ...(product?.images ?? []).map((image) => image.position)) + 1;
      const pendingImages = images.filter((image) => image.file);
      for (const [index, image] of pendingImages.entries()) {
        await uploadProductImage(saved.id, image, firstNewPosition + index);
      }
      await Promise.all(removedImages.map((image) => deleteAdminImageAction(image.id)));
      if (!product && values.published) {
        await saveAdminProductAction(saved.id, { ...productInput, isActive: true });
      }
      await onSaved();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Не удалось сохранить товар.");
    }
  });

  async function addImages(files: FileList | null) {
    setGalleryError("");
    if (!files?.length) return;
    const selected = Array.from(files);
    if (images.length + selected.length > ADMIN_PRODUCT_IMAGE_LIMIT) {
      setGalleryError(`В галерее может быть не более ${ADMIN_PRODUCT_IMAGE_LIMIT} изображений.`);
      return;
    }
    const parsed = adminProductImagesSchema.safeParse(selected);
    if (!parsed.success) {
      setGalleryError(parsed.error.issues[0]?.message ?? "Проверьте выбранные файлы.");
      return;
    }
    try {
      const sources = await Promise.all(selected.map(readImage));
      setImages((current) => [
        ...current,
        ...selected.map((file, index) => ({
          id: crypto.randomUUID(),
          src: sources[index] ?? "",
          alt: `Изображение товара ${form.getValues("name") || file.name}`,
          name: file.name,
          position: -1,
          file,
        })),
      ]);
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : "Не удалось добавить изображения.");
    }
  }
  const error = form.formState.errors;
  return (
    <dialog
      ref={(node) => {
        dialogRef.current = node;
        if (node && !node.open) node.showModal();
      }}
      className="admin-product-dialog"
      onClose={onClose}
      aria-labelledby="product-dialog-title"
    >
      <form className="admin-product-form" onSubmit={submit} noValidate>
        <header className="admin-product-dialog__header">
          <div>
            <p className="text-label-caps text-secondary">Каталог</p>
            <h2 id="product-dialog-title">{product ? "Редактировать товар" : "Новый товар"}</h2>
          </div>
          <Button
            type="button"
            aria-label="Закрыть форму"
            size="icon"
            variant="ghost"
            onClick={() => dialogRef.current?.close()}
          >
            <X aria-hidden="true" />
          </Button>
        </header>
        <FieldGroup>
          <Field data-invalid={Boolean(error.name)}>
            <FieldLabel htmlFor="product-name">Название</FieldLabel>
            <Input
              id="product-name"
              aria-invalid={Boolean(error.name)}
              {...form.register("name")}
            />
            {error.name ? <FieldError>{error.name.message}</FieldError> : null}
          </Field>
          <Field data-invalid={Boolean(error.slug)}>
            <FieldLabel htmlFor="product-slug">Slug</FieldLabel>
            <Input
              id="product-slug"
              aria-invalid={Boolean(error.slug)}
              {...form.register("slug")}
            />
            {error.slug ? <FieldError>{error.slug.message}</FieldError> : null}
          </Field>
          <Field data-invalid={Boolean(error.categoryId)}>
            <FieldLabel htmlFor="product-category">Категория</FieldLabel>
            <select
              className="input"
              id="product-category"
              aria-invalid={Boolean(error.categoryId)}
              {...form.register("categoryId")}
            >
              <option value="">Выберите категорию</option>
              {categories.map((category) => (
                <option key={String(category.id)} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
            {error.categoryId ? <FieldError>{error.categoryId.message}</FieldError> : null}
          </Field>
          <Field data-invalid={Boolean(error.description)}>
            <FieldLabel htmlFor="product-description">Описание</FieldLabel>
            <Textarea
              id="product-description"
              aria-invalid={Boolean(error.description)}
              {...form.register("description")}
            />
            {error.description ? <FieldError>{error.description.message}</FieldError> : null}
          </Field>
          <div className="admin-product-form__row">
            <Field data-invalid={Boolean(error.price)}>
              <FieldLabel htmlFor="product-price">Цена, BYN</FieldLabel>
              <Input
                id="product-price"
                type="number"
                min="0.01"
                step="0.01"
                aria-invalid={Boolean(error.price)}
                {...form.register("price", { valueAsNumber: true })}
              />
              {error.price ? <FieldError>{error.price.message}</FieldError> : null}
            </Field>
            <Field data-invalid={Boolean(error.stock)}>
              <FieldLabel htmlFor="product-stock">Остаток</FieldLabel>
              <Input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                aria-invalid={Boolean(error.stock)}
                {...form.register("stock", { valueAsNumber: true })}
              />
              {error.stock ? <FieldError>{error.stock.message}</FieldError> : null}
            </Field>
          </div>
          <div className="admin-product-form__row">
            <Field data-invalid={Boolean(error.material)}>
              <FieldLabel htmlFor="product-material">Материал</FieldLabel>
              <Input
                id="product-material"
                aria-invalid={Boolean(error.material)}
                {...form.register("material")}
              />
              {error.material ? <FieldError>{error.material.message}</FieldError> : null}
            </Field>
            <Field data-invalid={Boolean(error.style)}>
              <FieldLabel htmlFor="product-style">Стиль</FieldLabel>
              <Input
                id="product-style"
                aria-invalid={Boolean(error.style)}
                {...form.register("style")}
              />
              {error.style ? <FieldError>{error.style.message}</FieldError> : null}
            </Field>
          </div>
          <Field data-invalid={Boolean(error.dimensions)}>
            <FieldLabel htmlFor="product-dimensions">Размеры</FieldLabel>
            <Input
              id="product-dimensions"
              aria-invalid={Boolean(error.dimensions)}
              {...form.register("dimensions")}
            />
            {error.dimensions ? <FieldError>{error.dimensions.message}</FieldError> : null}
          </Field>
          <Field className="admin-product-form__checkbox">
            <input id="product-published" type="checkbox" {...form.register("published")} />
            <FieldLabel htmlFor="product-published">Опубликован в каталоге</FieldLabel>
          </Field>
          <Field data-invalid={Boolean(galleryError)}>
            <FieldLabel htmlFor="product-gallery">Галерея</FieldLabel>
            <label className="admin-product-upload" htmlFor="product-gallery">
              <ImagePlus aria-hidden="true" />
              <span>Добавить изображения</span>
            </label>
            <input
              className="sr-only"
              id="product-gallery"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => void addImages(event.target.files)}
            />
            {galleryError ? <FieldError>{galleryError}</FieldError> : null}
            {images.length ? (
              <ul className="admin-product-gallery" aria-label="Изображения товара">
                {images.map((image) => (
                  <li key={image.id}>
                    <Image src={image.src} alt={image.alt} width={144} height={108} unoptimized />
                    <span>{image.name}</span>
                    <Button
                      type="button"
                      aria-label={`Удалить ${image.name}`}
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setImages((current) => current.filter((item) => item.id !== image.id))
                      }
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </Field>
        </FieldGroup>
        {submitError ? (
          <p className="admin-product-form__error" role="alert">
            {submitError}
          </p>
        ) : null}
        <footer className="admin-product-form__actions">
          <Button type="button" variant="secondary" onClick={() => dialogRef.current?.close()}>
            Отмена
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Сохраняем…" : "Сохранить товар"}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}

export function AdminProductsManager({ initialData }: { initialData: CatalogData }) {
  const [products, setProducts] = useState(() =>
    initialData.products.map((product) => toProduct(product, initialData.categories)),
  );
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null | undefined>();
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  async function reload() {
    setError("");
    try {
      const data = await loadAdminCatalog();
      setProducts(data.products.map((product) => toProduct(product, data.categories)));
      setEditing(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось загрузить товары.");
    }
  }
  async function remove() {
    if (!deleting) return;
    try {
      await deleteAdminProductAction(deleting.id);
      setDeleting(null);
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось удалить товар.");
    }
  }
  const visible = products.filter((product) =>
    `${product.name} ${product.category} ${product.slug}`
      .toLocaleLowerCase("ru")
      .includes(query.trim().toLocaleLowerCase("ru")),
  );
  return (
    <AdminShell active="products">
      <main className="admin-dashboard admin-products">
        <header className="admin-dashboard__header">
          <div>
            <p className="text-label-caps text-secondary">Каталог</p>
            <h1>Товары</h1>
            <p>Управляйте товарами из PostgreSQL.</p>
          </div>
          <Button onClick={() => setEditing(null)}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Добавить товар
          </Button>
        </header>
        <div className="admin-products__toolbar">
          <label htmlFor="admin-product-search" className="sr-only">
            Поиск товаров
          </label>
          <div className="admin-products__search">
            <Search aria-hidden="true" />
            <Input
              id="admin-product-search"
              type="search"
              placeholder="Название, категория или slug"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <p>
            {visible.length} из {products.length}
          </p>
        </div>
        {error ? (
          <section className="admin-products__state" role="alert">
            <h2>Не удалось выполнить действие</h2>
            <p>{error}</p>
            <Button variant="secondary" onClick={() => void reload()}>
              Повторить
            </Button>
          </section>
        ) : null}
        {!error && !visible.length ? (
          <section className="admin-products__state">
            <h2>{products.length ? "Ничего не найдено" : "Каталог пуст"}</h2>
            <p>{products.length ? "Измените поисковый запрос." : "Создайте первый товар."}</p>
          </section>
        ) : null}
        {!error && visible.length ? (
          <div className="admin-products__table-wrap">
            <table className="admin-products__table">
              <caption className="sr-only">Список товаров</caption>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Статус</th>
                  <th>
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <Image
                          src={product.images[0]?.src ?? "/images/home/forma.png"}
                          alt=""
                          width={72}
                          height={72}
                          unoptimized
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <span>/{product.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{formatMoney(product.price)}</td>
                    <td>{product.stock ? `${product.stock} шт.` : "Нет в наличии"}</td>
                    <td>
                      <span className="admin-product-status">
                        {product.published ? "Опубликован" : "Черновик"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-product-actions">
                        <Button
                          aria-label={`Редактировать ${product.name}`}
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditing(product)}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                        <Button
                          aria-label={`Удалить ${product.name}`}
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleting(product)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>
      {editing !== undefined ? (
        <ProductDialog
          product={editing}
          categories={initialData.categories}
          onClose={() => setEditing(undefined)}
          onSaved={reload}
        />
      ) : null}
      {deleting ? (
        <dialog open className="admin-delete-dialog" aria-labelledby="delete-product-title">
          <div>
            <h2 id="delete-product-title">Удалить товар?</h2>
            <p>«{deleting.name}» будет удалён из каталога. Это действие нельзя отменить.</p>
            <div className="admin-product-form__actions">
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                Отмена
              </Button>
              <Button className="admin-button--destructive" onClick={() => void remove()}>
                Удалить товар
              </Button>
            </div>
          </div>
        </dialog>
      ) : null}
    </AdminShell>
  );
}
