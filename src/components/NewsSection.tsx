import { AppLink } from './AppLink'
import { useState } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { newsImageSources, type ArticleSummary as NewsArticle } from '../lib/news-content'
import { LoadState, useCollection, useSite } from '../lib/api'
import './news.css'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Kinshasa',
})

function ArticleMeta({ article }: { article: NewsArticle }) {
  return (
    <div className="news-meta">
      <span>{article.author}</span>
      <span className="news-meta-dot" aria-hidden="true" />
      {article.publishedAt && <time dateTime={article.publishedAt}>{dateFormatter.format(new Date(article.publishedAt))}</time>}
    </div>
  )
}

function ArticleCard({ article, featured }: { article: NewsArticle; featured?: boolean }) {
  return (
    <article className={`news-card${featured ? ' news-card-featured' : ''}`}>
      <AppLink className="news-card-link" href={article.href} aria-label={article.title}>
        <div className="news-card-image-wrap">
          <img
            className="news-card-image"
            src={article.image}
            srcSet={newsImageSources(article)}
            sizes={featured ? '(max-width: 899px) calc(100vw - 44px), (max-width: 1512px) 52vw, 735px' : '(max-width: 575px) calc(100vw - 44px), (max-width: 767px) 160px, (max-width: 899px) 30vw, 210px'}
            alt={article.imageAlt}
            width={1536}
            height={1024}
            style={{ objectPosition: article.imagePosition }}
            loading="lazy"
            decoding="async"
          />
          {featured && <span className="news-feature-label">À LA UNE</span>}
        </div>
        <div className="news-card-copy">
          <div className="news-category-line">
            <span className={`news-category category-${article.category.toLocaleLowerCase('fr')}`}>{article.categoryLabel ?? article.category}</span>
            <span className="news-format">{article.format}</span>
          </div>
          <h3>{article.title}</h3>
          <p className="news-excerpt">{article.excerpt}</p>
          <ArticleMeta article={article} />
          <span className="news-card-cta" aria-hidden="true">
            Lire l’article
            <span><ArrowUpRight size={featured ? 20 : 17} strokeWidth={1.6} /></span>
          </span>
        </div>
      </AppLink>
    </article>
  )
}

export function NewsSection() {
  const [category, setCategory] = useState('')
  const newsCategories = useSite().categories.articles
  const data = useCollection('articles', { category, limit: 4 })
  const visible = data.items

  return (
    <section id="actualites" className="news-section" aria-labelledby="news-title" tabIndex={-1}>
      <div className="news-container">
        <div className="news-heading">
          <div><p className="news-eyebrow"><span aria-hidden="true" />LE FIL OCÉAN</p><h2 id="news-title">Actualités<span aria-hidden="true">.</span></h2></div>
          <p className="news-introduction">Des idées qui éclairent.<br />{' '}Des histoires qui nous font avancer.</p>
        </div>

        <div className="news-toolbar">
          <div className="news-filters" role="group" aria-label="Filtrer les actualités">
            <button type="button" aria-pressed={category === ''} onClick={() => setCategory('')}>Tout voir</button>
            {newsCategories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
          </div>
          <span className="news-edition"><span aria-hidden="true" />DERNIÈRE ÉDITION</span>
        </div>

        <LoadState {...data} variant="list" count={4} />
        {!data.loading && !data.error && visible.length === 0 && <p className="api-state">Aucune actualité disponible pour cette sélection.</p>}
        <div className={`news-grid${visible.length < 4 ? ' news-grid-filtered' : ''}`}>
          {visible[0] && <ArticleCard article={visible[0]} featured />}
          {visible.length > 1 && <div className="news-secondary-list">{visible.slice(1).map(article => <ArticleCard key={article.id} article={article} />)}</div>}
        </div>

        <div className="news-bottom-line news-bottom-line-simple">
          <AppLink className="news-all-link" href="/actualites">
            Voir toutes les actualités <ArrowRight size={17} strokeWidth={1.6} aria-hidden="true" />
          </AppLink>
        </div>
      </div>
    </section>
  )
}
