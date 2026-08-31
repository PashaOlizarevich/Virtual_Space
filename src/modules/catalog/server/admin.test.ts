import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const requireAdmin = jest.fn<() => Promise<unknown>>();
const createCategory = jest.fn<(input: unknown) => Promise<unknown>>();

jest.mock("@/server/admin-auth", () => ({ requireAdmin }));
jest.mock("@/modules/catalog/server/admin-service", () => ({
  createCategory,
  listAdminCategories: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  listAdminProducts: jest.fn(),
  getAdminProduct: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  createSpecification: jest.fn(),
  updateSpecification: jest.fn(),
  deleteSpecification: jest.fn(),
  createOptionGroup: jest.fn(),
  updateOptionGroup: jest.fn(),
  deleteOptionGroup: jest.fn(),
  createOption: jest.fn(),
  updateOption: jest.fn(),
  deleteOption: jest.fn(),
  createImage: jest.fn(),
  updateImage: jest.fn(),
  deleteImage: jest.fn(),
}));

describe("catalog admin boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("checks the current admin role before forwarding input", async () => {
    requireAdmin.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    createCategory.mockResolvedValue({ id: "1", slug: "sofas", name: "Sofas" });
    const { createCategory: protectedCreateCategory } =
      await import("@/modules/catalog/server/admin");
    const input = { slug: "sofas", name: "Sofas" };

    await expect(protectedCreateCategory(input)).resolves.toMatchObject({ id: "1" });
    expect(requireAdmin).toHaveBeenCalledTimes(1);
    expect(requireAdmin.mock.invocationCallOrder[0]).toBeLessThan(
      createCategory.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
    expect(createCategory).toHaveBeenCalledWith(input);
  });

  it("does not reach Prisma service when authorization fails", async () => {
    requireAdmin.mockRejectedValue(new Error("forbidden"));
    const { createCategory: protectedCreateCategory } =
      await import("@/modules/catalog/server/admin");

    await expect(protectedCreateCategory({ slug: "sofas", name: "Sofas" })).rejects.toThrow(
      "forbidden",
    );
    expect(createCategory).not.toHaveBeenCalled();
  });
});
