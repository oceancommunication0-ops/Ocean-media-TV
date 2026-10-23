import { useEffect, useRef, useState, type MouseEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Info, Menu, MessageCircle, Phone, Search, X } from 'lucide-react'
import { Brand } from './Brand'
import { SocialLinks } from './SocialLinks'
import { contact, navigation, type NavigationItem, type SocialNetwork } from '../lib/site-config'

type Panel = 'menu' | 'search' | 'contact' | null

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim()
}

export function Header() {
  const [panel, setPanel] = useState<Panel>(null)
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [activeHref, setActiveHref] = useState('/')
  const returnFocus = useRef<HTMLElement | null>(null)
  const pendingSection = useRef<string | null>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const header = document.querySelector<HTMLElement>('.site-header')
        const threshold = (header?.getBoundingClientRect().height ?? 0) + Math.min(120, window.innerHeight * .18)
        const activeSection = ['actualites', 'ocean-tv', 'opportunites'].filter(id => {
          const section = document.getElementById(id)
          return section && section.getBoundingClientRect().top <= threshold
        }).at(-1)
        setActiveHref(activeSection ? `#${activeSection}` : '/')
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)')
    const closeMobileMenu = () => {
      if (desktop.matches) setPanel(current => current === 'menu' ? null : current)
    }
    desktop.addEventListener('change', closeMobileMenu)
    return () => desktop.removeEventListener('change', closeMobileMenu)
  }, [])

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
  }, [])

  const notify = (message: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = setTimeout(() => setNotice(''), 6000)
  }

  const openPanel = (next: Exclude<Panel, null>, trigger: HTMLElement) => {
    returnFocus.current = trigger
    setQuery('')
    setPanel(next)
  }

  const goToSection = (id: string) => {
    requestAnimationFrame(() => {
      const section = document.getElementById(id)
      if (!section) return
      if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`)
      setActiveHref(`#${id}`)
      section.focus({ preventScroll: true })
      section.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'instant' : 'smooth' })
    })
  }

  const navigate = (event: MouseEvent<HTMLAnchorElement>, item: NavigationItem) => {
    if (item.available && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
    // Les pages internes seront connectées au routeur à la prochaine étape.
    event.preventDefault()
    setPanel(null)
    if (item.href.startsWith('#')) {
      const id = item.href.slice(1)
      if (panel) pendingSection.current = id
      else goToSection(id)
    } else if (item.available) {
      if (window.location.hash) window.history.pushState(null, '', window.location.pathname + window.location.search)
      setActiveHref('/')
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' })
    } else {
      notify(`La rubrique « ${item.label} » sera bientôt disponible.`)
    }
  }

  const socialUnavailable = (name: SocialNetwork) => {
    setPanel(null)
    notify(`Le lien officiel ${name} sera bientôt disponible.`)
  }
  const results = navigation.filter(item => normalize(item.label).includes(normalize(query)))
  const duration = reduceMotion ? 0 : 0.24

  return (
    <>
      <a className="skip-link" href="#main-content">Aller au contenu principal</a>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="top-bar">
          <div className="header-container top-bar-inner">
            <p className="signature">INFORMER <span>•</span> FORMER <span>•</span> INSPIRER</p>
            <div className="top-bar-socials"><span className="follow-label">Restons connectés</span><SocialLinks onUnavailable={socialUnavailable} /></div>
          </div>
        </div>

        <div className="header-container main-navigation">
          <a className="brand-link" href="/" aria-label="Océan Média TV — Accueil" onClick={event => navigate(event, navigation[0])}><Brand /></a>

          <nav className="desktop-navigation" aria-label="Navigation principale">
            <ul>
              {navigation.map(item => (
                <li key={item.href}>
                  <a className={`navigation-link${item.href === activeHref ? ' is-active' : ''}`} href={item.href} aria-current={item.href === activeHref ? 'page' : undefined} onClick={event => navigate(event, item)}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            <button className="icon-button search-trigger" type="button" aria-label="Ouvrir la recherche" aria-haspopup="dialog" onClick={event => openPanel('search', event.currentTarget)}><Search size={21} strokeWidth={1.7} aria-hidden="true" /></button>
            <span className="actions-divider" aria-hidden="true" />
            <button className="contact-button" type="button" aria-haspopup="dialog" onClick={event => openPanel('contact', event.currentTarget)}>Contact <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" /></button>
            <button className="icon-button menu-trigger" type="button" aria-label="Ouvrir le menu" aria-expanded={panel === 'menu'} aria-controls={panel === 'menu' ? 'mobile-navigation' : undefined} aria-haspopup="dialog" onClick={event => openPanel('menu', event.currentTarget)}><Menu size={25} strokeWidth={1.6} aria-hidden="true" /></button>
          </div>
        </div>
      </header>

      <Dialog.Root open={panel !== null} onOpenChange={open => { if (!open) setPanel(null) }}>
        <AnimatePresence>
          {panel && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay forceMount asChild>
                <motion.div className="dialog-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }} />
              </Dialog.Overlay>
              <Dialog.Content
                forceMount
                asChild
                onCloseAutoFocus={event => {
                  event.preventDefault()
                  if (pendingSection.current) {
                    goToSection(pendingSection.current)
                    pendingSection.current = null
                  } else returnFocus.current?.focus()
                }}
                onOpenAutoFocus={event => { if (panel === 'search') { event.preventDefault(); searchInput.current?.focus() } }}
              >
                <motion.div
                  key={panel}
                  id={panel === 'menu' ? 'mobile-navigation' : undefined}
                  className={panel === 'menu' ? 'mobile-menu' : 'header-dialog'}
                  initial={panel === 'menu' ? { x: reduceMotion ? 0 : '100%', opacity: reduceMotion ? 0 : 1 } : { opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.98 }}
                  animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  exit={panel === 'menu' ? { x: reduceMotion ? 0 : '100%', opacity: reduceMotion ? 0 : 1 } : { opacity: 0, y: reduceMotion ? 0 : 8 }}
                  transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
                >
                  {panel === 'menu' ? (
                    <>
                      <div className="mobile-menu-top"><a className="brand-link" href="/" aria-label="Océan Média TV — Accueil" onClick={event => navigate(event, navigation[0])}><Brand /></a><Dialog.Close className="icon-button" aria-label="Fermer le menu"><X size={23} strokeWidth={1.6} aria-hidden="true" /></Dialog.Close></div>
                      <Dialog.Title className="sr-only">Menu principal</Dialog.Title>
                      <Dialog.Description className="sr-only">Explorez les rubriques d’Océan Média TV.</Dialog.Description>
                      <nav className="mobile-navigation" aria-label="Navigation mobile"><ul>{navigation.map((item, index) => (
                        <li key={item.href}><a href={item.href} className={`mobile-navigation-link${item.href === activeHref ? ' is-active' : ''}`} aria-current={item.href === activeHref ? 'page' : undefined} onClick={event => navigate(event, item)}><span className="mobile-nav-index">0{index + 1}</span><span>{item.label}</span>{item.href === activeHref ? <span className="active-dot" aria-hidden="true" /> : <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" />}</a></li>
                      ))}</ul></nav>
                      <div className="mobile-menu-bottom">
                        <button type="button" className="mobile-contact-button" onClick={() => setPanel('contact')}>Parlons de vos projets <ArrowUpRight size={19} aria-hidden="true" /></button>
                        <p className="mobile-tagline">L’information qui rapproche<br />les opportunités de la jeunesse.</p>
                        <div className="mobile-menu-socials"><span>Suivez Océan</span><SocialLinks onUnavailable={socialUnavailable} /></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="dialog-topline"><span className="dialog-eyebrow">OCÉAN MÉDIA TV</span><Dialog.Close className="icon-button" aria-label={panel === 'search' ? 'Fermer la recherche' : 'Fermer le contact'}><X size={21} strokeWidth={1.6} aria-hidden="true" /></Dialog.Close></div>
                      {panel === 'search' ? (
                        <>
                          <Dialog.Title className="dialog-title">Que recherchez-vous ?</Dialog.Title>
                          <Dialog.Description className="dialog-description">Explorez les rubriques de votre média.</Dialog.Description>
                          <form role="search" onSubmit={event => event.preventDefault()}>
                            <label htmlFor="site-search" className="sr-only">Rechercher une rubrique</label>
                            <div className="search-field"><Search size={20} aria-hidden="true" /><input ref={searchInput} id="site-search" type="search" placeholder="Actualités, formations, opportunités…" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" /></div>
                          </form>
                          <p className="search-results-label" role="status" aria-live="polite">{query ? `${results.length} rubrique${results.length > 1 ? 's' : ''} correspondante${results.length > 1 ? 's' : ''}` : 'NOS RUBRIQUES'}</p>
                          <ul className="search-results">{results.map(item => <li key={item.href}><a href={item.href} onClick={event => navigate(event, item)}><span>{item.label}</span>{item.available ? <ArrowRight size={16} aria-hidden="true" /> : <span className="coming-soon">À venir <ArrowUpRight size={14} aria-hidden="true" /></span>}</a></li>)}</ul>
                          {results.length === 0 && <p className="empty-search">Aucune rubrique ne correspond à « {query} ».</p>}
                          <p className="search-footnote">Les pages détaillées des articles et vidéos seront disponibles prochainement.</p>
                        </>
                      ) : (
                        <>
                          <span className="contact-symbol"><ArrowDownLeft size={28} strokeWidth={1.3} aria-hidden="true" /></span>
                          <Dialog.Title className="dialog-title">Entrons en contact.</Dialog.Title>
                          <Dialog.Description className="dialog-description">Une question, une idée ou un projet ?<br />L’équipe d’Océan Communication est à votre écoute.</Dialog.Description>
                          <div className="contact-options"><a className="contact-option" href={contact.phoneHref}><span className="contact-option-icon"><Phone size={20} strokeWidth={1.5} aria-hidden="true" /></span><span><span className="contact-option-label">Appelez-nous</span><span className="contact-option-value">{contact.phone}</span></span><ArrowUpRight size={18} aria-hidden="true" /></a><a className="contact-option" href={contact.whatsappHref} target="_blank" rel="noopener noreferrer"><span className="contact-option-icon"><MessageCircle size={20} strokeWidth={1.5} aria-hidden="true" /></span><span><span className="contact-option-label">Écrivez-nous</span><span className="contact-option-value">Discuter sur WhatsApp<span className="sr-only"> — nouvel onglet</span></span></span><ArrowUpRight size={18} aria-hidden="true" /></a></div>
                          <p className="contact-address">{contact.address}</p>
                        </>
                      )}
                    </>
                  )}
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <div className="notification-region" role="status" aria-live="polite" aria-atomic="true">
        <AnimatePresence>{notice && <motion.div key={notice} className="notification" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration }}><span className="notification-icon"><Info size={16} aria-hidden="true" /></span><span>{notice}</span><button className="icon-button" type="button" aria-label="Fermer la notification" onClick={() => setNotice('')}><X size={16} aria-hidden="true" /></button></motion.div>}</AnimatePresence>
      </div>
    </>
  )
}
