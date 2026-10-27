import { AppLink } from './AppLink'
import { ArrowUp, ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Brand } from './Brand'
import { SocialLinks } from './SocialLinks'
import { SectionNotice, useSectionNotice } from './SectionNotice'
import { useSite } from '../lib/api'
import { standaloneHref } from '../lib/home-navigation'
import './closing.css'

export function Footer() {
  const { contact, navigation } = useSite()
  const { notice, showNotice, clearNotice } = useSectionNotice()
  return <footer className="site-footer" aria-label="Pied de page Océan Média TV">
    <div className="closing-container">
      <div className="footer-topline"><p>L’information qui rapproche<br /><span>les opportunités de la jeunesse.</span></p><AppLink href="/" className="footer-back-top" onClick={event => { if (window.location.pathname !== '/' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); document.getElementById('main-content')?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }}>Retour en haut <span><ArrowUp size={18} strokeWidth={1.5} aria-hidden="true" /></span></AppLink></div>
      <div className="footer-grid">
        <div className="footer-identity"><AppLink href="/" aria-label="Océan Média TV — Accueil" className="brand-link"><Brand /></AppLink><p>Un regard sur le monde.<br />Des perspectives pour la jeunesse congolaise.</p><span className="footer-signature">INFORMER <span>•</span> FORMER <span>•</span> INSPIRER</span><SocialLinks onUnavailable={name => showNotice(`Le lien officiel ${name} sera bientôt disponible.`)} /></div>
        <nav className="footer-nav" aria-label="Rubriques du pied de page"><h2>Explorer</h2><ul>{navigation.slice(0, 6).map(item => <li key={item.href}><AppLink href={standaloneHref(item.href)}>{item.label}</AppLink></li>)}</ul></nav>
        <nav className="footer-nav" aria-label="Pour aller plus loin"><h2>Pour aller plus loin</h2><ul><li><AppLink href="/formations">Développer ses compétences</AppLink></li><li><AppLink href="/opportunites">Trouver une opportunité</AppLink></li><li><AppLink href="/evenements">Explorer les événements</AppLink></li></ul><p className="footer-parent-note">Une initiative d’<strong>Océan Communication.</strong></p></nav>
        <div className="footer-contact"><h2>Restons en contact</h2><AppLink href={contact.phoneHref}><Phone size={15} strokeWidth={1.5} aria-hidden="true" /><span>{contact.phone}</span></AppLink><AppLink href={contact.whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" /><span>Échanger sur WhatsApp<span className="sr-only"> — nouvel onglet</span></span><ArrowUpRight size={14} aria-hidden="true" /></AppLink>{contact.email && <AppLink href={`mailto:${contact.email}`}><Mail size={16} strokeWidth={1.5} aria-hidden="true" /><span>{contact.email}</span></AppLink>}<address><MapPin size={16} strokeWidth={1.5} aria-hidden="true" /><span>{contact.address}<br />République démocratique du Congo</span></address></div>
      </div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} Océan Média TV</p><span>Informer. Former. Inspirer.</span></div>
    </div>
    <SectionNotice notice={notice} onClose={clearNotice} />
  </footer>
}
