-- Convert articles in place. Slugs, publication state and original publication
-- dates remain intact; no article is deleted.
DO $$
DECLARE
  entry RECORD;
  paragraph TEXT;
  point TEXT;
  heading TEXT;
  position INTEGER;
  blocks JSONB;
  document JSONB;
  next_data JSONB;
BEGIN
  FOR entry IN SELECT * FROM "ContentEntry" WHERE "resource" = 'articles' AND COALESCE("data"->>'contentVersion', '1') <> '2' FOR UPDATE LOOP
    blocks := '[]'::jsonb;
    position := 0;
    FOR paragraph IN SELECT jsonb_array_elements_text(COALESCE(entry."data"->'paragraphs', '[]'::jsonb)) LOOP
      heading := entry."data"->'profile'->'sectionTitles'->>(position - 1);
      IF position > 0 AND COALESCE(heading, '') <> '' THEN
        blocks := blocks || jsonb_build_array(jsonb_build_object('type', 'heading', 'attrs', jsonb_build_object('level', 2), 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', heading))));
      END IF;
      blocks := blocks || jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', paragraph))));
      IF position = 1 AND COALESCE(entry."data"->'profile'->>'pullQuote', '') <> '' THEN
        blocks := blocks || jsonb_build_array(jsonb_build_object('type', 'blockquote', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', entry."data"->'profile'->>'pullQuote'))))));
      END IF;
      IF position = 2 AND entry."data"->'profile'->'inlineImage'->>'src' IS NOT NULL THEN
        blocks := blocks || jsonb_build_array(jsonb_build_object('type', 'image', 'attrs', jsonb_build_object('src', entry."data"->'profile'->'inlineImage'->>'src', 'alt', entry."data"->'profile'->'inlineImage'->>'alt', 'caption', COALESCE(entry."data"->'profile'->'inlineImage'->>'caption', ''))));
      END IF;
      position := position + 1;
    END LOOP;
    IF jsonb_array_length(COALESCE(entry."data"->'profile'->'keyPoints', '[]'::jsonb)) > 0 THEN
      blocks := blocks || jsonb_build_array(jsonb_build_object('type', 'heading', 'attrs', jsonb_build_object('level', 2), 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Les repères à garder'))));
      SELECT jsonb_build_object('type', 'bulletList', 'content', jsonb_agg(jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', value)))))))
      INTO document FROM jsonb_array_elements_text(entry."data"->'profile'->'keyPoints') AS points(value);
      blocks := blocks || jsonb_build_array(document);
    END IF;
    next_data := (entry."data" - 'paragraphs' - 'profile' - 'readingTime') || jsonb_build_object('contentVersion', 2, 'content', jsonb_build_object('type', 'doc', 'content', blocks), 'publishedAt', CASE WHEN entry."published" THEN to_jsonb(entry."publishedAt") ELSE 'null'::jsonb END);
    UPDATE "ContentEntry" SET "data" = next_data, "summary" = next_data - 'content' WHERE "id" = entry."id";
  END LOOP;
END $$;
