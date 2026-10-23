import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowRight, ArrowUp, ArrowUpRight, MapPin, MessageCircle, Phone, X } from 'lucide-react'
import { Brand } from './Brand'
import { SocialLinks } from './SocialLinks'
import { SectionNotice, useSectionNotice } from './SectionNotice'
import { contact, navigation } from '../lib/site-config'
import { navigateHome } from '../lib/home-navigation'
import './closing.css'

const credits = [
  { name: 'Kindel Media', id: '7688363' }, { name: 'Andres Ayrton', id: '6578395' },
  { name: 'Evans Cudjoe', id: '6977922' }, { name: 'PICHA Stock', id: '3869649' },
  { name: 'Monstera Production', id: '9487622' }, { name: 'Mikhail Nilov', id: '8872459' },
  { name: 'RDNE Stock project', id: '7648052' }, { name: 'Pavel Danilyuk', id: '8761650' },
  { name: 'Christina Morillo', id: '1181427' }, { name: 'Wiseboy Wissebo', id: '38111334' },
  { name: 'Werner Pfennig', id: '6949931' },
]

export function Footer() {
  const [informationOpen, setInformationOpen] = useState(false)
  const { notice, showNotice, clearNotice } = useSectionNotice()
  return <Dialog.Root open={informationOpen} onOpenChange={setInformationOpen}><footer className="site-footer" aria-label="Pied de page Océan Média TV">
    <div className="closing-container">
      <div className="footer-topline"><p>L’information qui rapproche<br /><span>les opportunités de la jeunesse.</span></p><a href="/" className="footer-back-top" onClick={event => navigateHome(event, '/')}>Retour en haut <span><ArrowUp size={18} strokeWidth={1.5} aria-hidden="true" /></span></a></div>
      <div className="footer-grid">
        <div className="footer-identity"><a href="/" aria-label="Océan Média TV — Accueil" className="brand-link" onClick={event => navigateHome(event, '/')}><Brand /></a><p>Un regard sur le monde.<br />Des perspectives pour la jeunesse congolaise.</p><span className="footer-signature">INFORMER <span>•</span> FORMER <span>•</span> INSPIRER</span><SocialLinks onUnavailable={name => showNotice(`Le lien officiel ${name} sera bientôt disponible.`)} /></div>
        <nav className="footer-nav" aria-label="Rubriques du pied de page"><h2>Explorer</h2><ul>{navigation.slice(0, 6).map(item => <li key={item.href}><a href={item.href} onClick={event => navigateHome(event, item.href)}>{item.label}</a></li>)}<li><a href="#portraits" onClick={event => navigateHome(event, '#portraits')}>Initiatives & portraits</a></li></ul></nav>
        <nav className="footer-nav" aria-label="Pour aller plus loin"><h2>Pour aller plus loin</h2><ul><li><a href="#formations" onClick={event => navigateHome(event, '#formations')}>Développer ses compétences</a></li><li><a href="#opportunites" onClick={event => navigateHome(event, '#opportunites')}>Trouver une opportunité</a></li><li><a href="#portraits" onClick={event => navigateHome(event, '#portraits')}>Découvrir les portraits</a></li></ul><p className="footer-parent-note">Une initiative d’<strong>Océan Communication.</strong></p></nav>
        <div className="footer-contact"><h2>Restons en contact</h2><a href={contact.phoneHref}><Phone size={15} strokeWidth={1.5} aria-hidden="true" /><span>{contact.phone}</span></a><a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" /><span>Échanger sur WhatsApp<span className="sr-only"> — nouvel onglet</span></span><ArrowUpRight size={14} aria-hidden="true" /></a><address><MapPin size={16} strokeWidth={1.5} aria-hidden="true" /><span>{contact.address}<br />République démocratique du Congo</span></address></div>
      </div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} Océan Média TV</p><span>Informer. Former. Inspirer.</span><Dialog.Trigger asChild><button type="button">Informations & crédits <ArrowRight size={13} aria-hidden="true" /></button></Dialog.Trigger></div>
    </div>
    <SectionNotice notice={notice} onClose={clearNotice} />
      <Dialog.Portal><Dialog.Overlay className="dialog-overlay footer-info-overlay" /><Dialog.Content className="footer-info-dialog">
        <div className="footer-info-top"><span>OCÉAN MÉDIA TV</span><Dialog.Close className="icon-button" aria-label="Fermer les informations"><X size={22} aria-hidden="true" /></Dialog.Close></div>
        <Dialog.Title>Informations & crédits</Dialog.Title><Dialog.Description>Le média, ses contenus et les images de cette page.</Dialog.Description>
        <h3>Une initiative d’Océan Communication</h3><p>Océan Média TV rapproche l’information, les compétences et les opportunités de la jeunesse congolaise. Pour nous contacter : <a href={contact.phoneHref}>{contact.phone}</a>.</p>
        <h3>Contenus et photographies</h3><p>Certains articles, portraits, annonces et événements sont des contenus de présentation. Les photographies d’illustration ne désignent pas des membres de l’équipe, des partenaires ou des participants confirmés aux activités d’Océan.</p><p>Les images de la Hero et de certains articles ont été générées pour le projet. Les photographies de stock sont issues de <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">Pexels<span className="sr-only"> — nouvel onglet</span></a>, avec les crédits suivants :</p>
        <ul className="footer-photo-credits">{credits.map(credit => <li key={credit.id}><a href={`https://www.pexels.com/photo/${credit.id}/`} target="_blank" rel="noopener noreferrer">{credit.name}<ArrowUpRight size={12} aria-hidden="true" /><span className="sr-only"> — photographie sur Pexels, nouvel onglet</span></a></li>)}</ul>
        <h3>Vidéos et services externes</h3><p>Le lecteur YouTube est chargé uniquement lorsque vous choisissez une vidéo. Les liens YouTube, WhatsApp et Pexels ouvrent des services externes, dont les règles de confidentialité s’appliquent lors de votre visite.</p>
      </Dialog.Content></Dialog.Portal>
  </footer></Dialog.Root>
}
