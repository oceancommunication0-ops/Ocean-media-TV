CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "ContentEntry_searchText_trgm_idx" ON "ContentEntry" USING GIN ("searchText" gin_trgm_ops);
