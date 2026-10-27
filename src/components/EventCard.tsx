import { ArrowRight, ArrowUpRight, Building2, CalendarDays, Clock3, MapPin, Monitor } from 'lucide-react'
import { type MediaEvent } from '../lib/events-content'
import { useSite } from '../lib/api'
import { eventDateDisplay, eventStatus, type EventStatus } from '../lib/event-dates'

const statusLabels: Record<EventStatus, string | null> = {
  upcoming: 'À venir', past: 'Terminé', ongoing: 'En cours',
  today: 'Aujourd’hui · horaires à préciser', scheduled: 'Dates annoncées', undetermined: null,
}

function EventStatusBadge({ event, now }: { event: MediaEvent; now: Date }) {
  const status = eventStatus(event.schedule, now)
  const label = statusLabels[status]
  return label ? <span className={`event-status event-status-${status}`}><span aria-hidden="true" />{label}</span> : null
}

function EventImage({ event, featured = false }: { event: MediaEvent; featured?: boolean }) {
  const display = eventDateDisplay(event.schedule)
  return <div className="event-image">
    <img
      src={event.image.src}
      srcSet={event.image.srcSet}
      sizes={featured ? '(max-width: 759px) calc(100vw - 44px), (max-width: 1099px) calc(100vw - 64px), 55vw' : '(max-width: 575px) calc(100vw - 44px), (max-width: 1099px) 45vw, 30vw'}
      alt={event.image.alt} width="1200" height="800" loading="lazy" decoding="async"
      style={{ objectPosition: event.image.position }}
    />
    {featured && <span className="event-feature-label">LE RENDEZ-VOUS À LA UNE</span>}
    {display && <span className="event-date-badge" aria-hidden="true"><strong>{display.day}</strong><span>{display.month}</span></span>}
  </div>
}

function EventDetails({ event }: { event: MediaEvent }) {
  const display = eventDateDisplay(event.schedule)
  return <div className="event-details">
    {display ? <p><CalendarDays size={14} aria-hidden="true" /><span><time dateTime={event.schedule!.start}>{display.date}</time></span></p> : <p><CalendarDays size={14} aria-hidden="true" /><span>Date à préciser</span></p>}
    {display?.time && <p><Clock3 size={14} aria-hidden="true" /><span>{display.time}<span className="event-timezone"> · {display.timeZone.replaceAll('_', ' ').split('/').at(-1)}</span></span></p>}
    {(event.online || event.location) && <p>{event.online ? <Monitor size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}<span>{event.online ? 'En ligne' : event.location}</span></p>}
    {event.organizer && <p><Building2 size={14} aria-hidden="true" /><span>Organisé par {event.organizer}</span></p>}
  </div>
}

function RegistrationLink({ event, now }: { event: MediaEvent; now: Date }) {
  // Only a supplied real HTTPS URL can expose a registration action.
  if (!event.registrationUrl || eventStatus(event.schedule, now) === 'past') return null
  try { if (new URL(event.registrationUrl).protocol !== 'https:') return null } catch { return null }
  return <a className="event-registration" href={event.registrationUrl} target="_blank" rel="noopener noreferrer">S’inscrire <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> à {event.title} — nouvel onglet</span></a>
}

export function FeaturedEvent({ event, now, onSelect }: { event: MediaEvent; now: Date; onSelect?: (event: MediaEvent, trigger: HTMLElement) => void }) {
  const category = useSite().categories.events.find(item => item.id === event.category)!
  return <article className="event-featured" aria-labelledby={`event-${event.id}`}>
    <EventImage event={event} featured />
    <div className="event-featured-content">
      <div className="event-card-topline"><span className="event-category">{category.label}</span><EventStatusBadge event={event} now={now} /></div>
      <h3 id={`event-${event.id}`}>{event.title}</h3>
      <p className="event-description">{event.description}</p>
      <EventDetails event={event} />
      <RegistrationLink event={event} now={now} />
      {onSelect && <button type="button" className="event-more-button" aria-haspopup="dialog" onClick={click => onSelect(event, click.currentTarget)}>En savoir plus <ArrowRight size={15} aria-hidden="true" /></button>}
    </div>
  </article>
}

export function EventCard({ event, now, variant = 'compact', onSelect }: { event: MediaEvent; now: Date; variant?: 'compact' | 'standard'; onSelect?: (event: MediaEvent, trigger: HTMLElement) => void }) {
  const category = useSite().categories.events.find(item => item.id === event.category)!
  return <article className={`event-card event-card-${variant}`} aria-labelledby={`event-${event.id}`}>
    <EventImage event={event} />
    <div className="event-card-content">
      <div className="event-card-topline"><span className="event-category">{category.label}</span><EventStatusBadge event={event} now={now} /></div>
      <h3 id={`event-${event.id}`}>{event.title}</h3>
      {variant === 'standard' && <p className="event-description">{event.description}</p>}
      <EventDetails event={event} />
      <RegistrationLink event={event} now={now} />
      {onSelect && <button type="button" className="event-more-button" aria-haspopup="dialog" onClick={click => onSelect(event, click.currentTarget)}>En savoir plus <ArrowRight size={15} aria-hidden="true" /></button>}
    </div>
  </article>
}
