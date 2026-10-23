import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarDays, CalendarSearch, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { EventCard, FeaturedEvent } from './EventCard'
import { eventCategories, fullAgendaHref, mediaEvents, type EventCategoryId } from '../lib/events-content'
import { matchesPeriod, type EventPeriod } from '../lib/event-dates'
import './events.css'

const periods: { id: EventPeriod; label: string }[] = [
  { id: 'upcoming', label: 'À venir' },
  { id: 'past', label: 'Passés' },
  { id: 'all', label: 'Tous' },
]

export function EventsSection() {
  const [period, setPeriod] = useState<EventPeriod>('all')
  const [category, setCategory] = useState<EventCategoryId | ''>('')
  const [now, setNow] = useState(() => new Date())
  const allPeriodsButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const refresh = () => setNow(new Date())
    const timer = window.setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh) }
  }, [])

  const matching = mediaEvents.filter(event => (!category || event.category === category) && matchesPeriod(event.schedule, period, now))
  const selection = [...matching].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))).slice(0, 6)
  const [featured, ...others] = selection
  const selectedCategory = eventCategories.find(item => item.id === category)
  const selectedPeriod = periods.find(item => item.id === period)!

  return <section id="evenements" className="events-section" aria-labelledby="events-title" tabIndex={-1}>
    <div className="events-container">
      <div className="events-heading">
        <div><p className="events-eyebrow"><span aria-hidden="true" />ÉVÉNEMENTS & AGENDA</p><h2 id="events-title">Les rendez-vous<br className="events-title-break" />{' '}<span>à ne pas manquer.</span></h2></div>
        <p className="events-introduction">Découvrez les conférences, ateliers et rencontres qui favorisent le partage des connaissances et la création d’opportunités.</p>
      </div>

      <div className="events-filter-bar">
        <div className="events-periods" role="group" aria-label="Filtrer les événements par période">
          {periods.map(item => <button type="button" key={item.id} ref={item.id === 'all' ? allPeriodsButton : undefined} aria-pressed={period === item.id} aria-controls="events-results" onClick={() => setPeriod(item.id)}>{item.label}</button>)}
        </div>
        <div className="events-category-filter">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <label htmlFor="events-category" className="sr-only">Catégorie d’événement</label>
          <select id="events-category" value={category} aria-controls="events-results" onChange={event => setCategory(event.target.value as EventCategoryId | '')}>
            <option value="">Toutes les catégories</option>
            {eventCategories.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <ChevronDown className="events-select-chevron" size={15} aria-hidden="true" />
        </div>
      </div>

      <div className="events-selection-meta"><span>SE RENCONTRER. PARTAGER. AVANCER.</span><p role="status" aria-live="polite" aria-atomic="true">{selection.length} rendez-vous{matching.length > selection.length ? ` sur ${matching.length}` : ''}<span className="sr-only"> · {selectedPeriod.label} · {selectedCategory?.label ?? 'Toutes les catégories'}</span></p></div>

      <div id="events-results" className="events-results">
        {featured ? <div key={`${period}-${category}`} className="events-selection">
          <div className={`events-main-grid${others.length === 0 ? ' events-single' : ''}`}>
            <FeaturedEvent event={featured} now={now} />
            {others.length > 0 && <div className="events-secondary">{others.slice(0, 2).map(event => <EventCard key={event.id} event={event} now={now} variant={others.length === 1 ? 'standard' : 'compact'} />)}</div>}
          </div>
          {others.length > 2 && <div className={`events-more-grid events-more-${others.length - 2}`}>{others.slice(2, 5).map(event => <EventCard key={event.id} event={event} now={now} variant="standard" />)}</div>}
        </div> : <div className="events-empty">
          <span className="events-empty-icon"><CalendarSearch size={29} strokeWidth={1.4} aria-hidden="true" /></span>
          <h3>Aucun rendez-vous pour cette sélection.</h3>
          <p>Explorez les autres catégories ou consultez l’ensemble des événements.</p>
          <button type="button" onClick={() => { setPeriod('all'); setCategory(''); allPeriodsButton.current?.focus() }}>Voir tous les événements <ArrowRight size={16} aria-hidden="true" /></button>
        </div>}
      </div>

      <div className="events-bottom">
        <p>Des idées qui se partagent.<br /><strong>Des liens qui se créent.</strong></p>
        {fullAgendaHref ? <a className="events-agenda-link" href={fullAgendaHref}>Consulter l’agenda complet <ArrowRight size={17} aria-hidden="true" /></a> : <div className="events-agenda-placeholder"><CalendarDays size={20} strokeWidth={1.5} aria-hidden="true" /><span>Tout l’agenda, en un seul endroit.<small>Prochainement</small></span></div>}
      </div>
      <p className="events-presentation-note">Événements et dates de présentation · Photographies d’illustration.</p>
    </div>
  </section>
}
