import { z } from "zod";

const uploadSignatureSchema = z.strictObject({
  allowed_formats: z.string().min(1),
  apiKey: z.string().min(1),
  cloudName: z.string().min(1),
  publicId: z.string().min(1),
  signature: z.string().min(1),
  timestamp: z.number().int().positive(),
  transformation: z.string().min(1),
});

const finalizedImageSchema = z.strictObject({
  id: z.string().regex(/^[1-9]\d*$/),
  productId: z.string().regex(/^[1-9]\d*$/),
  cloudinaryPublicId: z.string().min(1),
  secureUrl: z.string().url().startsWith("https://"),
  alt: z.string().min(1),
  position: z.number().int().nonnegative(),
});

async function readPayload(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export async function requestProductImageUploadSignature(productId: string) {
  const response = await fetch("/api/admin/uploads/signature", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? "Сессия администратора истекла. Обновите страницу и войдите снова."
        : "Не удалось подготовить загрузку изображения. Проверьте настройки Cloudinary в Vercel.",
    );
  }
  return uploadSignatureSchema.parse(payload);
}

export async function finalizeProductImage(input: {
  productId: string;
  publicId: string;
  alt: string;
  position: number;
}) {
  const response = await fetch("/api/admin/uploads/finalize", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? "Сессия администратора истекла. Обновите страницу и войдите снова."
        : "Изображение загружено, но не удалось прикрепить его к товару.",
    );
  }
  return finalizedImageSchema.parse(payload);
}
