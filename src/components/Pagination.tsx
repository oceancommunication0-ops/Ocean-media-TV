import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { PaginationMeta } from '../../shared/content'
export function Pagination({ meta, onChange, target }: { meta?: PaginationMeta; onChange: (page: number) => void; target: string }) {
  const previous = useRef(meta?.page)
  const location = useLocation()
  const action = useNavigationType()
  useEffect(() => {
    if (!meta) return
    if (action !== 'POP' && previous.current !== undefined && previous.current !== meta.page) {
      const element = document.getElementById(target)
      element?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
      element?.focus({ preventScroll: true })
    }
    previous.current = meta.page
  }, [meta?.page, target, action])
  if (!meta || meta.totalPages < 2) return null
  const pages = [...new Set([1, meta.page - 1, meta.page, meta.page + 1, meta.totalPages])].filter(page => page >= 1 && page <= meta.totalPages)
  function link(page: number) {
    const params = new URLSearchParams(location.search)
    if (page > 1) params.set('page', String(page)); else params.delete('page')
    return location.pathname + (params.size ? '?' + params : '')
  }
  const item = (page: number, label: string, contents: React.ReactNode) => <a key={label} href={link(page)} aria-label={label} aria-current={page === meta.page ? 'page' : undefined} onClick={event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault(); onChange(page)
  }}>{contents}</a>
  return <nav className="api-pagination" aria-label="Pagination">
    {meta.page > 1 ? item(meta.page - 1, 'Page précédente', <ArrowLeft size={18} aria-hidden="true" />) : <span aria-hidden="true"><ArrowLeft size={18} /></span>}
    {pages.map((page, index) => <span className="api-pagination-item" key={page}>{index > 0 && page - pages[index - 1] > 1 && <span className="api-pagination-gap">…</span>}{item(page, 'Page ' + page, page)}</span>)}
    {meta.page < meta.totalPages ? item(meta.page + 1, 'Page suivante', <ArrowRight size={18} aria-hidden="true" />) : <span aria-hidden="true"><ArrowRight size={18} /></span>}
    <p role="status">Page {meta.page} sur {meta.totalPages}</p>
  </nav>
}

