import { AppLink } from './AppLink'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, GraduationCap, Landmark, Lightbulb, MapPin, Rocket, Search, SlidersHorizontal, UsersRound, X } from 'lucide-react'
import { OpportunityDetailDialog } from './EditorialDetailDialogs'
import { formatOpportunityDate, type OpportunitySummary as Opportunity } from '../lib/opportunities-content'
import { CATALOGUE_PAGE_SIZE, useCatalogueFilters, LoadState, useCollection, useSite } from '../lib/api'
import { Pagination } from './Pagination'
import './opportunities-page.css'

const categoryIcons = { briefcase: BriefcaseBusiness, graduation: GraduationCap, rocket: Rocket, landmark: Landmark, users: UsersRound, lightbulb: Lightbulb }

function OpportunityBrowseCard({ opportunity, onSelect }: { opportunity: Opportunity; onSelect: (item: Opportunity, trigger: HTMLElement) => void }) {
  const category = useSite().categories.opportunities.find(item => item.id === opportunity.category)!
  const Icon = categoryIcons[category.icon ?? 'briefcase']
  const deadline = formatOpportunityDate(opportunity.deadline)
  return <article className={`op-index-card op-index-${category.id}`}>
    <div className="op-index-card-body">
      <div className="op-index-card-top"><span className="op-index-card-icon"><Icon size={22} strokeWidth={1.45} aria-hidden="true" /></span><span>{opportunity.format}</span></div>
      <div className="op-index-card-category"><span>{category.label}</span><i aria-hidden="true" />{opportunity.organization}</div>
      <h2><button type="button" aria-haspopup="dialog" onClick={event => onSelect(opportunity, event.currentTarget)}>{opportunity.title}</button></h2>
      <p>{opportunity.description}</p>
      <div className="op-index-card-meta"><span><MapPin size={13} aria-hidden="true" />{opportunity.location}</span><span>{opportunity.mode}</span><span><UsersRound size={13} aria-hidden="true" />{opportunity.audience}</span></div>
      {deadline && <div className="op-index-card-deadline"><CalendarDays size={14} aria-hidden="true" /><span>Jusqu’au <time dateTime={opportunity.deadline}>{deadline}</time></span></div>}
      <div className="op-index-card-action"><span>Voir l’opportunité</span><span><ArrowUpRight size={17} aria-hidden="true" /></span></div>
    </div>
  </article>
}

export function OpportunitiesPage() {
  const { category, query, setCategory, setQuery, reset } = useCatalogueFilters('toutes')
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const opportunityCategories = useSite().categories.opportunities
  const data = useCollection('opportunities', { category: category === 'toutes' ? '' : category, query, limit: CATALOGUE_PAGE_SIZE, paginated: true })
  const results = data.items
  useEffect(() => {
    const previous = document.title
    document.title = 'Opportunités | Océan Média TV'
    return () => { document.title = previous }
  }, [])
  const open = (item: Opportunity, trigger: HTMLElement) => { returnFocus.current = trigger; setSelected(item) }

  return <main id="main-content" className="op-index-page" tabIndex={-1}>
    <header className="op-index-hero"><div className="op-page-shell">
      <AppLink className="op-index-home-link" href="/"><ArrowRight size={13} aria-hidden="true" /> Accueil</AppLink>
      <div className="op-index-hero-grid op-index-hero-grid-simple"><div className="op-index-hero-copy"><p className="op-index-eyebrow"><span aria-hidden="true" />LE CHAMP DES POSSIBLES</p><h1>Des opportunités pour <em>passer à l’action.</em></h1><p>Emploi, formation, financement ou accompagnement : trouvez la prochaine étape qui correspond à votre ambition.</p></div></div>
    </div></header>
    <section className="op-index-discovery" id="opportunity-catalogue" tabIndex={-1} aria-labelledby="op-index-title"><div className="op-page-shell">
      <div className="op-index-heading"><div><p>EXPLORER LE PORTAIL</p><h2 id="op-index-title">Toutes les opportunités<span>.</span></h2></div><form role="search" onSubmit={event => event.preventDefault()}><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="op-index-search">Rechercher une opportunité</label><input id="op-index-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Métier, compétence, organisme…" autoComplete="off" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Effacer la recherche"><X size={16} aria-hidden="true" /></button>}</form></div>
      <div className="op-index-category-bar"><div><SlidersHorizontal size={15} aria-hidden="true" /><span>Filtrer</span></div><div className="op-index-categories" role="group" aria-label="Filtrer les opportunités par domaine"><button type="button" aria-pressed={category === 'toutes'} onClick={() => setCategory('toutes')}>Toutes</button>{opportunityCategories.map(item => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div></div>
      <LoadState {...data} count={3} />
      {data.loading || data.error ? null : results.length > 0 ? <div className="op-index-grid op-index-grid-direct">{results.map(item => <OpportunityBrowseCard key={item.id} opportunity={item} onSelect={open} />)}</div> : <div className="op-index-empty"><span>00</span><h2>Aucune opportunité ne correspond.</h2><p>Modifiez votre recherche ou rétablissez l’ensemble du portail.</p><button type="button" onClick={reset}>Réinitialiser les filtres <ArrowRight size={16} aria-hidden="true" /></button></div>}
      <Pagination meta={data.pagination} onChange={data.setPage} target="opportunity-catalogue" />
    </div></section>
    <OpportunityDetailDialog opportunity={selected} onClose={() => setSelected(null)} returnFocus={returnFocus} />
  </main>
}
