-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'PRODUCT_VIEW', 'CATEGORY_VIEW', 'COLLECTION_VIEW', 'SEARCH', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'CHECKOUT_STARTED', 'ORDER_COMPLETED');

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT,
    "path" TEXT,
    "productId" TEXT,
    "categoryId" TEXT,
    "collectionId" TEXT,
    "searchQuery" TEXT,
    "resultCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_visitorId_idx" ON "AnalyticsEvent"("visitorId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productId_idx" ON "AnalyticsEvent"("productId");
