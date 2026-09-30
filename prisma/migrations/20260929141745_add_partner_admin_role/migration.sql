-- NOTE: Prisma's migration diff also emitted the spurious "searchVector"
-- DROP INDEX / ALTER COLUMN ... DROP DEFAULT statements described in
-- 20260920150503_seo_reviews_guides_faqs/migration.sql. Omitted here for the
-- same reason — the generated tsvector column and its indexes are untouched.

-- AlterEnum
ALTER TYPE "AdminRole" ADD VALUE 'PARTNER';
