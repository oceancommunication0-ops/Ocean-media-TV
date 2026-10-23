import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, GraduationCap, Landmark, Layers3, Lightbulb, MapPin, Rocket, UsersRound, X } from 'lucide-react'
import { opportunities, opportunityCategories, type Opportunity, type OpportunityCategoryId } from '../lib/opportunities-content'
import './opportunities.css'

const categoryIcons = {
  briefcase: BriefcaseBusiness,
  graduation: GraduationCap,
  rocket: Rocket,
  landmark: Landmark,
  users: UsersRound,
  lightbulb: Lightbulb,
}

function OpportunityCard({ opportunity, onNavigate }: { opportunity: Opportunity; onNavigate: (event: MouseEvent<HTMLAnchorElement>, message: string) => void }) {
  const category = opportunityCategories.find(item => item.id === opportunity.category)!
  const Icon = categoryIcons[category.icon]
  const deadline = opportunity.deadline && !Number.isNaN(Date.parse(opportunity.deadline)) ? opportunity.deadline : null

  return (
    <article className={`opportunity-card opportunity-${category.id}`}>
      <div className="opportunity-card-top"><span className="opportunity-type-icon" aria-hidden="true"><Icon size={23} strokeWidth={1.5} /></span><span className="opportunity-format">{opportunity.format}</span></div>
      <p className="opportunity-category">{category.label}</p>
      <h4><a href={opportunity.href} className="opportunity-title-link" onClick={event => onNavigate(event, 'La page de cette annonce sera bientôt disponible.')}>{opportunity.title}</a></h4>
      <p className="opportunity-description">{opportunity.description}</p>
      <div className="opportunity-details"><span><MapPin size={13} aria-hidden="true" />{opportunity.location}</span><span className="opportunity-detail-dot" aria-hidden="true" /><span>{opportunity.mode}</span></div>
      <p className="opportunity-audience"><UsersRound size={13} aria-hidden="true" />{opportunity.audience}</p>
      {deadline && <p className="opportunity-deadline">Échéance : <time dateTime={deadline}>{new Date(deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time></p>}
      <div className="opportunity-card-bottom" aria-hidden="true"><span>Découvrir l’annonce</span><span className="opportunity-card-arrow"><ArrowUpRight size={18} strokeWidth={1.7} /></span></div>
    </article>
  )
}

export function OpportunitiesSection() {
  const [category, setCategory] = useState<OpportunityCategoryId | null>(null)
  const [notice, setNotice] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedCategory = opportunityCategories.find(item => item.id === category)
  const selection = (category ? opportunities.filter(item => item.category === category) : opportunities).slice(0, 3)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function holdFutureLink(event: MouseEvent<HTMLAnchorElement>, message: string) {
    event.preventDefault()
    if (timer.current) clearTimeout(timer.current)
    setNotice(message)
    timer.current = setTimeout(() => setNotice(''), 5000)
  }

  return (
    <section id="opportunites" className="opportunities-section" aria-labelledby="opportunities-title" tabIndex={-1}>
      <div className="opportunities-container">
        <div className="opportunities-heading">
          <div><p className="opportunities-eyebrow"><span aria-hidden="true" />LE CHAMP DES POSSIBLES</p><h2 id="opportunities-title">Opportunités<span aria-hidden="true">.</span></h2></div>
          <div className="opportunities-heading-copy"><p>Votre prochaine étape<br />{' '}<span>commence ici.</span></p><span>Des pistes pour apprendre, entreprendre<br className="opportunities-intro-break" /> et construire votre avenir.</span></div>
        </div>

        <div className="opportunities-category-heading"><h3>À chaque ambition, une voie.</h3><span>EXPLOREZ LES POSSIBILITÉS <ArrowRight size={14} aria-hidden="true" /></span></div>
        <div className="opportunities-categories" role="group" aria-label="Explorer les catégories d’opportunités">
          {opportunityCategories.map((item, index) => {
            const Icon = categoryIcons[item.icon]
            return <button key={item.id} type="button" className={`opportunities-category category-${item.id}`} aria-label={item.label} aria-pressed={category === item.id} aria-controls="opportunities-results" onClick={() => setCategory(current => current === item.id ? null : item.id)}>
              <span className="opportunities-category-top"><span className="opportunities-category-icon"><Icon size={24} strokeWidth={1.45} aria-hidden="true" /></span><span className="opportunities-category-index" aria-hidden="true">0{index + 1}</span></span>
              <span className="opportunities-category-name">{item.label}</span>
              <span className="opportunities-category-description">{item.description}</span>
              <ArrowUpRight className="opportunities-category-arrow" size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          })}
        </div>

        <div className="opportunities-selection-heading"><div><span className="opportunities-selection-marker" aria-hidden="true" /><h3>{selectedCategory ? selectedCategory.label : 'La sélection Océan'}</h3><span className="opportunities-result-count" role="status" aria-live="polite" aria-atomic="true">{selection.length} annonce{selection.length > 1 ? 's' : ''}<span className="sr-only">{selectedCategory ? ` pour la catégorie ${selectedCategory.label}` : ' dans la sélection'}</span></span></div><button type="button" className="opportunities-reset" onClick={() => setCategory(null)} aria-pressed={category === null}>Tout voir <Layers3 size={14} aria-hidden="true" /></button></div>
        <div id="opportunities-results" className="opportunities-grid">{selection.map(item => <OpportunityCard key={item.id} opportunity={item} onNavigate={holdFutureLink} />)}</div>

        <div className="opportunities-bottom"><p>Le bon point de départ<br /><strong>pour aller plus loin.</strong></p><a href="/opportunites" className="opportunities-all-link" onClick={event => holdFutureLink(event, 'La page de toutes les opportunités sera bientôt disponible.')}>Toutes les opportunités <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" /></a></div>
        <p className="opportunities-presentation-note">Ces annonces de présentation illustrent les futurs contenus de la plateforme.</p>
      </div>

      <div className={`opportunities-notice${notice ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{notice && <><span>{notice}</span><button type="button" aria-label="Fermer la notification" onClick={() => setNotice('')}><X size={17} aria-hidden="true" /></button></>}</div>
    </section>
  )
}
