import { AppLink } from './AppLink'
import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, FileText, Pencil, Plus, RefreshCw, Save, Search, SlidersHorizontal, Star, Tags, Trash2, X } from 'lucide-react'
import type { ArticleSummary, NewsArticle, PaginationMeta, SiteData } from '../../shared/content'
import { adminRequest } from '../lib/admin-api'
import { AdminArticleForm, blankArticle, type ArticleDraft } from './AdminArticleForm'
import { ArticleCategories, type ManagedArticleCategory } from './ArticleCategories'
import './admin-articles.css'
import './rich-editor.css'

type PublicationFilter = 'all' | 'published' | 'draft'
interface AdminArticleItem { slug: string; summary: ArticleSummary; published: boolean; featured: boolean; sortOrder: number; updatedAt: string }
interface AdminArticleDetail { data: NewsArticle; published: boolean; featured: boolean; sortOrder: number; updatedAt: string }
const pageSize = 9
const dateLabel = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Africa/Kinshasa' }).format(new Date(value))

export function AdminArticles({ csrf, onChanged }: { csrf: string; onChanged: () => void }) {
  const [items, setItems] = useState<AdminArticleItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>()
  const [categories, setCategories] = useState<SiteData['categories']['articles']>([])
  const [query, setQuery] = useState('')
  const [settledQuery, setSettledQuery] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<PublicationFilter>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [editor, setEditor] = useState<'new' | string | null>(null)
  const [detail, setDetail] = useState<ArticleDraft | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleting, setDeleting] = useState<AdminArticleItem | null>(null)
  const [busySlug, setBusySlug] = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [categoryReload, setCategoryReload] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const closeEditor = () => { if (saving) return; if (!dirty || window.confirm('Quitter l’éditeur sans enregistrer vos modifications ?')) { setEditor(null); setDetail(null); setDirty(false) } }

  useEffect(() => { const timer = window.setTimeout(() => setSettledQuery(query.trim()), 300); return () => window.clearTimeout(timer) }, [query])
  useEffect(() => { setPage(1) }, [settledQuery, category, status])
  useEffect(() => { adminRequest<{ items: ManagedArticleCategory[] }>('/admin/categories/articles').then(result => { setCategories(result.items); if (category && !result.items.some(item => item.id === category)) setCategory('') }).catch(exception => setError(exception instanceof Error ? exception.message : 'Chargement des catégories impossible.')) }, [categoryReload])
  useEffect(() => {
    let active = true
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize), status })
    if (settledQuery) params.set('q', settledQuery)
    if (category) params.set('category', category)
    setLoading(true); setError('')
    adminRequest<{ items: AdminArticleItem[]; pagination: PaginationMeta }>(`/admin/content/articles?${params}`).then(result => {
      if (active) { setItems(result.items); setPagination(result.pagination) }
    }).catch(exception => { if (active) setError(exception instanceof Error ? exception.message : 'Chargement impossible.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, settledQuery, category, status, reload])

  useEffect(() => {
    setDirty(false)
    if (!editor) { setDetail(null); return }
    if (editor === 'new') { setDetail(blankArticle(categories[0]?.id ?? '')); return }
    let active = true; setDetail(null); setDetailLoading(true); setError('')
    adminRequest<AdminArticleDetail>(`/admin/content/articles/${editor}`).then(result => {
      if (active) setDetail({ data: result.data, published: result.published, featured: result.featured, sortOrder: result.sortOrder })
    }).catch(exception => { if (active) { setError(exception instanceof Error ? exception.message : 'Impossible d’ouvrir cet article.'); setEditor(null) } }).finally(() => { if (active) setDetailLoading(false) })
    return () => { active = false }
  }, [editor])

  const refresh = () => { setReload(value => value + 1); onChanged() }
  const togglePublication = async (item: AdminArticleItem) => {
    setBusySlug(item.slug); setError('')
    try { await adminRequest(`/admin/content/articles/${item.slug}/publication`, { method: 'PATCH', csrf, body: { published: !item.published } }); refresh() }
    catch (exception) { setError(exception instanceof Error ? exception.message : 'Modification impossible.') }
    finally { setBusySlug('') }
  }
  const remove = async () => {
    if (!deleting) return
    setBusySlug(deleting.slug); setError('')
    try { await adminRequest(`/admin/content/articles/${deleting.slug}`, { method: 'DELETE', csrf }); setDeleting(null); if (items.length === 1 && page > 1) setPage(page - 1); else refresh() }
    catch (exception) { setError(exception instanceof Error ? exception.message : 'Suppression impossible.'); setDeleting(null) }
    finally { setBusySlug('') }
  }
  const range = useMemo(() => pagination && pagination.total ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}` : '0 article', [pagination])

  return <section className="admin-articles" aria-labelledby="admin-articles-title">
    <div className="admin-articles-heading"><div><p className="admin-kicker"><span />RÉDACTION</p><h1 id="admin-articles-title">Actualités</h1><p>Écrivez, organisez et publiez vos articles depuis un espace pensé pour la rédaction.</p></div><div className="admin-articles-heading-actions"><button type="button" className="is-secondary" onClick={() => setCategoriesOpen(true)}><Tags size={17} aria-hidden="true" />Gérer les catégories</button><button type="button" onClick={() => setEditor('new')}><Plus size={17} aria-hidden="true" />Nouvel article</button></div></div>
    <div className="admin-article-toolbar"><label className="admin-article-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Rechercher un article</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un titre, un sujet…" /></label><label className="admin-article-select"><SlidersHorizontal size={16} aria-hidden="true" /><span className="sr-only">Filtrer par catégorie</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="">Toutes les catégories</option>{categories.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label><button className="admin-article-refresh" type="button" onClick={refresh} aria-label="Actualiser les articles"><RefreshCw size={17} aria-hidden="true" /></button></div>
    <div className="admin-status-filters" role="group" aria-label="Filtrer selon la publication">{([['all', 'Tous'], ['published', 'Publiés'], ['draft', 'Brouillons']] as const).map(([id, label]) => <button type="button" key={id} className={status === id ? 'is-active' : ''} aria-pressed={status === id} onClick={() => setStatus(id)}>{label}</button>)}<span>{range}</span></div>
    {error && <p className="admin-users-error" role="alert">{error}</p>}
    {loading ? <div className="admin-article-list-loading" role="status"><span className="sr-only">Chargement des articles…</span>{Array.from({ length: 4 }, (_, index) => <i key={index} />)}</div> : items.length ? <div className="admin-article-list">{items.map(item => <article key={item.slug}>
      <div className="admin-article-thumb"><img src={item.summary.image} alt="" style={{ objectPosition: item.summary.imagePosition }} /><span className={item.published ? 'is-published' : ''}>{item.published ? 'Publié' : 'Brouillon'}</span>{item.featured && <small><Star size={12} aria-hidden="true" />À la une</small>}</div>
      <div className="admin-article-copy"><div><span>{item.summary.categoryLabel ?? item.summary.category}</span>{item.summary.publishedAt && <><i aria-hidden="true" /><time dateTime={item.summary.publishedAt}>{dateLabel(item.summary.publishedAt)}</time></>}</div><h2>{item.summary.title}</h2><p>{item.summary.excerpt}</p><small>Mis à jour {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.updatedAt))}</small></div>
      <div className="admin-article-actions"><button type="button" onClick={() => void togglePublication(item)} disabled={busySlug === item.slug} className={item.published ? 'is-unpublish' : 'is-publish'}><CheckCircle2 size={15} aria-hidden="true" />{item.published ? 'Retirer' : 'Publier'}</button><button type="button" onClick={() => setEditor(item.slug)}><Pencil size={15} aria-hidden="true" />Modifier</button>{item.published && <AppLink href={item.summary.href} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} aria-hidden="true" />Voir</AppLink>}<button type="button" className="is-delete" onClick={() => setDeleting(item)} aria-label={`Supprimer ${item.summary.title}`}><Trash2 size={16} aria-hidden="true" /></button></div>
    </article>)}</div> : <div className="admin-article-empty"><FileText size={28} aria-hidden="true" /><h2>Aucun article dans cette vue.</h2><p>Modifiez les filtres ou créez une nouvelle publication.</p><button type="button" onClick={() => setEditor('new')}><Plus size={16} aria-hidden="true" />Créer un article</button></div>}
    {pagination && pagination.totalPages > 1 && <nav className="admin-article-pagination" aria-label="Pagination des articles"><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1}><ChevronLeft size={17} aria-hidden="true" />Précédent</button><span>Page {page} sur {pagination.totalPages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages}>Suivant<ChevronRight size={17} aria-hidden="true" /></button></nav>}

    <Dialog.Root open={editor !== null} onOpenChange={open => { if (!open) closeEditor() }}><Dialog.Portal><Dialog.Overlay className="admin-user-dialog-overlay" /><Dialog.Content className="admin-article-editor" aria-describedby="admin-article-editor-description"><header><div><p>{editor === 'new' ? 'NOUVELLE PUBLICATION' : 'ÉDITION DE L’ARTICLE'}</p><Dialog.Title>{editor === 'new' ? 'Créer un article' : detail?.data.title ?? 'Chargement…'}</Dialog.Title><Dialog.Description id="admin-article-editor-description">Préparez le contenu, sa présentation et son état de publication.</Dialog.Description></div><div>{detail && <button type="submit" form="admin-article-form" className="admin-editor-save" disabled={saving}><Save size={17} aria-hidden="true" />{saving ? 'Enregistrement…' : 'Enregistrer'}</button>}<button type="button" aria-label="Fermer l’éditeur" onClick={closeEditor}><X size={20} aria-hidden="true" /></button></div></header><div className="admin-editor-scroll">{detailLoading || !detail ? <div className="admin-editor-loading" role="status">Chargement de l’article…</div> : <AdminArticleForm key={editor} initial={detail} categories={categories} creating={editor === 'new'} csrf={csrf} onDirtyChange={setDirty} onBusyChange={setSaving} onSaved={() => { setDirty(false); setEditor(null); refresh() }} />}</div></Dialog.Content></Dialog.Portal></Dialog.Root>
    <Dialog.Root open={deleting !== null} onOpenChange={open => { if (!open) setDeleting(null) }}><Dialog.Portal><Dialog.Overlay className="admin-user-dialog-overlay" /><Dialog.Content className="admin-confirm-dialog"><span className="admin-danger-icon"><Trash2 size={22} aria-hidden="true" /></span><Dialog.Title>Supprimer cet article ?</Dialog.Title><Dialog.Description>« {deleting?.summary.title} » sera définitivement retiré du site et de la base de données.</Dialog.Description><div className="admin-dialog-actions"><Dialog.Close>Annuler</Dialog.Close><button type="button" className="is-danger" onClick={() => void remove()}>Supprimer définitivement</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
    <ArticleCategories open={categoriesOpen} onOpenChange={setCategoriesOpen} csrf={csrf} onChanged={() => { setCategoryReload(value => value + 1); refresh() }} />
  </section>
}
