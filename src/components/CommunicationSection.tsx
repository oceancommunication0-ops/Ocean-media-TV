import { ArrowUpRight, BookOpen, Handshake, MoveUpRight, Radio, Sprout } from 'lucide-react'
import { confirmedPartners } from '../lib/closing-content'
import { contact } from '../lib/site-config'
import './closing.css'

const missions = [
  { title: 'Former', text: 'Développer les compétences et les capacités.', icon: BookOpen },
  { title: 'Informer', text: 'Rendre l’information et les opportunités accessibles.', icon: Radio },
  { title: 'Accompagner', text: 'Aider les jeunes à transformer leurs ambitions en projets concrets.', icon: Sprout },
]

export function CommunicationSection() {
  const collaborationHref = `${contact.whatsappHref}?text=${encodeURIComponent('Bonjour Océan Communication, je souhaite échanger avec vous au sujet d’une collaboration.')}`
  return <section id="ocean-communication" className="communication-section" aria-labelledby="communication-title" tabIndex={-1}>
    <div className="communication-main">
      <div className="closing-container">
        <div className="communication-composition">
          <div className="communication-copy">
            <p className="closing-eyebrow"><span aria-hidden="true" />UNE VISION, UN ENGAGEMENT</p>
            <h2 id="communication-title">Bien plus qu’un média,<br />{' '}<span>un engagement<br className="communication-title-break" /> pour la jeunesse.</span></h2>
            <p className="communication-introduction">Océan Média TV est une initiative d’Océan Communication, une structure engagée dans la formation, l’information et l’accompagnement des jeunes vers l’autonomie et l’entrepreneuriat.</p>
            <div className="communication-signature"><span>OCÉAN COMMUNICATION</span><p>FORMER <span>•</span> INFORMER <span>•</span> ACCOMPAGNER</p></div>
          </div>
          <figure className="communication-figure">
            <div className="communication-photo-wrap"><img src="/images/communication-team.webp" srcSet="/images/communication-team-480.webp 480w, /images/communication-team-800.webp 800w, /images/communication-team.webp 1200w" sizes="(max-width: 899px) calc(100vw - 44px), 43vw" alt="Des femmes échangent autour d’une table de réunion — photographie d’illustration." width="1200" height="800" loading="lazy" decoding="async" /><span className="communication-photo-mark" aria-hidden="true"><MoveUpRight size={28} strokeWidth={1.1} /></span></div>
            <figcaption>Faire grandir les idées. Relier les énergies.<span>Photographie d’illustration</span></figcaption>
          </figure>
        </div>
        <div className="communication-missions">{missions.map(({ title, text, icon: Icon }, index) => <div key={title} className="communication-mission"><span className="communication-mission-index" aria-hidden="true">0{index + 1}</span><div><h3><Icon size={21} strokeWidth={1.5} aria-hidden="true" />{title}</h3><p>{text}</p></div></div>)}</div>
        <div className="communication-media-line"><span>LE MÉDIA DE CET ENGAGEMENT</span><p>Océan Média TV <span aria-hidden="true">—</span> <strong>INFORMER • FORMER • INSPIRER</strong></p></div>
      </div>
    </div>
    <div id="partenaires" className="communication-partners closing-container" tabIndex={-1}>
      <div className="partners-copy"><p className="closing-eyebrow"><span aria-hidden="true" />COLLABORATIONS & PARTENARIATS</p><h3>Construisons des opportunités <em>ensemble.</em></h3><p>Nous croyons à la collaboration entre les jeunes, les entreprises, les institutions et les organisations engagées dans le développement.</p></div>
      <div className="partners-invitation"><span className="partners-symbol" aria-hidden="true"><Handshake size={32} strokeWidth={1.25} /></span><p>Une vision commune.<br /><strong>Des possibilités à construire.</strong></p><a href={collaborationHref} target="_blank" rel="noopener noreferrer">Parlons de collaboration <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" /><span className="sr-only"> sur WhatsApp — nouvel onglet</span></a></div>
      {confirmedPartners.length > 0 && <ul className="partners-list" aria-label="Partenaires confirmés">{confirmedPartners.map(partner => <li key={partner.id}>{partner.website ? <a href={partner.website} target="_blank" rel="noopener noreferrer">{partner.logo && <img src={partner.logo} alt="" loading="lazy" />}{partner.name}<span className="sr-only"> — nouvel onglet</span></a> : <span>{partner.logo && <img src={partner.logo} alt="" loading="lazy" />}{partner.name}</span>}</li>)}</ul>}
    </div>
  </section>
}
