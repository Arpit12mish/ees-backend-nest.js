-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "cardUrl" TEXT,
ADD COLUMN     "detailUrl" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "storageProvider" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;
