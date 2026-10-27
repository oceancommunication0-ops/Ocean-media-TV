export const DEFAULT_IMAGE_POSITION = '50% 40%'

export function automaticContentId(title: string, suffix: string) {
  const base = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 120)
  return (base || 'publication') + '-' + suffix
}
