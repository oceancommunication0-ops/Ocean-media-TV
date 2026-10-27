import type { RefObject } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowUpRight, Building2, CalendarDays, Check, Clock3, MapPin, MessageCircle, Monitor, UsersRound, X } from 'lucide-react'
import { LoadState, useApi, useSite } from '../lib/api'
import { formatOpportunityDate, type Opportunity, type OpportunitySummary } from '../lib/opportunities-content'
import { type MediaEvent } from '../lib/events-content'
import { eventDateDisplay } from '../lib/event-dates'
import './editorial-detail-dialogs.css'

function DetailShell({ open, onClose, returnFocus, eyebrow, title, description, children, whatsappHref }: {
  open: boolean
  onClose: () => void
  returnFocus: RefObject<HTMLElement | null>
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
  whatsappHref: string
}) {
  return <Dialog.Root open={open} onOpenChange={next => { if (!next) onClose() }}>
    <Dialog.Portal>
      <Dialog.Overlay className="editorial-detail-overlay" />
      <Dialog.Content className="editorial-detail-dialog" onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus() }}>
        <div className="editorial-detail-accent" aria-hidden="true"><span>OCÉAN</span><i /></div>
        <div className="editorial-detail-content">
          <Dialog.Close className="editorial-detail-close" aria-label="Fermer la fenêtre"><X size={21} aria-hidden="true" /></Dialog.Close>
          <p className="editorial-detail-eyebrow">{eyebrow}</p>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="editorial-detail-description">{description}</Dialog.Description>
          {children}
          <div className="editorial-detail-contact">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />Demander plus de détails sur WhatsApp<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> — nouvel onglet</span></a>
            <p>Notre équipe vous répond directement au sujet de cette publication.</p>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}

export function OpportunityDetailDialog({ opportunity, onClose, returnFocus }: { opportunity: OpportunitySummary | null; onClose: () => void; returnFocus: RefObject<HTMLElement | null> }) {
  const { contact, categories } = useSite()
  const detail = useApi<Opportunity>(opportunity ? '/opportunities/' + encodeURIComponent(opportunity.id) : null)
  if (!opportunity) return null
  const category = categories.opportunities.find(item => item.id === opportunity.category)!
  const deadline = formatOpportunityDate(opportunity.deadline)
  const whatsappHref = `${contact.whatsappHref}?text=${encodeURIComponent(`Bonjour Océan Communication, je souhaite recevoir plus d’informations sur l’opportunité « ${opportunity.title} » (${opportunity.reference}).`)}`
  return <DetailShell open eyebrow={`${category.label} · ${opportunity.format}`} title={opportunity.title} description={opportunity.description} onClose={onClose} returnFocus={returnFocus} whatsappHref={whatsappHref}>
    <div className="editorial-detail-meta">
      <span><Building2 size={14} aria-hidden="true" />{opportunity.organization}</span>
      <span><MapPin size={14} aria-hidden="true" />{opportunity.location} · {opportunity.mode}</span>
      <span><UsersRound size={14} aria-hidden="true" />{opportunity.audience}</span>
      {deadline && <span><CalendarDays size={14} aria-hidden="true" />Échéance : {deadline}</span>}
    </div>
    <LoadState {...detail} variant="detail" />
    {detail.data && <div className="editorial-detail-body">
      <section><h3>À propos</h3>{detail.data.overview.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>
      <section><h3>Ce que l’opportunité propose</h3><ul>{detail.data.benefits.slice(0, 3).map(item => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}</ul></section>
      <section><h3>Profil recherché</h3><ul>{detail.data.eligibility.slice(0, 3).map(item => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}</ul></section>
    </div>}
  </DetailShell>
}

export function EventDetailDialog({ event, onClose, returnFocus }: { event: MediaEvent | null; onClose: () => void; returnFocus: RefObject<HTMLElement | null> }) {
  const { contact, categories } = useSite()
  const detail = useApi<MediaEvent>(event ? '/events/' + encodeURIComponent(event.id) : null)
  if (!event) return null
  const category = categories.events.find(item => item.id === event.category)!
  const display = eventDateDisplay(event.schedule)
  const whatsappHref = `${contact.whatsappHref}?text=${encodeURIComponent(`Bonjour Océan Communication, je souhaite recevoir plus d’informations sur l’événement « ${event.title} ».`)}`
  return <DetailShell open eyebrow={category.label} title={event.title} description={event.description} onClose={onClose} returnFocus={returnFocus} whatsappHref={whatsappHref}>
    <div className="editorial-detail-meta">
      {display && <span><CalendarDays size={14} aria-hidden="true" />{display.date}</span>}
      {display?.time && <span><Clock3 size={14} aria-hidden="true" />{display.time}</span>}
      {(event.location || event.online) && <span>{event.online ? <Monitor size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}{event.online ? 'En ligne' : event.location}</span>}
      {event.organizer && <span><Building2 size={14} aria-hidden="true" />{event.organizer}</span>}
    </div>
    <LoadState {...detail} variant="detail" />
    {detail.data && <div className="editorial-detail-body editorial-event-body">
      <section><h3>Le rendez-vous</h3>{(detail.data.overview ?? [detail.data.description]).map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>
      {Boolean(detail.data.benefits?.length) && <section><h3>Pourquoi participer ?</h3><ul>{detail.data.benefits!.map(item => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}</ul></section>}
    </div>}
  </DetailShell>
}
