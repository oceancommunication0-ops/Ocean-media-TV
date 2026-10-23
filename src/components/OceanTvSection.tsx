import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Film, Play, X } from 'lucide-react'
import { formatVideoDuration, videoItems, youtubeEmbedUrl, type VideoItem } from '../lib/tv-content'
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
          <div className="tv-category-line"><span className="tv-category">{video.category}</span>{variant === 'side' && <span className="tv-side-index" aria-hidden="true">0{index}</span>}</div>
          <h3><button type="button" className="tv-select-button" aria-label={`Regarder : ${video.title}`} aria-haspopup="dialog" onClick={event => onSelect(video, event.currentTarget)}>{video.title}</button></h3>
          {variant === 'featured' && <><p className="tv-description">{video.description}</p>{published && <time className="tv-published" dateTime={published}>{new Date(published).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>}</>}
          {video.channel && <span className="tv-channel">{video.channel}</span>}
        </div>
      </div>
    </article>
  )
}

export function OceanTvSection() {
  const [selected, setSelected] = useState<VideoItem | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()
  const embedUrl = selected ? youtubeEmbedUrl(selected.youtubeId) : null
  const duration = reducedMotion ? 0 : .22
  const select = (video: VideoItem, trigger: HTMLElement) => { returnFocus.current = trigger; setSelected(video) }

  return (
    <section id="ocean-tv" className="ocean-tv-section" aria-labelledby="tv-title" tabIndex={-1}>
      <div className="tv-container">
        <div className="tv-heading">
          <div><p className="tv-eyebrow"><span aria-hidden="true" />LE MONDE EN IMAGES</p><h2 id="tv-title">Océan <span>TV</span><span className="tv-title-dot" aria-hidden="true">.</span></h2></div>
          <p className="tv-introduction">Voir plus loin.<br /><span>Comprendre autrement.</span></p>
        </div>

        <div className="tv-main-grid">
          <VideoCard video={videoItems[0]} variant="featured" onSelect={select} />
          <div className="tv-side-selection"><div className="tv-selection-heading"><span>LA SÉLECTION</span><span aria-hidden="true">01 — 03</span></div><div className="tv-side-cards">{videoItems.slice(1, 4).map((video, index) => <VideoCard key={video.id} video={video} variant="side" index={index + 1} onSelect={select} />)}</div></div>
        </div>

        <div className="tv-more-heading"><h3>Encore un autre regard<span aria-hidden="true">.</span></h3><span>À DÉCOUVRIR AUSSI</span></div>
        <div className="tv-additional-grid">{videoItems.slice(4, 7).map(video => <VideoCard key={video.id} video={video} variant="additional" onSelect={select} />)}</div>
        <div className="tv-section-end"><span>DES VOIX. DES IDÉES. DES PERSPECTIVES.</span><span aria-hidden="true"><Film size={14} strokeWidth={1.5} />OCÉAN MÉDIA TV</span></div>
      </div>

      <Dialog.Root open={selected !== null} onOpenChange={open => { if (!open) setSelected(null) }}>
        <AnimatePresence>
          {selected && <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount asChild><motion.div className="tv-player-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }} /></Dialog.Overlay>
            <Dialog.Content forceMount asChild onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus({ preventScroll: true }) }}>
              <motion.div className="tv-player-dialog" initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : 8 }} transition={{ duration }}>
                <div className="tv-player-toolbar"><span>OCÉAN TV <span aria-hidden="true">/</span> {selected.category}</span><Dialog.Close className="tv-player-close" aria-label="Fermer la vidéo"><X size={22} strokeWidth={1.6} aria-hidden="true" /></Dialog.Close></div>
                <div className="tv-player-screen">
                  {embedUrl ? <iframe key={embedUrl} src={embedUrl} title={`Lecteur YouTube : ${selected.title}`} width={1280} height={720} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className="tv-player-unavailable"><Film size={32} strokeWidth={1.3} aria-hidden="true" /><p>Vidéo à venir</p><span>Retrouvez prochainement ce contenu sur Océan TV.</span></div>}
                </div>
                <div className="tv-player-caption"><Dialog.Title>{selected.title}</Dialog.Title><Dialog.Description>{selected.description || 'Une vidéo de la sélection Océan TV.'}</Dialog.Description>{embedUrl && <a href={`https://www.youtube.com/watch?v=${selected.youtubeId}`} target="_blank" rel="noopener noreferrer">Ouvrir sur YouTube <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> — nouvel onglet</span></a>}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>}
        </AnimatePresence>
      </Dialog.Root>
    </section>
  )
}
