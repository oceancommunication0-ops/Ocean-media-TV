import { expect, test } from '@playwright/test'
import { eventDateDisplay, eventStatus, matchesPeriod, validSchedule, type EventSchedule } from '../src/lib/event-dates'

const day = (start: string, end?: string, timeZone = 'Africa/Kinshasa'): EventSchedule => ({ kind: 'date', start, end, timeZone })
const timed = (start: string, end?: string, timeZone = 'Africa/Kinshasa'): EventSchedule => ({ kind: 'datetime', start, end, timeZone })

test('les dates seules sont françaises et ne changent jamais de jour selon le fuseau du visiteur', () => {
  expect(eventDateDisplay(day('2026-11-14', '2026-11-14', 'Pacific/Honolulu'))).toMatchObject({ date: '14 novembre 2026', day: '14', month: 'nov', time: undefined })
  expect(eventDateDisplay(day('2026-10-09', '2026-10-10'))?.date).toContain('9–10 octobre 2026')
  expect(eventDateDisplay(day('2026-12-31', '2027-01-02'))?.date).toMatch(/2026.*2027/)
})

test('les journées et périodes sans horaires ne deviennent pas arbitrairement en cours', () => {
  const now = new Date('2026-10-23T12:00:00Z')
  expect(eventStatus(day('2026-10-24'), now)).toBe('upcoming')
  expect(eventStatus(day('2026-10-23'), now)).toBe('today')
  expect(eventStatus(day('2026-10-22', '2026-10-24'), now)).toBe('scheduled')
  expect(eventStatus(day('2026-10-21', '2026-10-22'), now)).toBe('past')
  expect(eventStatus(day('2026-10-22'), now)).toBe('undetermined')
  expect(eventStatus(undefined, now)).toBe('undetermined')
})

test('la fin d’une date inclusive suit le minuit local, même si le visiteur est à Los Angeles', () => {
  const schedule = day('2026-10-22', '2026-10-23')
  expect(eventStatus(schedule, new Date('2026-10-23T22:59:59Z'))).toBe('scheduled')
  expect(eventStatus(schedule, new Date('2026-10-23T23:00:00Z'))).toBe('past')
  const pacific = day('2026-10-23', '2026-10-23', 'Pacific/Honolulu')
  expect(eventStatus(pacific, new Date('2026-10-24T09:59:59Z'))).toBe('today')
  expect(eventStatus(pacific, new Date('2026-10-24T10:00:00Z'))).toBe('past')
})

test('les horaires précis définissent les limites, sans supposer une durée', () => {
  const schedule = timed('2026-10-23T09:00:00+01:00', '2026-10-23T12:00:00+01:00')
  expect(eventStatus(schedule, new Date('2026-10-23T07:59:59Z'))).toBe('upcoming')
  expect(eventStatus(schedule, new Date('2026-10-23T08:00:00Z'))).toBe('ongoing')
  expect(eventStatus(schedule, new Date('2026-10-23T11:00:00Z'))).toBe('past')
  expect(eventStatus(timed('2026-10-23T09:00:00+01:00'), new Date('2026-10-23T12:00:00Z'))).toBe('undetermined')
  expect(eventDateDisplay(schedule)?.time).toBe('09 h 00 – 12 h 00')
  expect(eventStatus(timed('2026-10-22T09:00:00+01:00', '2026-10-24T17:00:00+01:00'), new Date('2026-10-23T12:00:00Z'))).toBe('ongoing')
})

test('les changements d’heure et les plages sur plusieurs jours conservent leurs instants', () => {
  const dst = timed('2026-10-25T02:30:00+02:00', '2026-10-25T02:30:00+01:00', 'Europe/Paris')
  expect(eventStatus(dst, new Date('2026-10-25T01:00:00Z'))).toBe('ongoing')
  expect(eventStatus(dst, new Date('2026-10-25T01:30:00Z'))).toBe('past')
  const overnight = timed('2026-10-23T23:00:00+01:00', '2026-10-24T02:00:00+01:00')
  expect(eventDateDisplay(overnight)?.date).toContain('23–24 octobre 2026')
  expect(eventDateDisplay(overnight)?.time).toBe('23 h 00 le premier jour · 02 h 00 le dernier jour')
})

test('les dates impossibles, ambiguës, inversées ou sans fuseau sont rejetées', () => {
  for (const schedule of [
    day('2026-02-29'), day('2026-04-31'), day('2026-13-01'), day('2026-1-1'),
    day('2026-10-24', '2026-10-23'), day('2026-10-24', 'incorrect'),
    day('2026-10-24', undefined, 'Invalid/Zone'),
    timed('2026-10-23T09:00:00'), timed('2026-02-30T09:00:00Z'),
    timed('2026-10-23T24:00:00Z'), timed('2026-10-23T09:00:00Z', '2026-10-23T08:00:00Z'),
  ]) {
    expect(validSchedule(schedule)).toBeNull()
    expect(eventDateDisplay(schedule)).toBeNull()
    expect(eventStatus(schedule)).toBe('undetermined')
  }
  expect(validSchedule(day('2028-02-29'))).not.toBeNull()
})

test('une date inconnue ou sans état temporel fiable ne paraît que dans Tous', () => {
  const now = new Date('2026-10-23T12:00:00Z')
  for (const schedule of [undefined, day('2026-10-23'), timed('2026-10-23T09:00:00Z')]) {
    expect(matchesPeriod(schedule, 'upcoming', now)).toBe(false)
    expect(matchesPeriod(schedule, 'past', now)).toBe(false)
    expect(matchesPeriod(schedule, 'all', now)).toBe(true)
  }
})
