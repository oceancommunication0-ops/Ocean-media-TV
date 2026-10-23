import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock3, Copy, MessageCircle, Printer, Quote } from 'lucide-react'
import { articleProfiles } from '../lib/article-content'
import { newsArticles, newsImageSources, readingMinutes, type NewsArticle } from '../lib/news-content'
import './article-page.css'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
})

function RelatedArticle({ article }: { article: NewsArticle }) {
  return <article className="related-article">
    <a href={article.href} aria-label={article.title}>
      <div className="related-article-image"><img src={article.image} srcSet={newsImageSources(article)} sizes="(max-width: 699px) calc(100vw - 44px), 30vw" alt={article.imageAlt} width={1536} height={1024} loading="lazy" decoding="async" style={{ objectPosition: article.imagePosition }} /></div>
      <span>{article.category}</span>
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
      <span className="related-article-link">Lire l’article <ArrowUpRight size={16} aria-hidden="true" /></span>
    </a>
  </article>
}

export function ArticlePage({ article }: { article: NewsArticle }) {
  const [progress, setProgress] = useState(0)
  const [notice, setNotice] = useState('')
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const profile = articleProfiles[article.id]
  const related = useMemo(() => newsArticles.filter(item => item.id !== article.id).slice(0, 3), [article.id])
  const sections = article.paragraphs.slice(1).map((paragraph, index) => ({
    id: `section-${index + 1}`,
    title: profile.sectionTitles[index] ?? `Point de repère ${index + 1}`,
    paragraph,
  }))

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${article.title} | Océan Média TV`
    window.scrollTo(0, 0)
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
      if (noticeTimer.current) clearTimeout(noticeTimer.current)
    }
  }, [article])

  function announce(message: string) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = setTimeout(() => setNotice(''), 4500)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      announce('Le lien de l’article a été copié.')
    } catch {
      announce('Impossible de copier automatiquement le lien.')
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${article.title} — ${typeof window === 'undefined' ? article.href : window.location.href}`)}`

  return <>
    <div className="article-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
    <main id="main-content" tabIndex={-1} aria-label={`Article : ${article.title}`} className="article-page">
      <header className="article-masthead">
        <div className="article-shell">
          <a className="article-back" href="/#actualites"><ArrowLeft size={16} strokeWidth={1.7} aria-hidden="true" /> Retour aux actualités</a>
          <div className="article-kicker"><span>{article.category}</span><span aria-hidden="true" />{article.format}</div>
          <h1>{article.title}</h1>
          <p className="article-deck">{article.excerpt}</p>
          <div className="article-byline-row">
            <div className="article-author"><span className="article-author-mark" aria-hidden="true">O</span><span>Par <strong>{article.author}</strong><small>Océan Média TV</small></span></div>
            <div className="article-date-meta"><time dateTime={article.publishedAt}>{dateFormatter.format(new Date(article.publishedAt))}</time><span aria-hidden="true" /><span><Clock3 size={14} aria-hidden="true" />{readingMinutes(article)} min de lecture</span></div>
          </div>
        </div>
      </header>

      <figure className="article-hero-media">
        <img src={article.image} srcSet={newsImageSources(article)} sizes="100vw" alt={article.imageAlt} width={1536} height={1024} fetchPriority="high" decoding="async" style={{ objectPosition: article.imagePosition }} />
        <figcaption><span>Image d’ouverture</span> {article.imageAlt.replace(/ — illustration\.$/, '.')} <em>Visuel d’illustration créé pour Océan Média TV.</em></figcaption>
      </figure>

      <div className="article-reading-layout article-shell">
        <aside className="article-share" aria-label="Partager et imprimer l’article">
          <span>Partager</span>
          <button type="button" onClick={copyLink} aria-label="Copier le lien de l’article"><Copy size={17} aria-hidden="true" /></button>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Partager l’article sur WhatsApp"><MessageCircle size={18} aria-hidden="true" /></a>
          <button type="button" onClick={() => window.print()} aria-label="Imprimer l’article"><Printer size={17} aria-hidden="true" /></button>
        </aside>

        <article className="article-body">
          <p className="article-opening">{article.paragraphs[0]}</p>
          {sections.map((section, index) => <div className="article-section-block" id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            <p>{section.paragraph}</p>
            {index === 0 && <blockquote><Quote size={27} strokeWidth={1.3} aria-hidden="true" /><p>{profile.pullQuote}</p><cite>Le regard de la rédaction</cite></blockquote>}
            {index === 1 && <figure className="article-inline-media"><img src={profile.inlineImage.src} srcSet={profile.inlineImage.srcSet} sizes="(max-width: 799px) calc(100vw - 44px), 720px" alt={profile.inlineImage.alt} width={1200} height={800} loading="lazy" decoding="async" style={{ objectPosition: profile.inlineImage.position }} /><figcaption>{profile.inlineImage.caption}</figcaption></figure>}
          </div>)}
          <div className="article-topics" aria-label="Thématiques de l’article"><span>{article.category}</span><span>Jeunesse</span><span>RDC</span></div>
        </article>

        <aside className="article-summary" aria-labelledby="article-summary-title">
          <p className="article-summary-eyebrow">L’ESSENTIEL</p>
          <h2 id="article-summary-title">À retenir</h2>
          <ul>{profile.keyPoints.map(point => <li key={point}><Check size={15} strokeWidth={2} aria-hidden="true" /><span>{point}</span></li>)}</ul>
          <div className="article-summary-line"><span aria-hidden="true" />INFORMER · FORMER · INSPIRER</div>
        </aside>
      </div>

      <section className="article-author-note article-shell" aria-labelledby="author-note-title">
        <div className="article-author-large" aria-hidden="true">O</div>
        <div><p>LA RÉDACTION</p><h2 id="author-note-title">Océan Média TV</h2><span>Une rédaction tournée vers les idées, les savoirs et les opportunités qui aident la jeunesse congolaise à avancer.</span></div>
        <a href="/#actualites">Toutes les actualités <ArrowRight size={17} aria-hidden="true" /></a>
      </section>

      <section className="related-section" aria-labelledby="related-title">
        <div className="article-shell">
          <div className="related-heading"><div><span>POURSUIVRE LA LECTURE</span><h2 id="related-title">À découvrir ensuite.</h2></div><a href="/#actualites">Voir les actualités <ArrowUpRight size={16} aria-hidden="true" /></a></div>
          <div className="related-grid">{related.map(item => <RelatedArticle key={item.id} article={item} />)}</div>
        </div>
      </section>
    </main>
    <div className={`article-notice${notice ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{notice}</div>
  </>
}
