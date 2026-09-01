import "server-only";

import { OrderStatus, Prisma } from "@prisma/client";

import {
  validateGuestCart,
  type GuestCartValidationIssue,
  type ValidatedGuestCartItem,
} from "@/modules/orders/server/cart-validation";
import { cartProductSelect } from "@/modules/orders/server/queries";
import { createGuestOrderSchema } from "@/modules/orders/server/schemas";
import { db } from "@/server/db";
import { notifyAdminOfCreatedOrder } from "@/server/integrations/telegram";
import { mapMoney, type MoneyDto } from "@/shared/money";

const MAX_SERIALIZABLE_RETRIES = 3;

export type OrderCreationTransaction = Readonly<{
  order: Pick<Prisma.TransactionClient["order"], "create">;
  product: Pick<Prisma.TransactionClient["product"], "findMany" | "updateMany">;
}>;
export type TransactionRunner = <Result>(
  operation: (transaction: OrderCreationTransaction) => Promise<Result>,
) => Promise<Result>;
export type CreatedOrderNotifier = (order: CreatedGuestOrderDto) => Promise<void>;

export type CreatedGuestOrderDto = Readonly<{
  orderNumber: string;
  total: MoneyDto;
  status: "NEW";
}>;

export class OrderCreationConflictError extends Error {
  constructor(readonly issues: readonly GuestCartValidationIssue[]) {
    super("Order cannot be created from the current cart");
    this.name = "OrderCreationConflictError";
  }
}

function defaultTransactionRunner<Result>(
  operation: (transaction: OrderCreationTransaction) => Promise<Result>,
): Promise<Result> {
  return db.$transaction(operation, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

function createPublicNumber(): string {
  return `VS-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

function isRetryableTransactionError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

function getQuantitiesByProduct(items: readonly ValidatedGuestCartItem[]): Map<string, number> {
  const quantities = new Map<string, number>();

  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  return quantities;
}

export async function createGuestOrder(
  input: unknown,
  executeTransaction: TransactionRunner = defaultTransactionRunner,
  generatePublicNumber: () => string = createPublicNumber,
  notifyCreatedOrder: CreatedOrderNotifier = notifyAdminOfCreatedOrder,
): Promise<CreatedGuestOrderDto> {
  const { contact, cart } = createGuestOrderSchema.parse(input);

  for (let attempt = 1; attempt <= MAX_SERIALIZABLE_RETRIES; attempt += 1) {
    try {
      const createdOrder = await executeTransaction(async (transaction) => {
        const validation = await validateGuestCart(cart, (productIds) =>
          transaction.product.findMany({
            where: { id: { in: [...productIds] } },
            select: cartProductSelect,
          }),
        );

        if (validation.issues.length > 0) {
          throw new OrderCreationConflictError(validation.issues);
        }

        for (const [productId, quantity] of getQuantitiesByProduct(validation.items)) {
          const updated = await transaction.product.updateMany({
            where: { id: BigInt(productId), isActive: true, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          });

          if (updated.count !== 1) {
            throw new OrderCreationConflictError([{ productId, code: "INSUFFICIENT_STOCK" }]);
          }
        }

        const total = validation.items.reduce(
          (sum, item) => sum.plus(new Prisma.Decimal(item.unitPrice.amount).times(item.quantity)),
          new Prisma.Decimal(0),
        );
        const order = await transaction.order.create({
          data: {
            publicNumber: generatePublicNumber(),
            customerName: contact.name,
            phone: contact.phone,
            email: contact.email,
            comment: contact.comment || null,
            currency: "BYN",
            total,
            status: OrderStatus.NEW,
            items: {
              create: validation.items.map((item) => ({
                productId: BigInt(item.productId),
                snapshotName: item.name,
                snapshotOptions: [...item.selectedOptions],
                snapshotPrice: new Prisma.Decimal(item.unitPrice.amount),
                quantity: item.quantity,
                lineTotal: new Prisma.Decimal(item.unitPrice.amount).times(item.quantity),
              })),
            },
            statusHistory: {
              create: {
                previousStatus: OrderStatus.NEW,
                newStatus: OrderStatus.NEW,
              },
            },
          },
          select: { publicNumber: true, total: true, currency: true, status: true },
        });

        return {
          orderNumber: order.publicNumber,
          total: mapMoney(order.total, order.currency),
          status: "NEW" as const,
        };
      });

      try {
        await notifyCreatedOrder(createdOrder);
      } catch {
        console.error("Telegram order notification failed after order commit");
      }

      return createdOrder;
    } catch (error) {
      if (isRetryableTransactionError(error) && attempt < MAX_SERIALIZABLE_RETRIES) continue;
      throw error;
    }
  }

  throw new Error("Unable to create order");
}
