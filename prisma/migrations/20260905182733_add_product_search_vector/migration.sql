-- Enable trigram similarity for typo-tolerant fallback search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Generated, weighted full-text search column (kept in sync automatically by Postgres)
ALTER TABLE "Product"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("sku", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("shortDescription", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("longDescription", '')), 'C') ||
    setweight(to_tsvector('english', coalesce("storySummary", '')), 'C') ||
    setweight(to_tsvector('english', coalesce("spiritualBenefitSummary", '')), 'C') ||
    setweight(to_tsvector('english', coalesce("usageGuide", '')), 'C')
  ) STORED;

CREATE INDEX "Product_searchVector_idx" ON "Product" USING GIN ("searchVector");
CREATE INDEX "Product_name_trgm_idx" ON "Product" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Product_sku_trgm_idx" ON "Product" USING GIN ("sku" gin_trgm_ops);
