import type { MouseEvent } from 'react'

export function navigateHome(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  const target = document.getElementById(href === '/' ? 'main-content' : href.slice(1))
  if (!target) return
  event.preventDefault()
  const next = href === '/' ? window.location.pathname + window.location.search : href
  window.history.pushState(null, '', next)
  target.focus({ preventScroll: true })
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  if (href === '/') window.scrollTo({ top: 0, behavior })
  else target.scrollIntoView({ behavior, block: 'start' })
}
