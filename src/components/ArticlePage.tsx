import { AppLink } from './AppLink'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react'
import { newsImageSources, type NewsArticle, type ArticleSummary } from '../lib/news-content'
import { ApiError, LoadState, useApi, useCollection } from '../lib/api'
import './article-page.css'
import { ArticleDocumentView } from './ArticleDocumentView'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Africa/Kinshasa',
})

function RelatedArticle({ article }: { article: ArticleSummary }) {
  return <article className="related-article">
    <AppLink href={article.href} aria-label={article.title}>
      <div className="related-article-image"><img src={article.image} srcSet={newsImageSources(article)} sizes="(max-width: 699px) calc(100vw - 44px), 30vw" alt={article.imageAlt} width={1536} height={1024} loading="lazy" decoding="async" style={{ objectPosition: article.imagePosition }} /></div>
      <span>{article.categoryLabel ?? article.category}</span>
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
      <span className="related-article-link">Lire l’article <ArrowUpRight size={16} aria-hidden="true" /></span>
    </AppLink>
  </article>
}

export function ArticlePage({ slug }: { slug: string }) {
  const state = useApi<NewsArticle>('/articles/' + encodeURIComponent(slug))
  if (state.error instanceof ApiError && state.error.status === 404) return <main id="main-content" className="article-page api-bootstrap"><h1>Article introuvable</h1><p>Cette publication n’est plus disponible.</p><AppLink href="/actualites">Retour aux actualités</AppLink></main>
  if (!state.data) return <main id="main-content" className="article-page"><LoadState {...state} variant="article" /></main>
  return <ArticleContent article={state.data} />
}

function ArticleContent({ article }: { article: NewsArticle }) {
  const [progress, setProgress] = useState(0)
  const related = useCollection('articles', { limit: 3, exclude: article.id })

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${article.title} | Océan Média TV`
    let frame = 0
    const updateProgress = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const available = document.documentElement.scrollHeight - window.innerHeight
        setProgress(available > 0 ? Math.min(100, Math.max(0, window.scrollY / available * 100)) : 0)
      })
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      document.title = previousTitle
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [article])

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${article.title} — ${typeof window === 'undefined' ? article.href : window.location.href}`)}`

  return <>
    <div className="article-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
    <main id="main-content" tabIndex={-1} aria-label={`Article : ${article.title}`} className="article-page">
      <header className="article-masthead">
        <div className="article-shell">
          <AppLink className="article-back" href="/actualites"><ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" /> Retour aux actualités</AppLink>
          <div className="article-kicker"><span>{article.category}</span><span aria-hidden="true" />{article.format}</div>
          <h1>{article.title}</h1>
          <p className="article-deck">{article.excerpt}</p>
          <div className="article-byline-row">
            <div className="article-author"><span className="article-author-mark" aria-hidden="true">O</span><span>Par <strong>{article.author}</strong><small>Océan Média TV</small></span></div>
            <div className="article-date-meta">{article.publishedAt && <time dateTime={article.publishedAt}>{dateFormatter.format(new Date(article.publishedAt))}</time>}</div>
          </div>
        </div>
      </header>

      <figure className="article-hero-media">
        <img src={article.image} srcSet={newsImageSources(article)} sizes="100vw" alt={article.imageAlt} width={1536} height={1024} fetchPriority="high" decoding="async" style={{ objectPosition: article.imagePosition }} />
      </figure>

      <div className="article-reading-layout article-shell">
        <aside className="article-share" aria-label="Partager l’article">
          <span>Partager</span>
          <AppLink href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Partager l’article sur WhatsApp"><MessageCircle size={18} aria-hidden="true" /></AppLink>
        </aside>

        <article className="article-body">
          <ArticleDocumentView document={article.content} />
          <div className="article-topics" aria-label="Thématiques de l’article"><span>{article.category}</span><span>Jeunesse</span><span>RDC</span></div>
        </article>

      </div>

      <section className="article-author-note article-shell" aria-labelledby="author-note-title">
        <div className="article-author-large" aria-hidden="true">O</div>
        <div><p>LA RÉDACTION</p><h2 id="author-note-title">Océan Média TV</h2><span>Une rédaction tournée vers les idées, les savoirs et les opportunités qui aident la jeunesse congolaise à avancer.</span></div>
        <AppLink href="/actualites">Toutes les actualités <ArrowRight size={17} aria-hidden="true" /></AppLink>
      </section>

      <section className="related-section" aria-labelledby="related-title">
        <div className="article-shell">
          <div className="related-heading"><div><span>POURSUIVRE LA LECTURE</span><h2 id="related-title">À découvrir ensuite.</h2></div><AppLink href="/actualites">Voir les actualités <ArrowUpRight size={16} aria-hidden="true" /></AppLink></div>
          <LoadState {...related} count={3} /><div className="related-grid">{related.items.map(item => <RelatedArticle key={item.id} article={item} />)}</div>
        </div>
      </section>
    </main>
  </>
}
