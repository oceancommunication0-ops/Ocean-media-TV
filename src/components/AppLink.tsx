import type { AnchorHTMLAttributes } from 'react'
import { Link, useLocation } from 'react-router-dom'

/** Keep external links and downloads native; route internal destinations through React. */
export function AppLink({ href = '/', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const location = useLocation()
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href) || props.download !== undefined) return <a href={href} {...props} />
  return <Link to={href.startsWith('#') ? { pathname: location.pathname, search: location.search, hash: href } : href} {...props} />
}
