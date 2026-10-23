// A calendar date is deliberately different from an instant. Never interpret
// YYYY-MM-DD in the visitor's timezone or infer an end time from a start time.
export type EventSchedule = {
  kind: 'date' | 'datetime'
  start: string
  end?: string
  timeZone: string
}

export type EventStatus = 'upcoming' | 'past' | 'ongoing' | 'today' | 'scheduled' | 'undetermined'
export type EventPeriod = 'upcoming' | 'past' | 'all'

function calendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null
}

function instant(value: string): Date | null {
  // An explicit offset is mandatory, including for local times near DST changes.
  if (!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/.test(value)) return null
  if (!calendarDate(value.slice(0, 10))) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

export function validSchedule(schedule?: EventSchedule) {
  if (!schedule) return null
  try { new Intl.DateTimeFormat('fr-FR', { timeZone: schedule.timeZone }).format() } catch { return null }
  const parse = schedule.kind === 'date' ? calendarDate : instant
  const start = parse(schedule.start)
  const end = schedule.end ? parse(schedule.end) : null
  if (!start || (schedule.end && !end) || (end && end < start)) return null
  return { start, end, timeZone: schedule.kind === 'date' ? 'UTC' : schedule.timeZone }
}

function localDay(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  return ['year', 'month', 'day'].map(key => parts.find(part => part.type === key)?.value).join('-')
}

export function eventStatus(schedule: EventSchedule | undefined, now: Date = new Date()): EventStatus {
  const dates = validSchedule(schedule)
  if (!schedule || !dates || !Number.isFinite(now.getTime())) return 'undetermined'
  if (schedule.kind === 'datetime') {
    if (dates.start > now) return 'upcoming'
    if (!dates.end) return 'undetermined'
    return now >= dates.end ? 'past' : 'ongoing'
  }
  const today = localDay(now, schedule.timeZone)
  if (schedule.start > today) return 'upcoming'
  // Date-only end dates are inclusive: the final day has to finish locally.
  if (schedule.end && schedule.end < today) return 'past'
  if (schedule.start === today) return 'today'
  if (schedule.end && schedule.end >= today) return 'scheduled'
  return 'undetermined'
}

export function matchesPeriod(schedule: EventSchedule | undefined, period: EventPeriod, now: Date) {
  return period === 'all' || eventStatus(schedule, now) === period
}

export function eventDateDisplay(schedule?: EventSchedule) {
  const dates = validSchedule(schedule)
  if (!schedule || !dates) return null
  const options = { timeZone: dates.timeZone, day: 'numeric', month: 'long', year: 'numeric' } as const
  const formatter = new Intl.DateTimeFormat('fr-FR', options)
  const sameDay = !dates.end || localDay(dates.start, dates.timeZone) === localDay(dates.end, dates.timeZone)
  const date = dates.end && !sameDay ? formatter.formatRange(dates.start, dates.end) : formatter.format(dates.start)
  const timeFormatter = new Intl.DateTimeFormat('fr-FR', { timeZone: dates.timeZone, hour: '2-digit', minute: '2-digit' })
  let time: string | undefined
  if (schedule.kind === 'datetime') {
    const first = timeFormatter.format(dates.start).replace(':', ' h ')
    const last = dates.end ? timeFormatter.format(dates.end).replace(':', ' h ') : undefined
    time = last ? (sameDay ? `${first} – ${last}` : `${first} le premier jour · ${last} le dernier jour`) : first
  }
  return {
    date, time,
    timeZone: schedule.timeZone,
    day: new Intl.DateTimeFormat('fr-FR', { timeZone: dates.timeZone, day: '2-digit' }).format(dates.start),
    month: new Intl.DateTimeFormat('fr-FR', { timeZone: dates.timeZone, month: 'short' }).format(dates.start).replace('.', ''),
  }
}
