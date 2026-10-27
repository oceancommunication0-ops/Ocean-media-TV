export type { Opportunity, OpportunitySummary } from '../../shared/content'
export type OpportunityCategoryId = string
export function formatOpportunityDate(value?: string) {
  if (!value || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) return null
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}
