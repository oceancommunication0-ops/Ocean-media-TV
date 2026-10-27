export function standaloneHref(href: string) {
  if (href === '#actualites') return '/actualites'
  if (href === '#ocean-tv') return '/ocean-tv'
  if (href === '#opportunites') return '/opportunites'
  if (href === '#formations') return '/formations'
  if (href === '#evenements') return '/evenements'
  if (href.startsWith('#')) return `/${href}`
  return href
}
