import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Pencil, RefreshCw, Search, SlidersHorizontal, Star, Trash2 } from 'lucide-react'
import type { PaginationMeta, Resource } from '../../shared/content'
import { adminRequest } from '../lib/admin-api'
import type { ManagedCategory } from './AdminContentCategories'

export type PublicationFilter = 'all' | 'published' | 'draft'
export interface AdminListItem<T> { slug: string; summary: T; published: boolean; featured: boolean; sortOrder: number; updatedAt: string }
export interface AdminDetail<T> { data: T; published: boolean; featured: boolean; sortOrder: number }

export function useAdminCatalogue<T>({ resource, categoryReload = 0, onChanged }: { resource: Resource; categoryReload?: number; onChanged: () => void }) {
  const [items, setItems] = useState<AdminListItem<T>[]>([]); const [pagination, setPagination] = useState<PaginationMeta>(); const [categories, setCategories] = useState<ManagedCategory[]>([])
  const [query, setQuery] = useState(''); const [settledQuery, setSettledQuery] = useState(''); const [category, setCategory] = useState(''); const [status, setStatus] = useState<PublicationFilter>('all'); const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [reload, setReload] = useState(0); const [busySlug, setBusySlug] = useState('')
  useEffect(() => { const timer = window.setTimeout(() => setSettledQuery(query.trim()), 300); return () => window.clearTimeout(timer) }, [query])
  useEffect(() => setPage(1), [settledQuery, category, status])
  useEffect(() => { adminRequest<{ items: ManagedCategory[] }>(`/admin/categories/${resource}`).then(result => { setCategories(result.items); if (category && !result.items.some(item => item.id === category)) setCategory('') }).catch(exception => setError(exception instanceof Error ? exception.message : 'Chargement des catégories impossible.')) }, [resource, categoryReload])
  useEffect(() => { let active = true; const params = new URLSearchParams({ page: String(page), limit: '9', status }); if (settledQuery) params.set('q', settledQuery); if (category) params.set('category', category); setLoading(true); setError(''); adminRequest<{ items: AdminListItem<T>[]; pagination: PaginationMeta }>(`/admin/content/${resource}?${params}`).then(result => { if (active) { setItems(result.items); setPagination(result.pagination) } }).catch(exception => { if (active) setError(exception instanceof Error ? exception.message : 'Chargement impossible.') }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [resource, page, settledQuery, category, status, reload])
  const refresh = () => { setReload(value => value + 1); onChanged() }
  const range = useMemo(() => pagination?.total ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}` : '0 élément', [pagination])
  return { items, pagination, categories, query, setQuery, category, setCategory, status, setStatus, page, setPage, loading, error, setError, refresh, reload, setReload, busySlug, setBusySlug, range }
}

export function ManagerToolbar({ query, setQuery, category, setCategory, categories, status, setStatus, range, placeholder, onRefresh }: { query: string; setQuery: (value: string) => void; category: string; setCategory: (value: string) => void; categories: ManagedCategory[]; status: PublicationFilter; setStatus: (value: PublicationFilter) => void; range: string; placeholder: string; onRefresh: () => void }) {
  return <><div className="admin-article-toolbar"><label className="admin-article-search"><Search size={18} /><span className="sr-only">Rechercher</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={placeholder} /></label><label className="admin-article-select"><SlidersHorizontal size={16} /><span className="sr-only">Filtrer par catégorie</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="">Toutes les catégories</option>{categories.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label><button className="admin-article-refresh" type="button" onClick={onRefresh} aria-label="Actualiser"><RefreshCw size={17} /></button></div><div className="admin-status-filters" role="group" aria-label="Filtrer selon la publication">{([['all', 'Tous'], ['published', 'Publiés'], ['draft', 'Brouillons']] as const).map(([id, label]) => <button type="button" key={id} className={status === id ? 'is-active' : ''} aria-pressed={status === id} onClick={() => setStatus(id)}>{label}</button>)}<span>{range}</span></div></>
}

export function ManagerPagination({ meta, page, setPage, label }: { meta?: PaginationMeta; page: number; setPage: (page: number) => void; label: string }) {
  if (!meta || meta.totalPages <= 1) return null
  return <nav className="admin-article-pagination" aria-label={label}><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1}><ChevronLeft size={17} />Précédent</button><span>Page {page} sur {meta.totalPages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= meta.totalPages}>Suivant<ChevronRight size={17} /></button></nav>
}

export function ManagerActions({ published, featured, busy, onToggle, onEdit, onDelete, view }: { published: boolean; featured?: boolean; busy: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void; view?: ReactNode }) {
  return <div className="admin-article-actions"><button type="button" onClick={onToggle} disabled={busy} className={published ? 'is-unpublish' : 'is-publish'}><CheckCircle2 size={15} />{published ? 'Retirer' : 'Publier'}</button><button type="button" onClick={onEdit}><Pencil size={15} />Modifier</button>{view}<button type="button" className="is-delete" onClick={onDelete}><Trash2 size={16} /></button>{featured && <span className="admin-manager-featured"><Star size={12} />À la une</span>}</div>
}

export function LinesField({ label, name, value, hint, required = false }: { label: string; name: string; value: string[]; hint?: string; required?: boolean }) {
  return <label className="admin-article-field"><span>{label}</span><textarea name={name} defaultValue={value.join('\n')} rows={Math.max(4, Math.min(value.length + 1, 7))} required={required} placeholder="Une ligne par élément" />{hint && <small>{hint}</small>}</label>
}
export const lines = (value: FormDataEntryValue | null) => String(value ?? '').split(/\r?\n/).map(item => item.trim()).filter(Boolean)
export const slugifyAdmin = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 120)
export const today = () => new Date().toISOString().slice(0, 10)

