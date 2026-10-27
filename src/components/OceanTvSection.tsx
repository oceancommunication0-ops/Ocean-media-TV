import { AppLink } from './AppLink'
import { useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Play, SlidersHorizontal } from 'lucide-react'
import { formatVideoDuration, type VideoItem } from '../lib/tv-content'
import { LoadState, useCollection, useSite } from '../lib/api'
import { VideoPlayerDialog } from './VideoPlayerDialog'
import './ocean-tv.css'

function VideoCard({ video, variant, index, onSelect }: { video: VideoItem; variant: 'featured' | 'side' | 'additional'; index?: number; onSelect: (video: VideoItem, trigger: HTMLElement) => void }) {
  const duration = formatVideoDuration(video.durationSeconds)
  const published = video.publishedAt && !Number.isNaN(Date.parse(video.publishedAt)) ? video.publishedAt : null

  return (
    <article className={`tv-card tv-card-${variant}`}>
      <div className="tv-card-button">
        <div className="tv-thumbnail">
          <img src={video.thumbnail} srcSet={video.thumbnailSrcSet ?? `${video.thumbnail.replace(/\.webp$/, '-480.webp')} 480w, ${video.thumbnail} 1280w`} sizes={variant === 'featured' ? '(max-width: 899px) calc(100vw - 44px), (max-width: 1512px) 60vw, 900px' : variant === 'side' ? '(max-width: 575px) 124px, 200px' : '(max-width: 575px) calc(100vw - 44px), (max-width: 899px) 45vw, 30vw'} width={1280} height={720} alt={video.thumbnailAlt} loading="lazy" decoding="async" />
          {variant === 'featured' && <span className="tv-feature-badge"><span aria-hidden="true" />À L’AFFICHE</span>}
          <span className="tv-play" aria-hidden="true"><Play size={variant === 'featured' ? 27 : 18} fill="currentColor" strokeWidth={1.3} /></span>
          {variant === 'featured' && <span className="tv-watch-label" aria-hidden="true">DÉCOUVRIR LA VIDÉO <ArrowUpRight size={14} /></span>}
          {duration && <span className="tv-duration">{duration}</span>}
        </div>
        <div className="tv-card-copy">
          <div className="tv-category-line"><span className="tv-category">{video.categoryLabel ?? video.category}</span>{variant === 'side' && <span className="tv-side-index" aria-hidden="true">0{index}</span>}</div>
          <h3><button type="button" className="tv-select-button" aria-label={`Regarder : ${video.title}`} aria-haspopup="dialog" onClick={event => onSelect(video, event.currentTarget)}>{video.title}</button></h3>
          {variant === 'featured' && <><p className="tv-description">{video.description}</p>{published && <time className="tv-published" dateTime={published}>{new Date(published).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>}</>}
          {video.channel && <span className="tv-channel">{video.channel}</span>}
        </div>
      </div>
    </article>
  )
}

export function OceanTvSection() {
  const [category, setCategory] = useState('')
  const categories = useSite().categories.videos
  const data = useCollection('videos', { category, limit: 4 })
  const videoItems = data.items
  const [selected, setSelected] = useState<VideoItem | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const select = (video: VideoItem, trigger: HTMLElement) => { returnFocus.current = trigger; setSelected(video) }

  return (
    <section id="ocean-tv" className="ocean-tv-section" aria-labelledby="tv-title" tabIndex={-1}>
      <div className="tv-container">
        <div className="tv-heading">
          <div><p className="tv-eyebrow"><span aria-hidden="true" />LE MONDE EN IMAGES</p><h2 id="tv-title">Océan <span>TV</span><span className="tv-title-dot" aria-hidden="true">.</span></h2></div>
          <p className="tv-introduction">Voir plus loin.<br /><span>Comprendre autrement.</span></p>
        </div>

        <div className="tv-filter-bar">
          <div className="tv-filter-label"><SlidersHorizontal size={15} aria-hidden="true" /><span>Filtrer</span></div>
          <div className="tv-filters" role="group" aria-label="Filtrer les vidéos de l’accueil par format">
            <button type="button" aria-pressed={category === ''} onClick={() => setCategory('')}>Toutes</button>
            {categories.map(item => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
          </div>
        </div>

        <LoadState {...data} variant="list" count={4} />
        {!data.loading && !data.error && videoItems.length === 0 && <p className="api-state">Les vidéos seront disponibles prochainement.</p>}
        {videoItems[0] && <div className="tv-main-grid">
          <VideoCard video={videoItems[0]} variant="featured" onSelect={select} />
          <div className="tv-side-selection"><div className="tv-selection-heading"><span>LA SÉLECTION</span><span aria-hidden="true">01 — 03</span></div><div className="tv-side-cards">{videoItems.slice(1, 4).map((video, index) => <VideoCard key={video.id} video={video} variant="side" index={index + 1} onSelect={select} />)}</div></div>
        </div>}

        <div className="tv-explore">
          <div><span>LA VIDÉOTHÈQUE</span><p>Reportages, entretiens, émissions et regards inspirants réunis dans un même espace.</p></div>
          <AppLink href="/ocean-tv">Explorer toutes les vidéos <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" /></AppLink>
        </div>
      </div>

      <VideoPlayerDialog video={selected} onClose={() => setSelected(null)} returnFocus={returnFocus} />
    </section>
  )
}
