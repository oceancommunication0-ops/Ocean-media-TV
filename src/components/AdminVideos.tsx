import { useEffect, useMemo, useState, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink, Film, ImagePlus, Pencil, Play, Plus, RefreshCw, Save, Search, SlidersHorizontal, Star, Tags, Trash2, UploadCloud, X } from 'lucide-react'
import type { PaginationMeta, VideoItem } from '../../shared/content'
import { adminRequest, uploadAdminImage } from '../lib/admin-api'
import { automaticContentId } from '../lib/admin-defaults'
import { formatVideoDuration } from '../lib/tv-content'
import { AdminContentCategories, type ManagedCategory } from './AdminContentCategories'
import './admin-articles.css'
import './admin-content-manager.css'

type PublicationFilter = 'all' | 'published' | 'draft'
interface AdminVideoItem { slug: string; summary: VideoItem; published: boolean; featured: boolean; sortOrder: number; updatedAt: string }
interface AdminVideoDetail { data: VideoItem; published: boolean; featured: boolean; sortOrder: number }
interface VideoDraft extends AdminVideoDetail {}
const pageSize = 9
const youtubeIdFrom = (value: string) => {
  const clean = value.trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(clean)) return clean
  try {
    const url = new URL(clean)
    const id = url.hostname === 'youtu.be' ? url.pathname.split('/').filter(Boolean)[0] : url.searchParams.get('v') ?? url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/)?.[1]
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch { return null }
}
const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
const blankVideo = (category: string): VideoDraft => ({ published: false, featured: false, sortOrder: 100, data: { id: '', youtubeId: null, category, title: '', description: '', thumbnail: '', thumbnailAlt: '', channel: 'Océan Média TV' } })

function VideoForm({ initial, categories, creating, csrf, onSaved, onClose }: { initial: VideoDraft; categories: ManagedCategory[]; creating: boolean; csrf: string; onSaved: () => void; onClose: () => void }) {
  const [title, setTitle] = useState(initial.data.title)
  const [idSuffix] = useState(() => crypto.randomUUID().slice(0, 8)); const slug = creating ? automaticContentId(title, idSuffix) : initial.data.id
  const [youtubeValue, setYoutubeValue] = useState(initial.data.youtubeId ?? '')
  const [thumbnail, setThumbnail] = useState(initial.data.thumbnail)
  const [category, setCategory] = useState(initial.data.category || categories[0]?.id || '')
  const [thumbnailTouched, setThumbnailTouched] = useState(Boolean(initial.data.thumbnail))
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  const youtubeId = youtubeIdFrom(youtubeValue)
  const change = () => setDirty(true)
  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', prevent); return () => window.removeEventListener('beforeunload', prevent)
  }, [dirty])
  const close = () => { if (!dirty || window.confirm('Quitter sans enregistrer les modifications ?')) onClose() }
  const changeYoutube = (value: string) => {
    setYoutubeValue(value); change()
    const id = youtubeIdFrom(value)
    if (id) {
      if (!thumbnailTouched) setThumbnail(youtubeThumbnail(id))
    }
  }
  const upload = async (file?: File) => {
    if (!file) return
    setUploading(true); setError('')
    try { setThumbnail(await uploadAdminImage(file, csrf)); setThumbnailTouched(true); change() }
    catch (exception) { setError(exception instanceof Error ? exception.message : 'Téléversement impossible.') }
    finally { setUploading(false) }
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (saving || uploading) return
    const form = new FormData(event.currentTarget)
    if (youtubeValue.trim() && !youtubeId) { setError('L’URL ou l’identifiant YouTube est invalide.'); return }
    const publishedAt = String(form.get('publishedAt') ?? '').trim()
    const data: VideoItem = {
      id: slug, title: title.trim(), category, description: String(form.get('description') ?? '').trim(), youtubeId,
      thumbnail: thumbnail.trim(), thumbnailAlt: ('Miniature de la vidéo « ' + title.trim() + ' »').slice(0, 500),
      ...(initial.data.channel ? { channel: initial.data.channel } : {}),
      ...(initial.data.durationSeconds ? { durationSeconds: initial.data.durationSeconds } : {}), ...(publishedAt ? { publishedAt } : {}),
      ...(initial.data.thumbnail === thumbnail && initial.data.thumbnailSrcSet ? { thumbnailSrcSet: initial.data.thumbnailSrcSet } : {}),
    }
    setSaving(true); setError('')
    try {
      await adminRequest(creating ? '/admin/content/videos' : `/admin/content/videos/${initial.data.id}`, { method: creating ? 'POST' : 'PUT', csrf, body: { data, published: form.get('publication') === 'published', featured: form.get('featured') === 'on', sortOrder: Number(form.get('sortOrder')) } })
      setDirty(false); onSaved()
    } catch (exception) { setError(exception instanceof Error ? exception.message : 'Enregistrement impossible.') }
    finally { setSaving(false) }
  }

  return <div className="admin-manager-editor"><header><div><p>{creating ? 'NOUVELLE VIDÉO' : 'ÉDITION VIDÉO'}</p><Dialog.Title>{creating ? 'Ajouter une vidéo' : title}</Dialog.Title><Dialog.Description>Préparez la diffusion, le visuel et la place de cette vidéo dans Océan TV.</Dialog.Description></div><div><button type="submit" form="admin-video-form" className="is-primary" disabled={saving || uploading}><Save size={17} />{saving ? 'Enregistrement…' : 'Enregistrer'}</button><button type="button" aria-label="Fermer l’éditeur" onClick={close}><X size={20} /></button></div></header><div className="admin-manager-editor-scroll"><form id="admin-video-form" onSubmit={submit} onChange={change}>
    {error && <p className="admin-editor-error" role="alert">{error}</p>}
    <div className="admin-manager-form-layout"><div className="admin-manager-form-main">
      <section className="admin-manager-panel"><p className="admin-manager-label">CONTENU ÉDITORIAL</p><label className="admin-manager-title-field"><span>Titre de la vidéo</span><textarea value={title} onChange={event => setTitle(event.target.value)} rows={2} maxLength={500} required placeholder="Un titre précis et engageant" /></label><label className="admin-article-field"><span>Description</span><textarea name="description" defaultValue={initial.data.description} rows={5} maxLength={20000} required placeholder="Présentez le sujet et ce que le public va découvrir…" /></label></section>
      <section className="admin-manager-panel"><div className="admin-manager-panel-heading"><Play size={19} /><div><h3>Source YouTube</h3><p>Le lecteur ne sera chargé sur le site qu’après une action du visiteur.</p></div></div><label className="admin-article-field"><span>URL ou identifiant YouTube</span><input value={youtubeValue} onChange={event => changeYoutube(event.target.value)} placeholder="https://youtu.be/…" /><small>{youtubeValue ? youtubeId ? `Identifiant détecté : ${youtubeId}` : 'Lien non reconnu' : 'Laissez vide pour préparer une vidéo à publier ultérieurement.'}</small></label>{youtubeId && <a className="admin-manager-external" href={`https://www.youtube.com/watch?v=${youtubeId}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} />Vérifier la vidéo sur YouTube</a>}</section>
      <section className="admin-manager-preview"><p className="admin-manager-label">APERÇU DE LA CARTE</p><div className="admin-video-preview-media">{thumbnail ? <img src={thumbnail} alt="Aperçu de la miniature" /> : <span><Film size={38} />Ajoutez une miniature</span>}<i><Play size={24} fill="currentColor" /></i></div><span>{categories.find(item => item.id === category)?.label ?? 'CATÉGORIE'}</span><h3>{title || 'Le titre de votre vidéo'}</h3></section>
    </div><aside className="admin-manager-settings">
      <section><div className="admin-manager-panel-heading"><CheckCircle2 size={18} /><div><h3>Publication</h3><p>Contrôlez la visibilité publique.</p></div></div><label className="admin-article-field"><span>Visibilité</span><select name="publication" defaultValue={initial.published ? 'published' : 'draft'}><option value="draft">Brouillon</option><option value="published">Publiée</option></select></label><label className="admin-check-card"><input name="featured" type="checkbox" defaultChecked={initial.featured} /><span><strong>Vidéo principale</strong><small>La placer en tête de la sélection Océan TV.</small></span></label><label className="admin-article-field"><span>Priorité d’affichage</span><input name="sortOrder" type="number" min="0" max="1000000" defaultValue={initial.sortOrder} required /><small>Le nombre le plus petit apparaît en premier.</small></label></section>
      <section><div className="admin-manager-panel-heading"><SlidersHorizontal size={18} /><div><h3>Classement</h3><p>Informations de catalogue.</p></div></div><label className="admin-article-field"><span>Catégorie</span><select name="category" value={category} onChange={event => setCategory(event.target.value)} required><option value="" disabled>Choisir une catégorie</option>{categories.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label><label className="admin-article-field"><span>Date de diffusion d’origine</span><input name="publishedAt" type="date" defaultValue={initial.data.publishedAt} /><small>Facultative. Elle sert uniquement si la date est connue.</small></label></section>
      <section><div className="admin-manager-panel-heading"><ImagePlus size={18} /><div><h3>Miniature 16:9</h3><p>Une image nette, lisible et sans texte coupé.</p></div></div>{thumbnail && <img className="admin-manager-image-preview is-video" src={thumbnail} alt="Aperçu de la miniature" />}<label className="article-cover-upload"><UploadCloud size={17} /><span>{uploading ? 'Téléversement…' : 'Importer une image'}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={event => void upload(event.target.files?.[0])} /></label>{youtubeId && <button className="admin-manager-use-youtube" type="button" onClick={() => { setThumbnail(youtubeThumbnail(youtubeId)); setThumbnailTouched(false); change() }}>Utiliser la miniature YouTube</button>}<label className="admin-article-field"><span>Source de l’image</span><input value={thumbnail} onChange={event => { setThumbnail(event.target.value); setThumbnailTouched(true) }} required placeholder="/images/… ou https://…" /></label></section>
    </aside></div><div className="admin-manager-mobile-save"><button type="submit" disabled={saving || uploading}><Save size={17} />{saving ? 'Enregistrement…' : 'Enregistrer la vidéo'}</button></div>
  </form></div></div>
}

export function AdminVideos({ csrf, onChanged }: { csrf: string; onChanged: () => void }) {
  const [items, setItems] = useState<AdminVideoItem[]>([]); const [pagination, setPagination] = useState<PaginationMeta>()
  const [categories, setCategories] = useState<ManagedCategory[]>([]); const [query, setQuery] = useState(''); const [settledQuery, setSettledQuery] = useState('')
  const [category, setCategory] = useState(''); const [status, setStatus] = useState<PublicationFilter>('all'); const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [reload, setReload] = useState(0)
  const [editor, setEditor] = useState<'new' | string | null>(null); const [detail, setDetail] = useState<VideoDraft | null>(null); const [detailLoading, setDetailLoading] = useState(false)
  const [deleting, setDeleting] = useState<AdminVideoItem | null>(null); const [busySlug, setBusySlug] = useState(''); const [categoriesOpen, setCategoriesOpen] = useState(false); const [categoryReload, setCategoryReload] = useState(0)
  useEffect(() => { const timer = window.setTimeout(() => setSettledQuery(query.trim()), 300); return () => window.clearTimeout(timer) }, [query])
  useEffect(() => { setPage(1) }, [settledQuery, category, status])
  useEffect(() => { adminRequest<{ items: ManagedCategory[] }>('/admin/categories/videos').then(result => { setCategories(result.items); if (category && !result.items.some(item => item.id === category)) setCategory('') }).catch(exception => setError(exception instanceof Error ? exception.message : 'Chargement des catégories impossible.')) }, [categoryReload])
  useEffect(() => { let active = true; const params = new URLSearchParams({ page: String(page), limit: String(pageSize), status }); if (settledQuery) params.set('q', settledQuery); if (category) params.set('category', category); setLoading(true); setError(''); adminRequest<{ items: AdminVideoItem[]; pagination: PaginationMeta }>(`/admin/content/videos?${params}`).then(result => { if (active) { setItems(result.items); setPagination(result.pagination) } }).catch(exception => { if (active) setError(exception instanceof Error ? exception.message : 'Chargement impossible.') }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [page, settledQuery, category, status, reload])
  useEffect(() => { if (!editor) { setDetail(null); return } if (editor === 'new') { setDetail(blankVideo(categories[0]?.id ?? '')); return } let active = true; setDetailLoading(true); setDetail(null); adminRequest<AdminVideoDetail>(`/admin/content/videos/${editor}`).then(result => { if (active) setDetail(result) }).catch(exception => { if (active) { setError(exception instanceof Error ? exception.message : 'Impossible d’ouvrir cette vidéo.'); setEditor(null) } }).finally(() => { if (active) setDetailLoading(false) }); return () => { active = false } }, [editor])
  const refresh = () => { setReload(value => value + 1); onChanged() }
  const toggle = async (item: AdminVideoItem) => { setBusySlug(item.slug); setError(''); try { await adminRequest(`/admin/content/videos/${item.slug}/publication`, { method: 'PATCH', csrf, body: { published: !item.published } }); refresh() } catch (exception) { setError(exception instanceof Error ? exception.message : 'Modification impossible.') } finally { setBusySlug('') } }
  const remove = async () => { if (!deleting) return; setBusySlug(deleting.slug); try { await adminRequest(`/admin/content/videos/${deleting.slug}`, { method: 'DELETE', csrf }); setDeleting(null); if (items.length === 1 && page > 1) setPage(page - 1); else refresh() } catch (exception) { setError(exception instanceof Error ? exception.message : 'Suppression impossible.'); setDeleting(null) } finally { setBusySlug('') } }
  const range = useMemo(() => pagination?.total ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}` : '0 vidéo', [pagination])
  const categoryName = (video: VideoItem) => video.categoryLabel ?? categories.find(item => item.id === video.category)?.label ?? video.category
  return <section className="admin-articles admin-manager" aria-labelledby="admin-videos-title"><div className="admin-articles-heading"><div><p className="admin-kicker"><span />AUDIOVISUEL</p><h1 id="admin-videos-title">Océan TV</h1><p>Gérez toute la vidéothèque, les références YouTube et la sélection visible sur le site.</p></div><div className="admin-articles-heading-actions"><button type="button" className="is-secondary" onClick={() => setCategoriesOpen(true)}><Tags size={17} />Gérer les catégories</button><button type="button" onClick={() => setEditor('new')}><Plus size={17} />Ajouter une vidéo</button></div></div>
    <div className="admin-article-toolbar"><label className="admin-article-search"><Search size={18} /><span className="sr-only">Rechercher une vidéo</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un titre, une chaîne…" /></label><label className="admin-article-select"><SlidersHorizontal size={16} /><span className="sr-only">Filtrer par catégorie</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="">Toutes les catégories</option>{categories.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label><button className="admin-article-refresh" type="button" onClick={refresh} aria-label="Actualiser les vidéos"><RefreshCw size={17} /></button></div>
    <div className="admin-status-filters" role="group" aria-label="Filtrer selon la publication">{([['all', 'Toutes'], ['published', 'Publiées'], ['draft', 'Brouillons']] as const).map(([id, label]) => <button type="button" key={id} className={status === id ? 'is-active' : ''} aria-pressed={status === id} onClick={() => setStatus(id)}>{label}</button>)}<span>{range}</span></div>
    {error && <p className="admin-users-error" role="alert">{error}</p>}{loading ? <div className="admin-article-list-loading" role="status"><span className="sr-only">Chargement des vidéos…</span>{Array.from({ length: 4 }, (_, index) => <i key={index} />)}</div> : items.length ? <div className="admin-video-list">{items.map(item => <article key={item.slug}><div className="admin-video-thumb"><img src={item.summary.thumbnail} alt="" /><span className={item.published ? 'is-published' : ''}>{item.published ? 'Publiée' : 'Brouillon'}</span><i><Play size={17} fill="currentColor" /></i>{item.summary.durationSeconds && <small><Clock3 size={12} />{formatVideoDuration(item.summary.durationSeconds)}</small>}</div><div className="admin-video-copy"><div><span>{categoryName(item.summary)}</span>{item.featured && <><b /> <span><Star size={11} />Principale</span></>}</div><h2>{item.summary.title}</h2><p>{item.summary.description}</p><small>{item.summary.channel ?? 'Sans chaîne renseignée'} · Mis à jour {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.updatedAt))}</small></div><div className="admin-article-actions"><button type="button" onClick={() => void toggle(item)} disabled={busySlug === item.slug} className={item.published ? 'is-unpublish' : 'is-publish'}><CheckCircle2 size={15} />{item.published ? 'Retirer' : 'Publier'}</button><button type="button" onClick={() => setEditor(item.slug)}><Pencil size={15} />Modifier</button>{item.summary.youtubeId && <a href={`https://www.youtube.com/watch?v=${item.summary.youtubeId}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} />YouTube</a>}<button type="button" className="is-delete" onClick={() => setDeleting(item)} aria-label={`Supprimer ${item.summary.title}`}><Trash2 size={16} /></button></div></article>)}</div> : <div className="admin-article-empty"><Film size={30} /><h2>Aucune vidéo dans cette vue.</h2><p>Modifiez les filtres ou ajoutez un nouveau contenu audiovisuel.</p><button type="button" onClick={() => setEditor('new')}><Plus size={16} />Ajouter une vidéo</button></div>}
    {pagination && pagination.totalPages > 1 && <nav className="admin-article-pagination" aria-label="Pagination des vidéos"><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1}><ChevronLeft size={17} />Précédent</button><span>Page {page} sur {pagination.totalPages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages}>Suivant<ChevronRight size={17} /></button></nav>}
    <Dialog.Root open={editor !== null} onOpenChange={open => { if (!open) setEditor(null) }}><Dialog.Portal><Dialog.Overlay className="admin-user-dialog-overlay" />{detailLoading || !detail ? <Dialog.Content className="admin-manager-editor"><Dialog.Title className="sr-only">Chargement</Dialog.Title><div className="admin-editor-loading">Chargement de la vidéo…</div></Dialog.Content> : <Dialog.Content><VideoForm key={editor} initial={detail} categories={categories} creating={editor === 'new'} csrf={csrf} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); refresh() }} /></Dialog.Content>}</Dialog.Portal></Dialog.Root>
    <Dialog.Root open={deleting !== null} onOpenChange={open => { if (!open) setDeleting(null) }}><Dialog.Portal><Dialog.Overlay className="admin-user-dialog-overlay" /><Dialog.Content className="admin-confirm-dialog"><span className="admin-danger-icon"><Trash2 size={22} /></span><Dialog.Title>Supprimer cette vidéo ?</Dialog.Title><Dialog.Description>« {deleting?.summary.title} » sera définitivement retirée du site et de la base de données.</Dialog.Description><div className="admin-dialog-actions"><Dialog.Close>Annuler</Dialog.Close><button type="button" className="is-danger" onClick={() => void remove()}>Supprimer définitivement</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
    <AdminContentCategories open={categoriesOpen} onOpenChange={setCategoriesOpen} csrf={csrf} resource="videos" title="Catégories d’Océan TV" description="Ces catégories alimentent directement les filtres de l’accueil et de la vidéothèque." itemName="vidéo" onChanged={() => { setCategoryReload(value => value + 1); refresh() }} />
  </section>
}
