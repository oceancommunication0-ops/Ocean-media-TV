import { useRef, useState, type KeyboardEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Compass, MoveUpRight, X } from 'lucide-react'
import { heroStories, type HeroStory } from '../lib/hero-content'
import './hero.css'

type HeroPanel = 'mission' | 'story' | null

function imageSources(path: string) {
  const base = path.replace(/\.webp$/, '')
  return `${base}-768.webp 768w, ${base}-1280.webp 1280w, ${path} 1536w`
}

function EditorialPhoto({ story, duration, priority }: { story: HeroStory; duration: number; priority: boolean }) {
  const isPresent = useIsPresent()
  return (
    <motion.img
      className="hero-photo"
      src={story.image}
      srcSet={imageSources(story.image)}
      sizes="(max-width: 899px) calc(100vw - 44px), 50vw"
      alt={story.alt}
      aria-hidden={isPresent ? undefined : true}
      width={1536}
      height={1024}
      style={{ objectPosition: story.position }}
      initial={{ opacity: duration === 0 ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
    />
  )
}

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [panel, setPanel] = useState<HeroPanel>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const returnFocus = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion()
  const story = heroStories[activeIndex]
  const duration = reduceMotion ? 0 : 0.32

  function selectTab(index: number, focus = false) {
    setActiveIndex(index)
    if (focus) tabs.current[index]?.focus({ preventScroll: true })
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % heroStories.length; break
      case 'ArrowLeft': next = (index + heroStories.length - 1) % heroStories.length; break
      case 'Home': next = 0; break
      case 'End': next = heroStories.length - 1; break
      default: return
    }
    event.preventDefault()
    selectTab(next, true)
  }

  function explore() {
    selectTab(0, true)
    tabs.current[0]?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'instant' : 'smooth' })
  }

  function openPanel(next: Exclude<HeroPanel, null>, trigger: HTMLElement) {
    returnFocus.current = trigger
    setPanel(next)
  }

  return (
    <section className="ocean-hero" aria-labelledby="hero-title">
      <div className="hero-container">
        <div className="hero-edition-line">
          <p><span className="edition-dot" aria-hidden="true" />LE MÉDIA D’UNE GÉNÉRATION</p>
          <p className="hero-edition-location">ANCRÉ EN RDC. TOURNÉ VERS DEMAIN.<ArrowUpRight size={13} aria-hidden="true" /></p>
        </div>

        <div className="hero-composition">
          <div className="hero-copy">
            <motion.div initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <p className="hero-eyebrow"><span aria-hidden="true" />COMPRENDRE. APPRENDRE. OSER.</p>
              <h1 id="hero-title" className="hero-title">L’info qui <br />ouvre les <br /><em>horizons.</em></h1>
              <p className="hero-description">Le média qui relie la jeunesse congolaise aux idées, aux savoirs et aux opportunités pour agir.</p>
              <div className="hero-actions">
                <button type="button" className="hero-primary-action" onClick={explore}>Explorer nos regards<ArrowDownRight size={20} strokeWidth={1.7} aria-hidden="true" /></button>
                <button type="button" className="hero-mission-action" aria-haspopup="dialog" onClick={event => openPanel('mission', event.currentTarget)}>L’esprit Océan<ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" /></button>
              </div>
            </motion.div>

            <div className="hero-origin">
              <span className="hero-origin-icon"><Compass size={22} strokeWidth={1.3} aria-hidden="true" /></span>
              <p>Une initiative d’<br /><strong>Océan Communication</strong></p>
              <span className="hero-origin-line" aria-hidden="true" />
              <span className="hero-origin-note">Les idées nous relient.<br />L’avenir nous rassemble.</span>
            </div>
          </div>

          <div className="hero-editorial">
            <div className="hero-tabs" role="tablist" aria-label="Nos regards éditoriaux">
              {heroStories.map((item, index) => (
                <button
                  type="button"
                  role="tab"
                  id={`hero-tab-${item.id}`}
                  key={item.id}
                  aria-selected={activeIndex === index}
                  aria-controls="hero-feature-panel"
                  tabIndex={activeIndex === index ? 0 : -1}
                  ref={element => { tabs.current[index] = element }}
                  onClick={() => selectTab(index)}
                  onKeyDown={event => onTabKeyDown(event, index)}
                  className={`hero-tab${activeIndex === index ? ' is-selected' : ''}`}
                >
                  <span className="hero-tab-index" aria-hidden="true">0{index + 1}</span>
                  <span>{item.tab}</span>
                  <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="hero-feature" id="hero-feature-panel" role="tabpanel" aria-labelledby={`hero-tab-${story.id}`} tabIndex={0}>
              <div className="hero-photo-wrap">
                <AnimatePresence initial={false}>
                  <EditorialPhoto key={story.id} story={story} duration={reduceMotion ? 0 : 0.45} priority={activeIndex === 0} />
                </AnimatePresence>
              </div>
              <div className="hero-photo-shade" aria-hidden="true" />
              <div className="hero-photo-topline">
                <span className="hero-photo-label"><span aria-hidden="true" />NOS REGARDS</span>
                <span className="hero-photo-counter"><span className="sr-only">Regard </span>0{activeIndex + 1}<span className="counter-divider" aria-hidden="true" /><span className="sr-only"> sur </span>03</span>
              </div>
              <div className="hero-photo-side-label" aria-hidden="true">UNE JEUNESSE. MILLE POSSIBLES.</div>
              <div className="hero-feature-content">
                <span className="hero-feature-category">{story.category}</span>
                <h2 className="hero-feature-title">{story.title}</h2>
                <button type="button" className="hero-feature-action" aria-haspopup="dialog" onClick={event => openPanel('story', event.currentTarget)}><span>Lire notre regard</span><span className="hero-feature-arrow"><MoveUpRight size={24} strokeWidth={1.4} aria-hidden="true" /></span></button>
              </div>
            </div>

          </div>
        </div>

        <div className="hero-colophon">
          <p>L’information qui rapproche les opportunités de la jeunesse.</p>
          <span className="hero-colophon-mark" aria-hidden="true"><span />INFORMER <span />FORMER <span />INSPIRER</span>
        </div>
      </div>

      <Dialog.Root open={panel !== null} onOpenChange={open => { if (!open) setPanel(null) }}>
        <AnimatePresence>
          {panel && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount><motion.div className="dialog-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }} /></Dialog.Overlay>
              <Dialog.Content asChild forceMount onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus({ preventScroll: true }) }}>
                <motion.div className={`hero-dialog${panel === 'mission' ? ' hero-dialog-mission' : ''}`} initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }} transition={{ duration }}>
                  <div className="hero-dialog-top"><span>{panel === 'mission' ? 'L’ESPRIT OCÉAN' : `LE REGARD OCÉAN · ${story.category}`}</span><Dialog.Close className="icon-button" aria-label="Fermer la fenêtre"><X size={22} strokeWidth={1.6} aria-hidden="true" /></Dialog.Close></div>
                  {panel === 'mission' ? (
                    <div className="hero-mission-content">
                      <Dialog.Title className="hero-mission-title">Informer. <br /><span>Former. </span><br /><em>Inspirer.</em></Dialog.Title>
                      <Dialog.Description className="hero-dialog-introduction">L’information qui rapproche les opportunités de la jeunesse.</Dialog.Description>
                      <p>Océan Média TV est le média numérique d’Océan Communication, une structure congolaise engagée dans l’information, la formation et l’accompagnement de la jeunesse.</p>
                      <p>Notre conviction : une information accessible, des savoirs partagés et des parcours inspirants peuvent ouvrir de nouvelles perspectives. Nous voulons créer des liens entre les jeunes et les opportunités qui les aident à avancer.</p>
                      <div className="hero-mission-signature"><span aria-hidden="true" />OCÉAN MÉDIA TV<ArrowUpRight size={19} aria-hidden="true" /></div>
                    </div>
                  ) : (
                    <>
                      <img className="hero-dialog-image" src={story.image} srcSet={imageSources(story.image)} sizes="(max-width: 730px) calc(100vw - 40px), 690px" alt="" width={1536} height={1024} loading="lazy" decoding="async" style={{ objectPosition: story.dialogPosition }} />
                      <div className="hero-story-content">
                        <Dialog.Title className="hero-dialog-title">{story.title}</Dialog.Title>
                        <Dialog.Description className="hero-dialog-introduction">{story.introduction}</Dialog.Description>
                        {story.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                        <ul className="hero-story-tags" aria-label="Formats et thématiques">{story.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
                        <p className="hero-photo-credit">Visuel d’illustration créé pour Océan Média TV.</p>
                      </div>
                    </>
                  )}
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </section>
  )
}
