UPDATE "SiteSettings"
SET "data" = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        "data",
        '{trainingImage,homeEyebrow}',
        to_jsonb('APPRENDRE. OSER. AVANCER.'::text),
        true
      ),
      '{trainingImage,homeCaption}',
      to_jsonb('Chaque compétence ouvre une nouvelle possibilité.'::text),
      true
    ),
    '{trainingImage,pageEyebrow}',
    to_jsonb('APPRENDRE · PRATIQUER · PROGRESSER'::text),
    true
  ),
  '{trainingImage,pageCaption}',
  to_jsonb('Chaque compétence acquise ouvre de nouvelles perspectives.'::text),
  true
)
WHERE "id" = 'main';
