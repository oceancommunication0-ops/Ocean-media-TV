import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/** Restore history positions after async content has enough height to contain them. */
export function RouteScroll() {
  const location = useLocation()
  const action = useNavigationType()
  const positions = useRef(new Map<string, number>())
  const previous = useRef<{ pathname: string; search: string } | null>(null)
  const first = useRef(true)
  useLayoutEffect(() => {
    const restoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => { history.scrollRestoration = restoration }
  }, [])
  useLayoutEffect(() => {
    const initial = first.current
    first.current = false
    const samePage = previous.current?.pathname === location.pathname
    const searchChange = samePage && previous.current?.search !== location.search
    previous.current = { pathname: location.pathname, search: location.search }
    let restoring = !searchChange || action === 'POP'
    const savedY = action === 'POP' ? positions.current.get(location.key) : undefined
    let focused = false
    const apply = () => {
      if (!restoring) return
      const main = document.getElementById('main-content')
      if (!main || main.matches('[aria-busy="true"], .brand-loader, .api-page-skeleton')) return
      let anchor = location.hash.slice(1)
      try { anchor = decodeURIComponent(anchor) } catch { /* Keep malformed URL fragments readable. */ }
      const target = location.hash ? document.getElementById(anchor) : main
      if (!target) return
      if (!focused && (!initial || location.hash)) {
        target.focus({ preventScroll: true })
        focused = true
      }
      if (savedY !== undefined) {
        window.scrollTo({ top: savedY, behavior: 'instant' })
        if (document.documentElement.scrollHeight - innerHeight >= savedY - 1) restoring = false
      } else if (location.hash) {
        target.scrollIntoView({ block: 'start', behavior: 'instant' })
        restoring = false
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
        restoring = false
      }
    }
    const observer = new MutationObserver(apply)
    observer.observe(document.getElementById('root')!, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'aria-busy'] })
    const frame = requestAnimationFrame(apply)
    const stopRestoration = () => { restoring = false }
    window.addEventListener('wheel', stopRestoration, { passive: true })
    window.addEventListener('touchstart', stopRestoration, { passive: true })
    const record = () => { if (!restoring) positions.current.set(location.key, window.scrollY) }
    window.addEventListener('scroll', record, { passive: true })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', record)
      window.removeEventListener('wheel', stopRestoration)
      window.removeEventListener('touchstart', stopRestoration)
    }
  }, [location.key, location.pathname, location.search, location.hash, action])
  return null
}
