import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Clock3, X } from 'lucide-react'
import { newsArticles, newsCategories, newsImageSources, readingMinutes, type NewsArticle, type NewsCategory } from '../lib/news-content'
import './news.css'

function ArticleMeta({ article }: { article: NewsArticle }) {
  return (
    <div className="news-meta">
      {article.publishedAt ? <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time> : <span>{article.isDemo ? 'Exemple éditorial' : article.format}</span>}
      <span className="news-meta-dot" aria-hidden="true" />
      <span className="news-read-time"><Clock3 size={12} aria-hidden="true" />{readingMinutes(article)} min de lecture</span>
    </div>
  )
}

function ArticleCard({ article, featured, onOpen }: { article: NewsArticle; featured: boolean; onOpen: (article: NewsArticle, trigger: HTMLElement) => void }) {
  return (
    <article className={`news-card${featured ? ' news-card-featured' : ''}`}>
      <div className="news-card-image-wrap">
        <img className="news-card-image" src={article.image} srcSet={newsImageSources(article)} sizes={featured ? '(max-width: 767px) calc(100vw - 44px), (max-width: 1512px) 52vw, 735px' : '(max-width: 575px) 108px, (max-width: 767px) 160px, 190px'} alt={article.imageAlt} width={1536} height={1024} style={{ objectPosition: article.imagePosition }} loading="lazy" decoding="async" />
        {featured && <span className="news-feature-label">À LA UNE</span>}
      </div>
      <div className="news-card-copy">
        <div className="news-category-line"><span className={`news-category category-${article.category.toLocaleLowerCase('fr')}`}>{article.category}</span><span className="news-format">{article.format}</span></div>
        <h3><button type="button" className="news-title-button" onClick={event => onOpen(article, event.currentTarget)} aria-haspopup="dialog">{article.title}</button></h3>
        <p className="news-excerpt">{article.excerpt}</p>
        <ArticleMeta article={article} />
        {featured && <span className="news-feature-read" aria-hidden="true">Lire l’article<span><ArrowUpRight size={20} strokeWidth={1.5} /></span></span>}
      </div>
    </article>
  )
}

export function NewsSection() {
  const [category, setCategory] = useState<NewsCategory>('Tout voir')
  const [visibleCount, setVisibleCount] = useState(4)
  const [selected, setSelected] = useState<NewsArticle | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const grid = useRef<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion()
  const filtered = newsArticles.filter(article => category === 'Tout voir' || article.category === category)
  const visible = filtered.slice(0, visibleCount)
  const duration = reduceMotion ? 0 : 0.22

  function chooseCategory(next: NewsCategory) {
    setCategory(next)
    setVisibleCount(4)
  }

  function showMore() {
    const previousCount = visible.length
    setVisibleCount(count => count + 4)
    // Le bouton disparaît au dernier lot : placer le focus sur le premier
    // nouvel article permet de poursuivre la lecture au clavier.
    requestAnimationFrame(() => {
      grid.current?.querySelectorAll<HTMLButtonElement>('.news-title-button')[previousCount]?.focus({ preventScroll: true })
    })
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
            {newsCategories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => chooseCategory(item)}>{item}</button>)}
          </div>
          <span className="news-demo-label"><span aria-hidden="true" />Contenus de démonstration</span>
        </div>

        <div ref={grid} className={`news-grid${visible.length < 4 ? ' news-grid-filtered' : ''}`}>
          {visible.map((article, index) => <ArticleCard key={article.id} article={article} featured={index === 0} onOpen={(item, trigger) => { returnFocus.current = trigger; setSelected(item) }} />)}
        </div>

        <div className="news-bottom-line">
          <p role="status" aria-live="polite" aria-atomic="true">{visible.length} sur {filtered.length} articles{category !== 'Tout voir' ? ` · ${category}` : ''}</p>
          {visible.length < filtered.length && <button type="button" className="news-load-more" onClick={showMore}>Afficher plus d’articles<ArrowDown size={17} strokeWidth={1.5} aria-hidden="true" /></button>}
          <span className="news-bottom-signature" aria-hidden="true">UN AUTRE REGARD SUR DEMAIN.</span>
        </div>
      </div>

      <Dialog.Root open={selected !== null} onOpenChange={open => { if (!open) setSelected(null) }}>
        <AnimatePresence>
          {selected && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay forceMount asChild><motion.div className="dialog-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }} /></Dialog.Overlay>
              <Dialog.Content forceMount asChild onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus({ preventScroll: true }) }}>
                <motion.div className="news-reader" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }} transition={{ duration }}>
                  <div className="news-reader-toolbar"><span>OCÉAN MÉDIA TV <span aria-hidden="true">/</span> {selected.category}</span><Dialog.Close className="icon-button" aria-label="Fermer l’article"><X size={22} strokeWidth={1.6} aria-hidden="true" /></Dialog.Close></div>
                  <div className="news-reader-head">
                    {selected.isDemo && <span className="news-reader-demo">Article de démonstration</span>}
                    <Dialog.Title>{selected.title}</Dialog.Title>
                    <Dialog.Description>{selected.excerpt}</Dialog.Description>
                    <ArticleMeta article={selected} />
                  </div>
                  <figure className="news-reader-figure"><img src={selected.image} srcSet={newsImageSources(selected)} sizes="(max-width: 800px) calc(100vw - 32px), 760px" alt={selected.imageAlt} width={1536} height={1024} decoding="async" /><figcaption>{selected.isDemo ? 'Photographie d’illustration générée pour cet exemple éditorial.' : selected.imageAlt}</figcaption></figure>
                  <div className="news-reader-body">{selected.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<div className="news-reader-end"><span aria-hidden="true" />OCÉAN MÉDIA TV</div></div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </section>
  )
}
