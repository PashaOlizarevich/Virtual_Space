"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/modules/admin/components/admin-shell";
import {
  deleteAdminProductPreview,
  getAdminProductsPreview,
  saveAdminProductPreview,
} from "@/modules/admin/mock-transport";
import {
  ADMIN_PRODUCT_IMAGE_LIMIT,
  adminProductImagesSchema,
  adminProductSchema,
  type AdminProductValues,
} from "@/modules/admin/schemas";
import type { AdminProduct, AdminProductImage } from "@/modules/admin/types";
import { formatMoney } from "@/shared/money";

const EMPTY_VALUES: AdminProductValues = {
  name: "",
  slug: "",
  category: "",
  description: "",
  price: 0,
  stock: 0,
  published: true,
};

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать изображение."));
    reader.readAsDataURL(file);
  });
}

type ProductDialogProps = {
  product: AdminProduct | null;
  onClose: () => void;
  onSave: (product: AdminProduct) => Promise<void>;
};

function ProductDialog({ product, onClose, onSave }: ProductDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [images, setImages] = useState<AdminProductImage[]>(product?.images ?? []);
  const [galleryError, setGalleryError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminProductValues>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          category: product.category,
          description: product.description,
          price: product.price,
          stock: product.stock,
          published: product.published,
        }
      : EMPTY_VALUES,
  });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

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
          src: sources[index],
          alt: `Изображение товара ${file.name}`,
          name: file.name,
        })),
      ]);
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : "Не удалось добавить изображения.");
    }
  }

  const submit = handleSubmit(async (values) => {
    if (images.length === 0) {
      setGalleryError("Добавьте хотя бы одно изображение.");
      return;
    }
    setPending(true);
    setSubmitError("");
    try {
      await onSave({ id: product?.id ?? crypto.randomUUID(), ...values, images });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Не удалось сохранить товар.");
    } finally {
      setPending(false);
    }
  });

  return (
    <dialog
      ref={dialogRef}
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
            aria-label="Закрыть форму"
            size="icon"
            variant="ghost"
            onClick={() => dialogRef.current?.close()}
          >
            <X aria-hidden="true" />
          </Button>
        </header>
        <FieldGroup>
          <div className="admin-product-form__row">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="product-name">Название</FieldLabel>
              <Input id="product-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
              {errors.name ? <FieldError>{errors.name.message}</FieldError> : null}
            </Field>
            <Field data-invalid={Boolean(errors.slug)}>
              <FieldLabel htmlFor="product-slug">Slug</FieldLabel>
              <Input id="product-slug" aria-invalid={Boolean(errors.slug)} {...register("slug")} />
              {errors.slug ? <FieldError>{errors.slug.message}</FieldError> : null}
            </Field>
          </div>
          <Field data-invalid={Boolean(errors.category)}>
            <FieldLabel htmlFor="product-category">Категория</FieldLabel>
            <Input
              id="product-category"
              aria-invalid={Boolean(errors.category)}
              {...register("category")}
            />
            {errors.category ? <FieldError>{errors.category.message}</FieldError> : null}
          </Field>
          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor="product-description">Описание</FieldLabel>
            <Textarea
              id="product-description"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description ? <FieldError>{errors.description.message}</FieldError> : null}
          </Field>
          <div className="admin-product-form__row">
            <Field data-invalid={Boolean(errors.price)}>
              <FieldLabel htmlFor="product-price">Цена, BYN</FieldLabel>
              <Input
                id="product-price"
                type="number"
                min="1"
                step="1"
                aria-invalid={Boolean(errors.price)}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price ? <FieldError>{errors.price.message}</FieldError> : null}
            </Field>
            <Field data-invalid={Boolean(errors.stock)}>
              <FieldLabel htmlFor="product-stock">Остаток</FieldLabel>
              <Input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                aria-invalid={Boolean(errors.stock)}
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock ? <FieldError>{errors.stock.message}</FieldError> : null}
            </Field>
          </div>
          <Field className="admin-product-form__checkbox">
            <input id="product-published" type="checkbox" {...register("published")} />
            <FieldLabel htmlFor="product-published">Опубликован в каталоге</FieldLabel>
          </Field>
          <Field data-invalid={Boolean(galleryError)}>
            <FieldLabel htmlFor="product-gallery">Галерея</FieldLabel>
            <FieldDescription>
              JPG, PNG или WebP до 5 МБ. Максимум {ADMIN_PRODUCT_IMAGE_LIMIT} файлов.
            </FieldDescription>
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
          <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
            Отмена
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Сохраняем…" : "Сохранить товар"}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}

export function AdminProductsManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      setProducts(await getAdminProductsPreview());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить товары.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let active = true;
    getAdminProductsPreview().then(
      (loadedProducts) => {
        if (active) {
          setProducts(loadedProducts);
          setLoading(false);
        }
      },
      (loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить товары.");
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (deleting) deleteDialogRef.current?.showModal();
  }, [deleting]);

  const visibleProducts = products.filter((product) =>
    `${product.name} ${product.category} ${product.slug}`
      .toLocaleLowerCase("ru")
      .includes(query.trim().toLocaleLowerCase("ru")),
  );

  async function saveProduct(product: AdminProduct) {
    const saved = await saveAdminProductPreview(product);
    setProducts((current) =>
      current.some((item) => item.id === saved.id)
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current],
    );
    setEditing(undefined);
  }
  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteAdminProductPreview(deleting.id);
      setProducts((current) => current.filter((item) => item.id !== deleting.id));
      deleteDialogRef.current?.close();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить товар.");
    }
  }

  return (
    <AdminShell active="products">
      <main className="admin-dashboard admin-products">
        <header className="admin-dashboard__header">
          <div>
            <p className="text-label-caps text-secondary">Каталог</p>
            <h1>Товары</h1>
            <p>Управляйте карточками и галереями товаров.</p>
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
            {visibleProducts.length} из {products.length}
          </p>
        </div>
        {error ? (
          <section className="admin-products__state" role="alert">
            <h2>Не удалось выполнить действие</h2>
            <p>{error}</p>
            <Button variant="secondary" onClick={() => void loadProducts()}>
              Повторить
            </Button>
          </section>
        ) : null}
        {loading ? (
          <section className="admin-products__state" aria-busy="true" aria-live="polite">
            <p>Загружаем товары…</p>
          </section>
        ) : null}
        {!loading && !error && visibleProducts.length === 0 ? (
          <section className="admin-products__state">
            <h2>{products.length ? "Ничего не найдено" : "Каталог пуст"}</h2>
            <p>
              {products.length
                ? "Измените поисковый запрос."
                : "Создайте первый товар, чтобы наполнить каталог."}
            </p>
          </section>
        ) : null}
        {!loading && !error && visibleProducts.length ? (
          <div className="admin-products__table-wrap">
            <table className="admin-products__table">
              <caption className="sr-only">Список товаров</caption>
              <thead>
                <tr>
                  <th scope="col">Товар</th>
                  <th scope="col">Категория</th>
                  <th scope="col">Цена</th>
                  <th scope="col">Остаток</th>
                  <th scope="col">Статус</th>
                  <th scope="col">
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
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
                    <td>
                      <span
                        className={product.stock === 0 ? "admin-product-stock--empty" : undefined}
                      >
                        {product.stock === 0 ? "Нет в наличии" : `${product.stock} шт.`}
                      </span>
                    </td>
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
          onClose={() => setEditing(undefined)}
          onSave={saveProduct}
        />
      ) : null}
      <dialog
        ref={deleteDialogRef}
        className="admin-delete-dialog"
        onClose={() => setDeleting(null)}
        aria-labelledby="delete-product-title"
      >
        <div>
          <h2 id="delete-product-title">Удалить товар?</h2>
          <p>
            «{deleting?.name}» будет удалён из демонстрационного каталога. Это действие нельзя
            отменить.
          </p>
          <div className="admin-product-form__actions">
            <Button variant="secondary" onClick={() => deleteDialogRef.current?.close()}>
              Отмена
            </Button>
            <Button className="admin-button--destructive" onClick={() => void confirmDelete()}>
              Удалить товар
            </Button>
          </div>
        </div>
      </dialog>
    </AdminShell>
  );
}
