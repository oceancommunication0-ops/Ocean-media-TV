import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ArrowRight, ArrowUpRight, Clock3, X } from 'lucide-react'
import { newsArticles, newsCategories, newsImageSources, readingMinutes, type NewsArticle, type NewsCategory } from '../lib/news-content'
import './news.css'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function ArticleMeta({ article }: { article: NewsArticle }) {
  return (
    <div className="news-meta">
      <span>{article.author}</span>
      <span className="news-meta-dot" aria-hidden="true" />
      <time dateTime={article.publishedAt}>{dateFormatter.format(new Date(article.publishedAt))}</time>
      <span className="news-meta-dot" aria-hidden="true" />
      <span className="news-read-time"><Clock3 size={12} aria-hidden="true" />{readingMinutes(article)} min</span>
    </div>
  )
}

function ArticleCard({ article, featured }: { article: NewsArticle; featured?: boolean }) {
  return (
    <article className={`news-card${featured ? ' news-card-featured' : ''}`}>
      <a className="news-card-link" href={article.href} aria-label={article.title}>
        <div className="news-card-image-wrap">
          <img
            className="news-card-image"
            src={article.image}
            srcSet={newsImageSources(article)}
            sizes={featured ? '(max-width: 899px) calc(100vw - 44px), (max-width: 1512px) 52vw, 735px' : '(max-width: 575px) 118px, (max-width: 899px) 30vw, 210px'}
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
            <span className={`news-category category-${article.category.toLocaleLowerCase('fr')}`}>{article.category}</span>
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
      </a>
    </article>
  )
}

export function NewsSection() {
  const [category, setCategory] = useState<NewsCategory>('Tout voir')
  const [notice, setNotice] = useState('')
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const filtered = newsArticles.filter(article => category === 'Tout voir' || article.category === category)
  const visible = filtered.slice(0, 4)

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
  }, [])

  function showNotice(message: string) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = setTimeout(() => setNotice(''), 5000)
  }

  function holdFutureLink(event: MouseEvent<HTMLAnchorElement>, message: string) {
    event.preventDefault()
    showNotice(message)
  }

  return (
    <section id="actualites" className="news-section" aria-labelledby="news-title" tabIndex={-1}>
      <div className="news-container">
        <div className="news-heading">
          <div><p className="news-eyebrow"><span aria-hidden="true" />LE FIL OCÉAN</p><h2 id="news-title">Actualités<span aria-hidden="true">.</span></h2></div>
          <p className="news-introduction">Des idées qui éclairent.<br />{' '}Des histoires qui nous font avancer.</p>
        </div>

        <div className="news-toolbar">
          <div className="news-filters" role="group" aria-label="Filtrer les actualités">
            {newsCategories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <span className="news-edition"><span aria-hidden="true" />DERNIÈRE ÉDITION</span>
        </div>

        <div className={`news-grid${visible.length < 4 ? ' news-grid-filtered' : ''}`}>
          {visible[0] && <ArticleCard article={visible[0]} featured />}
          {visible.length > 1 && <div className="news-secondary-list">{visible.slice(1).map(article => <ArticleCard key={article.id} article={article} />)}</div>}
        </div>

        <div className="news-bottom-line">
          <p>{category === 'Tout voir' ? 'La sélection de la rédaction' : `${filtered.length} publication${filtered.length > 1 ? 's' : ''} · ${category}`}</p>
          <a className="news-all-link" href="/actualites" onClick={event => holdFutureLink(event, 'La page de toutes les actualités sera bientôt disponible.')}>
            Voir toutes les actualités <ArrowRight size={17} strokeWidth={1.6} aria-hidden="true" />
          </a>
          <span className="news-bottom-signature" aria-hidden="true">UN AUTRE REGARD SUR DEMAIN.</span>
        </div>
      </div>

      <div className={`news-notice${notice ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {notice && <><span>{notice}</span><button type="button" aria-label="Fermer la notification" onClick={() => setNotice('')}><X size={16} aria-hidden="true" /></button></>}
      </div>
    </section>
  )
}
