import { AppLink } from './AppLink'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarDays, CalendarSearch, SlidersHorizontal } from 'lucide-react'
import { EventCard, FeaturedEvent } from './EventCard'
import { EventDetailDialog } from './EditorialDetailDialogs'
import { fullAgendaHref, type EventCategoryId, type MediaEvent } from '../lib/events-content'
import { LoadState, useCollection, useSite } from '../lib/api'
import './events.css'

export function EventsSection() {
  const [category, setCategory] = useState<EventCategoryId | ''>('')
  const [now, setNow] = useState(() => new Date())
  const [selected, setSelected] = useState<MediaEvent | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  useEffect(() => { const refresh = () => setNow(new Date()); const timer = window.setInterval(refresh, 60_000); document.addEventListener('visibilitychange', refresh); return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh) } }, [])
  const eventCategories = useSite().categories.events
  const data = useCollection('events', { category, limit: 3 })
  const selection = data.items
  const [featured, ...others] = selection
  const open = (event: MediaEvent, trigger: HTMLElement) => { returnFocus.current = trigger; setSelected(event) }

  return <section id="evenements" className="events-section" aria-labelledby="events-title" tabIndex={-1}>
    <div className="events-container">
      <div className="events-heading"><div><p className="events-eyebrow"><span aria-hidden="true" />ÉVÉNEMENTS & AGENDA</p><h2 id="events-title">Les rendez-vous<br className="events-title-break" /> <span>à ne pas manquer.</span></h2></div><p className="events-introduction">Découvrez les conférences, ateliers et rencontres qui favorisent le partage des connaissances et la création d’opportunités.</p></div>
      <div className="events-filter-bar events-category-bar"><div className="events-filter-label"><SlidersHorizontal size={15} aria-hidden="true" /><span>Filtrer</span></div><div className="events-category-tabs" role="group" aria-label="Filtrer les événements par catégorie"><button type="button" aria-pressed={category === ''} onClick={() => setCategory('')}>Tous</button>{eventCategories.map(item => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div></div>
      <div id="events-results" className="events-results">
        <LoadState {...data} variant="list" count={3} />
        {data.loading || data.error ? null : featured ? <div className="events-selection"><div className={`events-main-grid${others.length === 0 ? ' events-single' : ''}`}><FeaturedEvent event={featured} now={now} onSelect={open} />{others.length > 0 && <div className="events-secondary">{others.map(event => <EventCard key={event.id} event={event} now={now} variant="compact" onSelect={open} />)}</div>}</div></div> : <div className="events-empty"><span className="events-empty-icon"><CalendarSearch size={29} aria-hidden="true" /></span><h3>Aucun rendez-vous pour cette sélection.</h3><p>Explorez une autre catégorie ou revenez à tous les événements.</p><button type="button" onClick={() => setCategory('')}>Voir tous les événements <ArrowRight size={16} aria-hidden="true" /></button></div>}
      </div>
      <div className="events-bottom events-bottom-simple">{fullAgendaHref && <AppLink className="events-agenda-link" href={fullAgendaHref}><CalendarDays size={18} aria-hidden="true" /><span>Explorer tous les événements</span><ArrowRight size={17} aria-hidden="true" /></AppLink>}</div>
    </div>
    <EventDetailDialog event={selected} onClose={() => setSelected(null)} returnFocus={returnFocus} />
  </section>
}
