import { AppLink } from './AppLink'
import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Building2, CalendarDays, Clock3, MapPin, MessageCircle, Monitor, Search, SlidersHorizontal, X } from 'lucide-react'
import { EventCard } from './EventCard'
import { EventDetailDialog } from './EditorialDetailDialogs'
import { CATALOGUE_PAGE_SIZE, useCatalogueFilters, LoadState, useCollection, useSite } from '../lib/api'
import { Pagination } from './Pagination'
import { type MediaEvent } from '../lib/events-content'
import { eventDateDisplay, eventStatus } from '../lib/event-dates'
import './events.css'
import './events-page.css'


const statusLabels = {
  upcoming: 'À venir', past: 'Terminé', ongoing: 'En cours',
  today: 'Aujourd’hui', scheduled: 'Dates annoncées', undetermined: 'Date à préciser',
} as const

function Spotlight({ event, now }: { event: MediaEvent; now: Date }) {
  const category = useSite().categories.events.find(item => item.id === event.category)!
  const display = eventDateDisplay(event.schedule)
  const status = eventStatus(event.schedule, now)

  return <article className="agenda-spotlight" aria-labelledby={`agenda-spotlight-${event.id}`}>
    <img src={event.image.src} srcSet={event.image.srcSet} sizes="100vw" alt={event.image.alt} width="1200" height="800" decoding="async" style={{ objectPosition: event.image.position }} />
    <div className="agenda-spotlight-shade" aria-hidden="true" />
    <div className="agenda-spotlight-copy">
      <div className="agenda-spotlight-topline"><span>PROCHAIN TEMPS FORT</span><span>{statusLabels[status]}</span></div>
      <p className="agenda-spotlight-category">{category.label}</p>
      <h2 id={`agenda-spotlight-${event.id}`}>{event.title}</h2>
      <p>{event.description}</p>
      <div className="agenda-spotlight-meta">
        {display && <span><CalendarDays size={15} aria-hidden="true" /><time dateTime={event.schedule!.start}>{display.date}</time></span>}
        {display?.time && <span><Clock3 size={15} aria-hidden="true" />{display.time}</span>}
        {(event.online || event.location) && <span>{event.online ? <Monitor size={15} aria-hidden="true" /> : <MapPin size={15} aria-hidden="true" />}{event.online ? 'En ligne' : event.location}</span>}
        {event.organizer && <span><Building2 size={15} aria-hidden="true" />{event.organizer}</span>}
      </div>
      <AppLink href="#agenda-complet">Voir tout l’agenda <ArrowDown size={16} aria-hidden="true" /></AppLink>
    </div>
  </article>
}

export function EventsPage() {
  const { category, query, setCategory, setQuery, reset: resetFilters } = useCatalogueFilters('all')
  const [now, setNow] = useState(() => new Date())
  const [selected, setSelected] = useState<MediaEvent | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Événements & Agenda | Océan Média TV'
    const refresh = () => setNow(new Date())
    const timer = window.setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      document.title = previousTitle
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const { contact, categories } = useSite()
  const eventCategories = categories.events
  const data = useCollection('events', { category: category === 'all' ? '' : category, query, limit: CATALOGUE_PAGE_SIZE, paginated: true })
  const results = data.items
  const spotlight = results[0]

  const openEvent = (event: MediaEvent, trigger: HTMLElement) => { returnFocus.current = trigger; setSelected(event) }

  const whatsappHref = `${contact.whatsappHref}?text=${encodeURIComponent('Bonjour Océan Communication, je souhaite échanger au sujet d’un événement ou d’une collaboration.')}`

  return <main id="main-content" className="agenda-page" tabIndex={-1}>
    <header className="agenda-page-hero">
      <div className="agenda-page-shell">
        <AppLink className="agenda-home-link" href="/#evenements">Accueil <ArrowRight size={13} aria-hidden="true" /> Événements</AppLink>
        <div className="agenda-page-heading">
          <div>
            <p><span aria-hidden="true" />ÉVÉNEMENTS & AGENDA</p>
            <h1>Des rencontres qui font <em>circuler les idées.</em></h1>
          </div>
          <p>Conférences, ateliers et échanges professionnels : retrouvez les rendez-vous qui rapprochent les talents, les savoirs et les opportunités.</p>
        </div>
        {spotlight && <Spotlight event={spotlight} now={now} />}
      </div>
    </header>

    <section id="agenda-complet" tabIndex={-1} className="agenda-directory" aria-labelledby="agenda-directory-title">
      <div className="agenda-page-shell">
        <div className="agenda-directory-heading">
          <div><p>L’AGENDA OCÉAN</p><h2 id="agenda-directory-title">Tous les rendez-vous<span>.</span></h2></div>
          <form role="search" onSubmit={event => event.preventDefault()}>
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="agenda-search">Rechercher un événement</label>
            <input id="agenda-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Titre, thème, lieu…" autoComplete="off" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Effacer la recherche"><X size={16} aria-hidden="true" /></button>}
          </form>
        </div>

        <div className="agenda-filter-panel agenda-category-panel">
          <div className="agenda-filter-label"><SlidersHorizontal size={15} aria-hidden="true" /><span>Filtrer</span></div>
          <div className="agenda-category-tabs" role="group" aria-label="Filtrer les événements par catégorie"><button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>Tous</button>{eventCategories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
        </div>

        <LoadState {...data} count={3} />
        {data.loading || data.error ? null : results.length > 0
          ? <div className="agenda-event-grid agenda-event-grid-direct">{results.map(event => <EventCard key={event.id} event={event} now={now} variant="standard" onSelect={openEvent} />)}</div>
          : <div className="agenda-empty"><span aria-hidden="true">00</span><h2>Aucun rendez-vous ne correspond.</h2><p>Essayez une catégorie différente ou une recherche plus large.</p><button type="button" onClick={resetFilters}>Voir tout l’agenda <ArrowRight size={16} aria-hidden="true" /></button></div>}
        <Pagination meta={data.pagination} onChange={data.setPage} target="agenda-complet" />
      </div>
    </section>

    <aside className="agenda-collaboration" aria-label="Proposer un événement ou une collaboration">
      <div className="agenda-page-shell">
        <div><span>CRÉONS DES RENCONTRES UTILES</span><h2>Vous portez une initiative qui mérite d’être partagée ?</h2></div>
        <div><p>Océan Communication collabore avec les institutions, entreprises et organisations qui agissent pour la jeunesse.</p><AppLink href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />Nous contacter sur WhatsApp<ArrowRight size={17} aria-hidden="true" /><span className="sr-only"> — nouvel onglet</span></AppLink></div>
      </div>
    </aside>
    <EventDetailDialog event={selected} onClose={() => setSelected(null)} returnFocus={returnFocus} />
  </main>
}
