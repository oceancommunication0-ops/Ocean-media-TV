CREATE TABLE "MediaAsset" (
    "id" UUID NOT NULL,
    "data" BYTEA NOT NULL,
    "contentType" VARCHAR(100) NOT NULL DEFAULT 'image/webp',
    "byteLength" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);
