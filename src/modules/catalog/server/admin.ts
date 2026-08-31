import "server-only";

import * as service from "@/modules/catalog/server/admin-service";
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
  ImageCreateInput,
  ImageUpdateInput,
  OptionCreateInput,
  OptionGroupCreateInput,
  OptionGroupUpdateInput,
  OptionUpdateInput,
  ProductCreateInput,
  ProductUpdateInput,
  SpecificationCreateInput,
  SpecificationUpdateInput,
} from "@/modules/catalog/server/admin-schemas";
import { requireAdmin } from "@/server/admin-auth";

function protectedOperation<Arguments extends readonly unknown[], Result>(
  operation: (...args: Arguments) => Promise<Result>,
): (...args: Arguments) => Promise<Result> {
  return async (...args) => {
    await requireAdmin();
    return operation(...args);
  };
}

export const listAdminCategories = protectedOperation(() => service.listAdminCategories());
export const createCategory = protectedOperation((input: CategoryCreateInput) =>
  service.createCategory(input),
);
export const updateCategory = protectedOperation((id: string, input: CategoryUpdateInput) =>
  service.updateCategory(id, input),
);
export const deleteCategory = protectedOperation((id: string) => service.deleteCategory(id));

export const listAdminProducts = protectedOperation(() => service.listAdminProducts());
export const getAdminProduct = protectedOperation((id: string) => service.getAdminProduct(id));
export const createProduct = protectedOperation((input: ProductCreateInput) =>
  service.createProduct(input),
);
export const updateProduct = protectedOperation((id: string, input: ProductUpdateInput) =>
  service.updateProduct(id, input),
);
export const deleteProduct = protectedOperation((id: string) => service.deleteProduct(id));

export const createSpecification = protectedOperation((input: SpecificationCreateInput) =>
  service.createSpecification(input),
);
export const updateSpecification = protectedOperation(
  (id: string, input: SpecificationUpdateInput) => service.updateSpecification(id, input),
);
export const deleteSpecification = protectedOperation((id: string) =>
  service.deleteSpecification(id),
);

export const createOptionGroup = protectedOperation((input: OptionGroupCreateInput) =>
  service.createOptionGroup(input),
);
export const updateOptionGroup = protectedOperation((id: string, input: OptionGroupUpdateInput) =>
  service.updateOptionGroup(id, input),
);
export const deleteOptionGroup = protectedOperation((id: string) => service.deleteOptionGroup(id));
export const createOption = protectedOperation((input: OptionCreateInput) =>
  service.createOption(input),
);
export const updateOption = protectedOperation((id: string, input: OptionUpdateInput) =>
  service.updateOption(id, input),
);
export const deleteOption = protectedOperation((id: string) => service.deleteOption(id));

export const createImage = protectedOperation((input: ImageCreateInput) =>
  service.createImage(input),
);
export const updateImage = protectedOperation((id: string, input: ImageUpdateInput) =>
  service.updateImage(id, input),
);
export const deleteImage = protectedOperation((id: string) => service.deleteImage(id));
