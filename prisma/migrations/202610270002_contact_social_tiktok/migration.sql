-- Preserve existing contacts and social URLs; never reuse an Instagram URL for TikTok.
UPDATE "SiteSettings"
SET "data" = jsonb_set("data", '{socialLinks}',
  (COALESCE("data"->'socialLinks', '{}'::jsonb) - 'Instagram')
  || jsonb_build_object('TikTok', COALESCE("data"->'socialLinks'->'TikTok', 'null'::jsonb))),
  "updatedAt" = NOW()
WHERE "id" = 'main';
