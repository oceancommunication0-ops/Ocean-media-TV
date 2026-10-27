import { AppLink } from './AppLink'
import { ArrowUpRight, BriefcaseBusiness, GraduationCap, Lightbulb, Mic, PenLine, UsersRound } from 'lucide-react'
import { LoadState, useCollection, useSite } from '../lib/api'
import './training.css'

const domainIcons = {
  microphone: Mic,
  users: UsersRound,
  briefcase: BriefcaseBusiness,
  pen: PenLine,
  lightbulb: Lightbulb,
  graduation: GraduationCap,
}

export function TrainingSection() {
  const data = useCollection('trainings', { limit: 6 })
  const trainingDomains = data.items
  const { trainingImage } = useSite()
  return (
    <section id="formations" className="training-section" aria-labelledby="training-title" tabIndex={-1}>
      <div className="training-container">
        <div className="training-heading">
          <div>
            <p className="training-eyebrow"><span aria-hidden="true" />FORMATIONS <span className="training-eyebrow-divider" aria-hidden="true" />OCÉAN COMMUNICATION</p>
            <h2 id="training-title">Développez les compétences <span>qui font la différence.</span></h2>
          </div>
          <p className="training-introduction">Des connaissances et des compétences pour transformer vos ambitions en actions concrètes.</p>
        </div>

        <div className="training-composition">
          <figure className="training-figure">
            <div className="training-image-wrap">
              <img src={trainingImage.src} srcSet={trainingImage.srcSet} sizes="(max-width: 575px) calc(100vw - 44px), (max-width: 899px) calc(100vw - 64px), (max-width: 1512px) 39vw, 540px" alt={trainingImage.alt} width={1080} height={720} loading="lazy" decoding="async" />
              <div className="training-image-caption" aria-hidden="true"><span className="training-photo-line" /><span>{trainingImage.homeEyebrow}</span><p>{trainingImage.homeCaption}</p></div>
            </div>
          </figure>

          <div className="training-domains">
            <div className="training-domains-heading"><p>Nos domaines de formation</p><span>DES COMPÉTENCES POUR AVANCER</span></div>
            <LoadState {...data} count={3} />
            {!data.loading && !data.error && trainingDomains.length === 0 && <p className="api-state">Les domaines de formation seront bientôt disponibles.</p>}
            <div className="training-domain-grid">
              {trainingDomains.map(domain => {
                const Icon = domainIcons[domain.icon]
                return <article key={domain.id} className={`training-domain domain-${domain.id}`}>
                  <span className="training-domain-icon" aria-hidden="true"><Icon size={24} strokeWidth={1.45} /></span>
                  <div><h3>{domain.title}</h3><p>{domain.description}</p></div>
                </article>
              })}
            </div>
          </div>
        </div>

        <div className="training-editorial-note">
          <h3><span aria-hidden="true" />Apprendre pour<br />{' '}<em>mieux entreprendre.</em></h3>
          <div className="training-editorial-copy">
            <p>Océan Communication encourage le développement des compétences personnelles et professionnelles afin d’aider les jeunes à concrétiser leurs ambitions.</p>
            <AppLink className="training-explore-link" href="/formations">
              <span>Explorer toutes les formations</span>
              <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </AppLink>
          </div>
        </div>
      </div>
    </section>
  )
}
