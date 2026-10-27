import { AppLink } from "./AppLink";
import { useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  newsImageSources,
  type ArticleSummary as NewsArticle,
} from "../lib/news-content";
import {
  CATALOGUE_PAGE_SIZE,
  useCatalogueFilters,
  LoadState,
  useCollection,
  useSite,
} from "../lib/api";
import { Pagination } from "./Pagination";
import "./news-index.css";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Kinshasa",
});

function ArticleMeta({ article }: { article: NewsArticle }) {
  return (
    <div className="news-index-meta">
      {article.publishedAt && (
        <time dateTime={article.publishedAt}>
          {dateFormatter.format(new Date(article.publishedAt))}
        </time>
      )}
    </div>
  );
}

function NewsIndexCard({
  article,
  variant = "grid",
  priority = false,
}: {
  article: NewsArticle;
  variant?: "lead" | "side" | "grid";
  priority?: boolean;
}) {
  return (
    <article className={`news-index-card news-index-card-${variant}`}>
      <AppLink href={article.href} aria-label={article.title}>
        <div className="news-index-card-media">
          <img
            src={article.image}
            srcSet={newsImageSources(article)}
            sizes={
              variant === "lead"
                ? "(max-width: 899px) calc(100vw - 44px), 62vw"
                : "(max-width: 699px) calc(100vw - 44px), 32vw"
            }
            alt={article.imageAlt}
            width={1536}
            height={1024}
            style={{ objectPosition: article.imagePosition }}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
          />
          {variant === "lead" && (
            <span className="news-index-lead-label">À LA UNE</span>
          )}
        </div>
        <div className="news-index-card-copy">
          <div className="news-index-category">
            <span>{article.categoryLabel ?? article.category}</span>
            <span aria-hidden="true" />
            {article.format}
          </div>
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
          <ArticleMeta article={article} />
          <span className="news-index-card-action">
            Lire l’article{" "}
            <span>
              <ArrowUpRight
                size={variant === "lead" ? 20 : 17}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </span>
          </span>
        </div>
      </AppLink>
    </article>
  );
}

export function NewsIndexPage() {
  const {
    category,
    query,
    setCategory,
    setQuery,
    reset: resetFilters,
  } = useCatalogueFilters();
  const newsCategories = useSite().categories.articles;
  const data = useCollection("articles", {
    category,
    query,
    limit: CATALOGUE_PAGE_SIZE,
    paginated: true,
  });
  const results = data.items;
  const filtering = category !== "" || query.length > 0;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Actualités | Océan Média TV";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const latest = results;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      aria-label="Page des actualités"
      className="news-index-page"
    >
      <header className="news-index-masthead">
        <div className="news-index-shell">
          <AppLink className="news-index-home-link" href="/">
            Accueil <ArrowRight size={13} aria-hidden="true" />
          </AppLink>
          <div className="news-index-heading-grid">
            <div>
              <p className="news-index-eyebrow">
                <span aria-hidden="true" />
                LE JOURNAL NUMÉRIQUE D’OCÉAN
              </p>
              <h1>
                Actualités<span>.</span>
                <br />
                <em>Idées & perspectives.</em>
              </h1>
            </div>
            <div className="news-index-intro">
              <p>
                Découvrez les informations, les initiatives et les parcours qui
                éclairent et donnent les moyens d'agir.
              </p>
              <span>INFORMER · FORMER · INSPIRER</span>
            </div>
          </div>
        </div>
      </header>

      <section
        id="news-catalogue"
        tabIndex={-1}
        className="news-index-discovery"
        aria-labelledby="all-news-title"
      >
        <div className="news-index-shell">
          <div className="news-index-discovery-heading">
            <div>
              <p>EXPLORER LE FIL</p>
              <h2 id="all-news-title">Toutes les actualités.</h2>
            </div>
            <form role="search" onSubmit={(event) => event.preventDefault()}>
              <label className="sr-only" htmlFor="news-index-search">
                Rechercher dans les actualités
              </label>
              <Search size={18} aria-hidden="true" />
              <input
                id="news-index-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un sujet…"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Effacer la recherche"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </form>
          </div>

          <div className="news-index-toolbar">
            <div className="news-index-filter-label">
              <SlidersHorizontal size={15} aria-hidden="true" />
              <span>Filtrer</span>
            </div>
            <div
              className="news-index-filters"
              role="group"
              aria-label="Filtrer toutes les actualités"
            >
              <button
                type="button"
                aria-pressed={category === ""}
                onClick={() => setCategory("")}
              >
                Tout voir
              </button>
              {newsCategories.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={category === item.id}
                  onClick={() => setCategory(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p role="status" aria-live="polite">
              {data.pagination?.total ?? 0} résultat
              {(data.pagination?.total ?? 0) > 1 ? "s" : ""}
            </p>
          </div>

          <LoadState {...data} count={3} />
          {data.loading || data.error ? null : latest.length > 0 ? (
            <div
              className={`news-index-results${filtering ? " is-filtering" : ""}`}
            >
              {latest.map((article) => (
                <NewsIndexCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="news-index-empty">
              <span>00</span>
              <h3>Aucune publication ne correspond.</h3>
              <p>
                Essayez une autre expression ou rétablissez l’ensemble du fil.
              </p>
              <button type="button" onClick={resetFilters}>
                Réinitialiser les filtres{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
          <Pagination
            meta={data.pagination}
            onChange={data.setPage}
            target="news-catalogue"
          />
        </div>
      </section>
    </main>
  );
}
