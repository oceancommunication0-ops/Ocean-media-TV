import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, CheckCircle2, Globe2, Mail, MapPin, MessageCircle, Phone, RefreshCw, Save } from 'lucide-react'
import type { ContactSettings, ContactSettingsInput, SocialNetwork } from '../../shared/content'
import { adminRequest } from '../lib/admin-api'
import { socialNetworks } from './SocialIcon'
import './admin-contacts.css'

function toDraft(value: ContactSettings): ContactSettingsInput {
  return {
    contact: { phone: value.contact.phone, whatsappNumber: '+' + value.contact.whatsappHref.split('/').pop(), address: value.contact.address, email: value.contact.email ?? null },
    socialLinks: value.socialLinks,
  }
}

export function AdminContacts({ csrf }: { csrf: string }) {
  const [draft, setDraft] = useState<ContactSettingsInput | null>(null)
  const [saved, setSaved] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reload, setReload] = useState(0)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const dirty = Boolean(draft && JSON.stringify(draft) !== saved)

  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    adminRequest<ContactSettings>('/admin/contacts').then(value => {
      if (!active) return
      const next = toDraft(value)
      setDraft(next); setSaved(JSON.stringify(next))
    }).catch(exception => { if (active) setError(exception instanceof Error ? exception.message : 'Impossible de charger les coordonnées.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [reload])

  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', prevent)
    return () => window.removeEventListener('beforeunload', prevent)
  }, [dirty])

  const updateContact = (field: keyof ContactSettingsInput['contact'], value: string) => {
    setDraft(current => current ? { ...current, contact: { ...current.contact, [field]: field === 'email' ? value || null : value } } : current)
    setSuccess('')
  }
  const updateSocial = (name: SocialNetwork, value: string) => {
    setDraft(current => current ? { ...current, socialLinks: { ...current.socialLinks, [name]: value || null } } : current)
    setSuccess('')
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft || saving) return
    setSaving(true); setError(''); setSuccess('')
    const input = {
      contact: { ...draft.contact, phone: draft.contact.phone.trim(), whatsappNumber: draft.contact.whatsappNumber.trim(), address: draft.contact.address.trim(), email: draft.contact.email?.trim() || null },
      socialLinks: Object.fromEntries(socialNetworks.map(({ name }) => [name, draft.socialLinks[name]?.trim() || null])) as ContactSettingsInput['socialLinks'],
    }
    try {
      const value = await adminRequest<ContactSettings>('/admin/contacts', { method: 'PUT', csrf, body: input })
      const next = toDraft(value)
      setDraft(next); setSaved(JSON.stringify(next))
      setSuccess('Coordonnées et réseaux enregistrés. Ils sont désormais utilisés sur toutes les pages du site.')
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Enregistrement impossible.')
      requestAnimationFrame(() => errorRef.current?.focus())
    } finally { setSaving(false) }
  }

  return <section className="admin-contacts" aria-labelledby="admin-contacts-title">
    <div className="admin-contacts-heading"><div><p className="admin-kicker"><span />RESTONS EN CONTACT</p><h1 id="admin-contacts-title">Contacts & réseaux sociaux</h1><p>Une seule adresse de référence pour rester proches de votre communauté, partout sur le site.</p></div><button type="submit" form="admin-contacts-form" disabled={loading || saving || !draft || !dirty}><Save size={17} />{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    {error && <p className="admin-contacts-error" role="alert" tabIndex={-1} ref={errorRef}>{error}{!draft && <button type="button" onClick={() => setReload(value => value + 1)}><RefreshCw size={15} />Réessayer</button>}</p>}
    {success && <p className="admin-contacts-success" role="status"><CheckCircle2 size={18} />{success}</p>}
    {loading ? <div className="admin-contacts-skeleton" role="status" aria-busy="true"><span className="sr-only">Chargement des coordonnées…</span><i /><i /><i /></div> : draft && <form id="admin-contacts-form" onSubmit={submit}>
      <fieldset disabled={saving} className="admin-contacts-layout">
        <div className="admin-contacts-fields">
          <section className="admin-contact-panel"><div className="admin-contact-panel-heading"><span><Phone size={20} /></span><div><h2>Vos coordonnées</h2><p>Pour les appels, les messages et les rencontres.</p></div></div>
            <div className="admin-contact-grid">
              <label><span>Téléphone</span><div><Phone size={16} /><input type="tel" aria-label="Téléphone" autoComplete="tel" value={draft.contact.phone} onChange={event => updateContact('phone', event.target.value)} maxLength={50} placeholder="+243 97 248 60 33" required /></div><small>Incluez l’indicatif international. Le lien d’appel est automatique.</small></label>
              <label><span>Numéro WhatsApp</span><div><MessageCircle size={16} /><input type="tel" aria-label="Numéro WhatsApp" value={draft.contact.whatsappNumber} onChange={event => updateContact('whatsappNumber', event.target.value)} maxLength={50} placeholder="+243 97 248 60 33" required /></div><small>Utilisé par les boutons de contact et les demandes de détails.</small></label>
              <label className="is-wide"><span>Email <em>facultatif</em></span><div><Mail size={16} /><input type="email" aria-label="Email" autoComplete="email" value={draft.contact.email ?? ''} onChange={event => updateContact('email', event.target.value)} maxLength={254} placeholder="contact@votre-domaine.cd" /></div><small>L’adresse apparaît dans les espaces de contact lorsqu’elle est renseignée.</small></label>
              <label className="is-wide"><span>Adresse</span><div className="is-textarea"><MapPin size={16} /><textarea aria-label="Adresse" autoComplete="street-address" value={draft.contact.address} onChange={event => updateContact('address', event.target.value)} maxLength={2000} rows={3} required /></div></label>
            </div>
          </section>
          <section className="admin-contact-panel"><div className="admin-contact-panel-heading"><span><Globe2 size={20} /></span><div><h2>Vos réseaux sociaux</h2><p>Les comptes officiels d’Océan Média TV.</p></div></div>
            <div className="admin-contact-socials">{socialNetworks.map(({ name, icon: Icon, placeholder }) => <label key={name}><span className="admin-contact-network-icon"><Icon size={21} aria-hidden="true" /></span><span className="admin-contact-social-field"><span>{name}</span><input type="url" aria-label={name} value={draft.socialLinks[name] ?? ''} onChange={event => updateSocial(name, event.target.value)} maxLength={2000} placeholder={placeholder} pattern="https://.*" /><small>Laissez vide si le compte officiel n’est pas encore disponible.</small></span></label>)}</div>
          </section>
        </div>
        <aside className="admin-contacts-preview" aria-label="Aperçu des coordonnées"><p>VOTRE POINT DE CONTACT</p><h2>Le lien commence<br />par un échange<span>.</span></h2><span className="admin-contacts-preview-line" /><div><Phone size={18} /><span>{draft.contact.phone || 'Votre téléphone'}</span></div><div><MessageCircle size={18} /><span>{draft.contact.whatsappNumber || 'Votre WhatsApp'}</span></div>{draft.contact.email && <div><Mail size={18} /><span>{draft.contact.email}</span></div>}<div><MapPin size={18} /><span>{draft.contact.address || 'Votre adresse'}</span></div>
          <div className="admin-contact-preview-socials">{socialNetworks.map(({ name, icon: Icon }) => <span className={draft.socialLinks[name] ? 'is-configured' : ''} key={name}><Icon size={18} /><span>{name}</span>{draft.socialLinks[name] && <CheckCircle2 size={12} />}</span>)}</div>
          <p className="admin-contact-shared-note"><ArrowUpRight size={17} />Ces informations alimentent le menu, le pied de page et les boutons de contact des rubriques.</p>
        </aside>
      </fieldset>
      <div className="admin-contacts-save"><span>{dirty ? 'Modifications non enregistrées' : 'Toutes les modifications sont enregistrées'}</span><button type="submit" disabled={saving || !dirty}><Save size={17} />{saving ? 'Enregistrement…' : 'Enregistrer les coordonnées'}</button></div>
    </form>}
  </section>
}
