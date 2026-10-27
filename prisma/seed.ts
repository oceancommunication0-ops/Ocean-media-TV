import { prisma } from "../server/db.js";
import { ZodError } from "zod";
import { prepareContent } from "../server/content-service.js";
import { siteSchema } from "../server/validation.js";
import {
  newsArticles,
  newsCategories,
  newsImageSources,
} from "./seed-content/news-content.js";
import { articleProfiles } from "./seed-content/article-content.js";
import { videoItems, videoCategories } from "./seed-content/tv-content.js";
import {
  opportunities,
  opportunityCategories,
} from "./seed-content/opportunities-content.js";
import {
  trainingDomains,
  trainingFamilies,
} from "./seed-content/training-content.js";
import { mediaEvents, eventCategories } from "./seed-content/events-content.js";
import { heroStories } from "./seed-content/hero-content.js";
import {
  navigation,
  contact,
  socialLinks,
} from "./seed-content/site-config.js";
import type { Resource } from "../shared/content.js";
import { legacyArticleDocument } from "../shared/article-document.js";

// Migration additive : aucune donnée existante n’est écrasée et aucune table n’est vidée.
async function seed() {
  const categories = {
    articles: newsCategories
      .filter((item) => item !== "Tout voir")
      .map((label) => ({ id: label, label })),
    videos: videoCategories.map((label) => ({ id: label, label })),
    opportunities: opportunityCategories,
    trainings: trainingFamilies,
    events: eventCategories,
    hero: [],
  };
  const site = siteSchema.parse({
    navigation,
    contact,
    socialLinks,
    trainingImage: {
      src: "/images/training-community.webp",
      srcSet:
        "/images/training-community-480.webp 480w, /images/training-community-800.webp 800w, /images/training-community.webp 1080w",
      alt: "Des participants réunis en cercle, avec leurs carnets, lors d’un atelier de formation.",
      homeEyebrow: "APPRENDRE. OSER. AVANCER.",
      homeCaption: "Chaque compétence ouvre une nouvelle possibilité.",
      pageEyebrow: "APPRENDRE · PRATIQUER · PROGRESSER",
      pageCaption: "Chaque compétence acquise ouvre de nouvelles perspectives.",
    },
    credits: [
      { name: "Kindel Media", id: "7688363" },
      { name: "Andres Ayrton", id: "6578395" },
      { name: "Evans Cudjoe", id: "6977922" },
      { name: "PICHA Stock", id: "3869649" },
      { name: "Monstera Production", id: "9487622" },
      { name: "Mikhail Nilov", id: "8872459" },
      { name: "RDNE Stock project", id: "7648052" },
      { name: "Pavel Danilyuk", id: "8761650" },
      { name: "Christina Morillo", id: "1181427" },
      { name: "Wiseboy Wissebo", id: "38111334" },
      { name: "Werner Pfennig", id: "6949931" },
    ],
  });
  await prisma.$transaction(
    async (tx) => {
      await tx.siteSettings.upsert({
        where: { id: "main" },
        create: { id: "main", data: site },
        update: {},
      });
      await tx.category.createMany({
        data: Object.entries(categories).flatMap(([resource, values]) =>
          values.map((category, sortOrder) => {
            const { id, label, ...metadata } = category;
            return {
              id: resource + ":" + id,
              resource: resource as Resource,
              key: id,
              label,
              metadata,
              sortOrder,
            };
          }),
        ),
        skipDuplicates: true,
      });
      const data: Record<Resource, readonly unknown[]> = {
        articles: newsArticles.map((article) => {
          const {
            paragraphs,
            readingTime: _readingTime,
            publishedAt,
            ...metadata
          } = article;
          return {
            ...metadata,
            publishedAt: new Date(publishedAt).toISOString(),
            imageSrcSet: newsImageSources(article),
            contentVersion: 2,
            content: legacyArticleDocument({
              paragraphs,
              profile: articleProfiles[article.id],
            }),
          };
        }),
        videos: videoItems,
        opportunities,
        trainings: trainingDomains,
        events: mediaEvents.map((event) => ({
          ...event,
          image: {
            ...event.image,
            src: "/images/" + event.image.src + ".webp",
            srcSet:
              "/images/" +
              event.image.src +
              "-480.webp 480w, /images/" +
              event.image.src +
              "-800.webp 800w, /images/" +
              event.image.src +
              ".webp 1200w",
          },
          overview: [event.description],
          benefits: [
            "Un espace de partage des connaissances et d’échange entre participants.",
          ],
        })),
        hero: heroStories.map((story) => ({
          ...story,
          imageSrcSet:
            story.image.replace(".webp", "-768.webp") +
            " 768w, " +
            story.image.replace(".webp", "-1280.webp") +
            " 1280w, " +
            story.image +
            " 1536w",
        })),
      };
      await tx.contentEntry.createMany({
        data: Object.entries(data).flatMap(([resource, values]) =>
          values.map((value, sortOrder) => ({
            resource: resource as Resource,
            ...prepareContent(resource as Resource, value),
            published: true,
            sortOrder,
          })),
        ),
        skipDuplicates: true,
      });
      await tx.auditLog.create({
        data: {
          action: "initial-import",
          resource: "all",
          target: "existing-editorial-content",
        },
      });
    },
    { timeout: 120_000 },
  );
  console.log(
    "Migration initiale terminée : contenus enregistrés dans PostgreSQL.",
  );
}
seed()
  .catch((error) => {
    console.error(
      error instanceof ZodError
        ? JSON.stringify(error.issues)
        : JSON.stringify({
            name: error?.name,
            code: error?.code,
            message:
              "Import impossible. Vérifiez la connexion et les migrations.",
          }),
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
