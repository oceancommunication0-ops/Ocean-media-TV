-- Use the supplied training photograph in both public placements.
-- Preserve all captions, contacts and other site configuration.
UPDATE "SiteSettings"
SET "data" = jsonb_set("data", '{trainingImage}',
  COALESCE("data"->'trainingImage', '{}'::jsonb) || jsonb_build_object(
    'src', '/images/training-community.webp',
    'srcSet', '/images/training-community-480.webp 480w, /images/training-community-800.webp 800w, /images/training-community.webp 1080w',
    'alt', 'Des participants réunis en cercle, avec leurs carnets, lors d’un atelier de formation.'
  )),
  "updatedAt" = NOW()
WHERE "id" = 'main';
