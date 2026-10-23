import { BriefcaseBusiness, GraduationCap, Lightbulb, Mic, PenLine, UsersRound } from 'lucide-react'
import { trainingDomains } from '../lib/training-content'
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
              <img src="/images/training-workshop.webp" srcSet="/images/training-workshop-480.webp 480w, /images/training-workshop-800.webp 800w, /images/training-workshop.webp 1200w" sizes="(max-width: 575px) calc(100vw - 44px), (max-width: 899px) calc(100vw - 64px), (max-width: 1512px) 39vw, 540px" alt="Une intervenante anime une présentation devant un paperboard, face à des participants." width={1200} height={1800} loading="lazy" decoding="async" />
              <div className="training-image-caption" aria-hidden="true"><span className="training-photo-line" /><span>APPRENDRE. OSER. AVANCER.</span><p>Chaque compétence ouvre<br />une nouvelle possibilité.</p></div>
            </div>
            <figcaption>Photographie d’illustration · <a href="https://www.pexels.com/photo/woman-discussing-in-front-9487622/" target="_blank" rel="noopener noreferrer">Monstera Production / Pexels<span className="sr-only"> — nouvel onglet</span></a></figcaption>
          </figure>

          <div className="training-domains">
            <div className="training-domains-heading"><p>Nos domaines de formation</p><span>DES COMPÉTENCES POUR AVANCER</span></div>
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
          <p>Océan Communication encourage le développement des compétences personnelles et professionnelles afin d’aider les jeunes à concrétiser leurs ambitions.</p>
        </div>
      </div>
    </section>
  )
}
