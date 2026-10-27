import { AppLink } from './AppLink'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Film, Play, Search, SlidersHorizontal, X } from 'lucide-react'
import { formatVideoDuration, type VideoItem } from '../lib/tv-content'
import { VideoPlayerDialog } from './VideoPlayerDialog'
import { CATALOGUE_PAGE_SIZE, useCatalogueFilters, LoadState, useCollection, useSite } from '../lib/api'
import { Pagination } from './Pagination'
import './ocean-tv.css'
import './ocean-tv-page.css'

function CatalogueCard({ video, index, onSelect }: { video: VideoItem; index: number; onSelect: (video: VideoItem, trigger: HTMLElement) => void }) {
  const duration = formatVideoDuration(video.durationSeconds)

  return (
    <motion.article className="otv-catalogue-card" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: .25, delay: Math.min(index, 5) * .025 }}>
      <div className="otv-card-media">
        <img src={video.thumbnail} srcSet={video.thumbnailSrcSet ?? `${video.thumbnail.replace(/\.webp$/, '-480.webp')} 480w, ${video.thumbnail} 1280w`} sizes="(max-width: 639px) calc(100vw - 44px), (max-width: 999px) 46vw, 31vw" width={1280} height={720} alt={video.thumbnailAlt} loading="lazy" decoding="async" />
        <span className="otv-card-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="otv-card-play" aria-hidden="true"><Play size={19} fill="currentColor" strokeWidth={1.2} /></span>
        {duration && <span className="otv-card-duration">{duration}</span>}
      </div>
      <div className="otv-card-copy">
        <div className="otv-card-kicker"><span>{video.categoryLabel ?? video.category}</span><span aria-hidden="true" />{video.channel && <span>{video.channel}</span>}</div>
        <h2><button type="button" aria-haspopup="dialog" aria-label={`Regarder : ${video.title}`} onClick={event => onSelect(video, event.currentTarget)}>{video.title}</button></h2>
        <p>{video.description}</p>
        <span className="otv-card-action">Regarder maintenant <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" /></span>
      </div>
    </motion.article>
  )
}

export function OceanTvPage() {
  const [selected, setSelected] = useState<VideoItem | null>(null)
  const { category: activeCategory, query, setCategory: setActiveCategory, setQuery, reset } = useCatalogueFilters()
  const returnFocus = useRef<HTMLElement | null>(null)
  const categories = useSite().categories.videos
  const featuredData = useCollection('videos', { limit: 1 })
  const featured = featuredData.items[0]
  const data = useCollection('videos', { category: activeCategory, query, limit: CATALOGUE_PAGE_SIZE, paginated: true })
  const filteredVideos = data.items

  useEffect(() => {
    document.title = 'Océan TV | Océan Média TV'
  }, [])

  const openVideo = (video: VideoItem, trigger: HTMLElement) => {
    returnFocus.current = trigger
    setSelected(video)
  }


  return (
    <main id="main-content" className="otv-page" tabIndex={-1}>
      <section className="otv-hero" aria-labelledby="otv-page-title">
        {featured && <div className="otv-hero-media" aria-hidden="true">
          <img src={featured.thumbnail} srcSet={featured.thumbnailSrcSet} sizes="100vw" width={1280} height={720} alt="" fetchPriority="high" decoding="async" />
        </div>}
        <div className="otv-hero-shade" aria-hidden="true" />
        <div className="otv-shell otv-hero-shell">
          <AppLink className="otv-back-link" href="/#ocean-tv"><ArrowLeft size={15} strokeWidth={1.6} aria-hidden="true" /> Retour à l’accueil</AppLink>
          <div className="otv-hero-content">
            <p className="otv-hero-brand"><span aria-hidden="true" /> OCÉAN TV <small>À LA UNE</small></p>
            <h1 id="otv-page-title">Des images pour <em>voir plus loin.</em></h1>
            {featured && <><div className="otv-feature-meta"><span>{featured.categoryLabel ?? featured.category}</span><span aria-hidden="true" />{featured.channel && <span>{featured.channel}</span>}</div>
            <h2>{featured.title}</h2>
            <p className="otv-feature-description">{featured.description}</p>
            <button type="button" className="otv-feature-play" aria-haspopup="dialog" onClick={event => openVideo(featured, event.currentTarget)}><span><Play size={22} fill="currentColor" strokeWidth={1.2} aria-hidden="true" /></span> Regarder la vidéo</button></>}
          </div>
          <div className="otv-hero-index" aria-hidden="true"><span>01</span><span /><small>{String(featuredData.pagination?.total ?? 0).padStart(2, '0')}</small></div>
        </div>
      </section>

      <section id="video-catalogue" tabIndex={-1} className="otv-catalogue" aria-labelledby="otv-catalogue-title">
        <div className="otv-shell">
          <div className="otv-catalogue-heading">
            <div><p>LA VIDÉOTHÈQUE</p><h2 id="otv-catalogue-title">Tous les regards<span>.</span></h2></div>
            <p>Explorez une sélection d’émissions, de reportages, d’entretiens et de formats qui éclairent l’actualité autrement.</p>
          </div>

          <div className="otv-tools">
            <div className="otv-filter-label"><SlidersHorizontal size={14} strokeWidth={1.6} aria-hidden="true" /><span>Explorer par format</span></div>
            <div className="otv-filters" role="group" aria-label="Filtrer les vidéos par format">
              <button type="button" aria-pressed={activeCategory === ''} onClick={() => setActiveCategory('')}>Toutes</button>
              {categories.map(category => <button key={category.id} type="button" aria-pressed={activeCategory === category.id} onClick={() => setActiveCategory(category.id)}>{category.label}</button>)}
            </div>
            <form className="otv-search" role="search" onSubmit={event => event.preventDefault()}>
              <Search size={16} strokeWidth={1.7} aria-hidden="true" />
              <label className="sr-only" htmlFor="otv-search-input">Rechercher une vidéo</label>
              <input id="otv-search-input" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher une vidéo" autoComplete="off" />
              {query && <button type="button" aria-label="Effacer la recherche" onClick={() => setQuery('')}><X size={15} aria-hidden="true" /></button>}
            </form>
          </div>

          <div className="otv-results-line"><p role="status" aria-live="polite">{data.pagination?.total ?? 0} vidéo{(data.pagination?.total ?? 0) > 1 ? 's' : ''}</p></div>

          <LoadState {...data} count={3} />
          {data.loading || data.error ? null : filteredVideos.length > 0
            ? <motion.div className="otv-catalogue-grid" layout><AnimatePresence mode="popLayout">{filteredVideos.map((video, index) => <CatalogueCard key={video.id} video={video} index={index} onSelect={openVideo} />)}</AnimatePresence></motion.div>
            : <div className="otv-empty"><Film size={35} strokeWidth={1.2} aria-hidden="true" /><h2>Aucune vidéo ne correspond.</h2><p>Essayez un autre mot-clé ou revenez à l’ensemble de la vidéothèque.</p><button type="button" onClick={reset}>Voir toutes les vidéos <ArrowRight size={15} aria-hidden="true" /></button></div>}
          <Pagination meta={data.pagination} onChange={data.setPage} target="video-catalogue" />
        </div>
      </section>

      <VideoPlayerDialog video={selected} onClose={() => setSelected(null)} returnFocus={returnFocus} />
    </main>
  )
}
