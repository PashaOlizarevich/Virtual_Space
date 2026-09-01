-- AlterTable
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "retentionUntil" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "Cart" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" BIGSERIAL NOT NULL,
    "cartId" BIGINT NOT NULL,
    "productId" BIGINT NOT NULL,
    "selectedOptions" JSONB NOT NULL,
    "optionsKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "observedPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cart_items_quantity_positive" CHECK ("quantity" > 0),
    CONSTRAINT "cart_items_observed_price_nonnegative" CHECK ("observedPrice" >= 0)
);

-- CreateIndex: one active cart per user and the user-cart lookup path.
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex: one canonical product configuration per cart.
CREATE UNIQUE INDEX "CartItem_cartId_productId_optionsKey_key" ON "CartItem"("cartId", "productId", "optionsKey");

-- CreateIndex: stable retrieval of all items in a cart.
CREATE INDEX "CartItem_cartId_createdAt_id_idx" ON "CartItem"("cartId", "createdAt", "id");

-- CreateIndex: support product relation checks and product-scoped cart-item lookups.
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");

-- The existing "Order_userId_createdAt_id_idx" index already covers user order history.

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
