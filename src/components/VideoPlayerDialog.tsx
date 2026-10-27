import type { RefObject } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Film, X } from 'lucide-react'
import { youtubeEmbedUrl, type VideoItem } from '../lib/tv-content'

interface VideoPlayerDialogProps {
  video: VideoItem | null
  onClose: () => void
  returnFocus: RefObject<HTMLElement | null>
}

export function VideoPlayerDialog({ video, onClose, returnFocus }: VideoPlayerDialogProps) {
  const reducedMotion = useReducedMotion()
  const embedUrl = video ? youtubeEmbedUrl(video.youtubeId) : null
  const duration = reducedMotion ? 0 : .22

  return (
    <Dialog.Root open={video !== null} onOpenChange={open => { if (!open) onClose() }}>
      <AnimatePresence>
        {video && <Dialog.Portal forceMount>
          <Dialog.Overlay forceMount asChild>
            <motion.div className="tv-player-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }} />
          </Dialog.Overlay>
          <Dialog.Content forceMount asChild onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus({ preventScroll: true }) }}>
            <motion.div className="tv-player-dialog" initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : 8 }} transition={{ duration }}>
              <div className="tv-player-toolbar">
                <span>OCÉAN TV <span aria-hidden="true">/</span> {video.category}</span>
                <Dialog.Close className="tv-player-close" aria-label="Fermer la vidéo"><X size={22} strokeWidth={1.6} aria-hidden="true" /></Dialog.Close>
              </div>
              <div className="tv-player-screen">
                {embedUrl
                  ? <iframe key={embedUrl} src={embedUrl} title={`Lecteur YouTube : ${video.title}`} width={1280} height={720} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                  : <div className="tv-player-unavailable"><Film size={32} strokeWidth={1.3} aria-hidden="true" /><p>Vidéo à venir</p><span>Retrouvez prochainement ce contenu sur Océan TV.</span></div>}
              </div>
              <div className="tv-player-caption">
                <Dialog.Title>{video.title}</Dialog.Title>
                <Dialog.Description>{video.description || 'Une vidéo de la sélection Océan TV.'}</Dialog.Description>
                {embedUrl && <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer">Ouvrir sur YouTube <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> — nouvel onglet</span></a>}
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>}
      </AnimatePresence>
    </Dialog.Root>
  )
}
