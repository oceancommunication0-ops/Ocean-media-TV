import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Pencil, Plus, Tags, Trash2, X } from 'lucide-react'
import { adminRequest } from '../lib/admin-api'

export interface ManagedArticleCategory { id: string; label: string; description?: string; sortOrder: number; count: number }
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 120)

export function ArticleCategories({ open, onOpenChange, csrf, onChanged }: { open: boolean; onOpenChange: (open: boolean) => void; csrf: string; onChanged: () => void }) {
  const [items, setItems] = useState<ManagedArticleCategory[]>([])
  const [editing, setEditing] = useState<ManagedArticleCategory | 'new' | null>(null)
  const [deleting, setDeleting] = useState<ManagedArticleCategory | null>(null)
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [replacement, setReplacement] = useState('')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const load = async () => {
    setLoading(true)
    try { setItems((await adminRequest<{ items: ManagedArticleCategory[] }>('/admin/categories/articles')).items) }
    catch (exception) { setError(exception instanceof Error ? exception.message : 'Chargement impossible.') }
    finally { setLoading(false) }
  }
  useEffect(() => { if (open) { setError(''); setEditing(null); setDeleting(null); void load() } }, [open])
  const edit = (item: ManagedArticleCategory | 'new') => { setEditing(item); setDeleting(null); setLabel(item === 'new' ? '' : item.label); setDescription(item === 'new' ? '' : item.description ?? ''); setError('') }
  const save = async () => {
    if (!label.trim()) { setError('Renseignez le nom de la catégorie.'); return }
    const id = editing === 'new' ? slugify(label) : editing?.id
    if (!id) { setError('Choisissez un nom contenant au moins une lettre ou un chiffre.'); return }
    setBusy(true); setError('')
    try {
      await adminRequest('/admin/categories/articles', { method: editing === 'new' ? 'POST' : 'PUT', csrf, body: { id, label: label.trim(), description: description.trim(), sortOrder: editing === 'new' ? items.length : editing?.sortOrder ?? 0 } })
      setEditing(null); await load(); onChanged()
    } catch (exception) { setError(exception instanceof Error ? exception.message : 'Enregistrement impossible.') }
    finally { setBusy(false) }
  }
  const remove = async () => {
    if (!deleting) return
    if (deleting.count && !replacement) { setError('Choisissez la catégorie qui accueillera les articles.'); return }
    setBusy(true); setError('')
    try {
      await adminRequest(`/admin/categories/articles/${encodeURIComponent(deleting.id)}${replacement ? '?replacement=' + encodeURIComponent(replacement) : ''}`, { method: 'DELETE', csrf })
      setDeleting(null); await load(); onChanged()
    } catch (exception) { setError(exception instanceof Error ? exception.message : 'Suppression impossible.') }
    finally { setBusy(false) }
  }
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="admin-user-dialog-overlay" /><Dialog.Content className="admin-user-dialog article-categories-dialog"><div className="admin-user-dialog-top"><div><p>ORGANISATION ÉDITORIALE</p><Dialog.Title>Catégories des actualités</Dialog.Title></div><Dialog.Close aria-label="Fermer les catégories"><X size={20} /></Dialog.Close></div><Dialog.Description>Ajoutez, renommez et organisez vos rubriques. Les filtres publics utilisent ces mêmes catégories.</Dialog.Description>
    {error && <p role="alert" className="admin-editor-error">{error}</p>}
    {editing ? <div className="article-category-form"><h3>{editing === 'new' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}</h3><label className="admin-form-field"><span>Nom de la catégorie</span><input value={label} onChange={event => setLabel(event.target.value)} maxLength={160} autoFocus /></label><label className="admin-form-field"><span>Description (facultative)</span><input value={description} onChange={event => setDescription(event.target.value)} maxLength={1000} /></label><div className="admin-dialog-actions"><button type="button" onClick={() => setEditing(null)}>Annuler</button><button type="button" disabled={busy} onClick={() => void save()}>{busy ? 'Enregistrement…' : 'Enregistrer la catégorie'}</button></div></div> : deleting ? <div className="article-category-form"><h3>Supprimer « {deleting.label} » ?</h3>{deleting.count > 0 ? <><p>{deleting.count} article{deleting.count > 1 ? 's' : ''} utilise{deleting.count > 1 ? 'nt' : ''} cette catégorie. Réaffectez-les avant de la supprimer.</p><label className="admin-form-field"><span>Déplacer les articles vers</span><select value={replacement} onChange={event => setReplacement(event.target.value)}><option value="">Choisir une catégorie</option>{items.filter(item => item.id !== deleting.id).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>{items.length === 1 && <p>Créez d’abord une autre catégorie pour conserver vos articles.</p>}</> : <p>Cette catégorie n’est utilisée par aucun article.</p>}<div className="admin-dialog-actions"><button type="button" onClick={() => setDeleting(null)}>Annuler</button><button type="button" className="is-danger" disabled={busy || Boolean(deleting.count && !replacement)} onClick={() => void remove()}>{busy ? 'Suppression…' : 'Supprimer la catégorie'}</button></div></div> : <><button className="article-category-add" type="button" onClick={() => edit('new')}><Plus size={17} />Ajouter une catégorie</button>{loading ? <p role="status">Chargement des catégories…</p> : <ul className="article-category-list">{items.map(item => <li key={item.id}><Tags size={18} aria-hidden="true" /><div><strong>{item.label}</strong><small>{item.count} article{item.count > 1 ? 's' : ''}</small></div><button type="button" aria-label={`Modifier la catégorie ${item.label}`} onClick={() => edit(item)}><Pencil size={16} /></button><button type="button" aria-label={`Supprimer la catégorie ${item.label}`} onClick={() => { setDeleting(item); setReplacement(''); setError('') }}><Trash2 size={16} /></button></li>)}</ul>}</>}
  </Dialog.Content></Dialog.Portal></Dialog.Root>
}
