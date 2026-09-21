-- CreateEnum
CREATE TYPE "ContactLeadSource" AS ENUM ('GENERAL', 'CUSTOM_BRACELET');

-- AlterTable
ALTER TABLE "ContactLead" ADD COLUMN     "location" TEXT,
ADD COLUMN     "source" "ContactLeadSource" NOT NULL DEFAULT 'GENERAL';
