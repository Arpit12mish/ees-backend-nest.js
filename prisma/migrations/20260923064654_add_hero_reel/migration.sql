-- NOTE: Prisma's migration diff misidentifies the "searchVector" generated
-- column (declared as Unsupported("tsvector") in schema.prisma, see the
-- 20260905182733_add_product_search_vector migration) as having a dropped
-- default, and would otherwise emit `DROP INDEX ...` + `ALTER TABLE "Product"
-- ALTER COLUMN "searchVector" DROP DEFAULT` here without ever re-creating the
-- indexes. That's a no-op we don't want (Postgres also rejects DROP DEFAULT
-- on a GENERATED ALWAYS column), so those spurious statements are omitted;
-- the generated column and its indexes are left untouched.

-- CreateTable
CREATE TABLE "HeroReel" (
    "id" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "posterUrl" TEXT,
    "altText" TEXT,
    "productId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroReel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroReel_isActive_idx" ON "HeroReel"("isActive");

-- CreateIndex
CREATE INDEX "HeroReel_priority_idx" ON "HeroReel"("priority");

-- AddForeignKey
ALTER TABLE "HeroReel" ADD CONSTRAINT "HeroReel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
