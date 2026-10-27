import { AppLink } from './AppLink'
import { useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, GraduationCap, Landmark, Lightbulb, MapPin, Rocket, SlidersHorizontal, UsersRound } from 'lucide-react'
import { OpportunityDetailDialog } from './EditorialDetailDialogs'
import { formatOpportunityDate, type OpportunitySummary as Opportunity, type OpportunityCategoryId } from '../lib/opportunities-content'
import { LoadState, useCollection, useSite } from '../lib/api'
import './opportunities.css'

const categoryIcons = { briefcase: BriefcaseBusiness, graduation: GraduationCap, rocket: Rocket, landmark: Landmark, users: UsersRound, lightbulb: Lightbulb }

function OpportunityCard({ opportunity, onSelect }: { opportunity: Opportunity; onSelect: (item: Opportunity, trigger: HTMLElement) => void }) {
  const category = useSite().categories.opportunities.find(item => item.id === opportunity.category)!
  const Icon = categoryIcons[category.icon ?? 'briefcase']
  const deadline = formatOpportunityDate(opportunity.deadline)
  return <article className={`opportunity-card opportunity-${category.id}`}>
    <div className="opportunity-card-top"><span className="opportunity-type-icon" aria-hidden="true"><Icon size={23} strokeWidth={1.5} /></span><span className="opportunity-format">{opportunity.format}</span></div>
    <p className="opportunity-category">{category.label}</p>
    <h4><button type="button" className="opportunity-title-link" aria-haspopup="dialog" onClick={event => onSelect(opportunity, event.currentTarget)}>{opportunity.title}</button></h4>
    <p className="opportunity-description">{opportunity.description}</p>
    <div className="opportunity-details"><span><MapPin size={13} aria-hidden="true" />{opportunity.location}</span><span className="opportunity-detail-dot" aria-hidden="true" /><span>{opportunity.mode}</span></div>
    <p className="opportunity-audience"><UsersRound size={13} aria-hidden="true" />{opportunity.audience}</p>
    {deadline && <p className="opportunity-deadline">Échéance : <time dateTime={opportunity.deadline}>{deadline}</time></p>}
    <div className="opportunity-card-bottom" aria-hidden="true"><span>Découvrir l’annonce</span><span className="opportunity-card-arrow"><ArrowUpRight size={18} strokeWidth={1.7} /></span></div>
  </article>
}

export function OpportunitiesSection() {
  const [category, setCategory] = useState<OpportunityCategoryId | null>(null)
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const opportunityCategories = useSite().categories.opportunities
  const data = useCollection('opportunities', { category: category ?? '', limit: 3 })
  const selection = data.items
  const open = (item: Opportunity, trigger: HTMLElement) => { returnFocus.current = trigger; setSelected(item) }

  return <section id="opportunites" className="opportunities-section" aria-labelledby="opportunities-title" tabIndex={-1}>
    <div className="opportunities-container">
      <div className="opportunities-heading">
        <div><p className="opportunities-eyebrow"><span aria-hidden="true" />LE CHAMP DES POSSIBLES</p><h2 id="opportunities-title">Opportunités<span aria-hidden="true">.</span></h2></div>
        <div className="opportunities-heading-copy"><p>Votre prochaine étape<br /> <span>commence ici.</span></p><span>Des pistes pour apprendre, entreprendre<br className="opportunities-intro-break" /> et construire votre avenir.</span></div>
      </div>
      <div className="opportunities-filter-bar">
        <div className="opportunities-filter-label"><SlidersHorizontal size={15} aria-hidden="true" /><span>Filtrer</span></div>
        <div className="opportunities-filters" role="group" aria-label="Filtrer les opportunités de l’accueil"><button type="button" aria-pressed={category === null} onClick={() => setCategory(null)}>Toutes</button>{opportunityCategories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
      </div>
      <div className="opportunities-selection-heading"><div><span className="opportunities-selection-marker" aria-hidden="true" /><h3>Opportunités à découvrir</h3></div></div>
      <LoadState {...data} count={3} />
      {!data.loading && !data.error && selection.length === 0 && <p className="api-state">Aucune opportunité disponible dans cette catégorie.</p>}
      <div id="opportunities-results" className="opportunities-grid">{selection.map(item => <OpportunityCard key={item.id} opportunity={item} onSelect={open} />)}</div>
      <div className="opportunities-bottom opportunities-bottom-simple"><AppLink href="/opportunites" className="opportunities-all-link">Explorer toutes les opportunités <ArrowRight size={18} aria-hidden="true" /></AppLink></div>
    </div>
    <OpportunityDetailDialog opportunity={selected} onClose={() => setSelected(null)} returnFocus={returnFocus} />
  </section>
}
