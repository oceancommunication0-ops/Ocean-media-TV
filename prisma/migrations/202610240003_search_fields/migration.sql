-- Index editorial fields only; filenames and image descriptions are not search results.
UPDATE "ContentEntry" SET "searchText" = LOWER(TRANSLATE(
  CONCAT_WS(' ', "data"->>'title', "data"->>'excerpt', "data"->>'description', "data"->>'category', "data"->>'family', "data"->>'format', "data"->>'organization', "data"->>'location', "data"->>'audience', "data"->>'channel', "data"->>'tagline'),
  'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖòóôõöÙÚÛÜùúûüÇçÑñ',
  'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn'
));
