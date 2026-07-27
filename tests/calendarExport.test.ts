import { describe, expect, it } from 'vitest'
import { buildCalendarIcs } from '../src/premium/calendarExport'
import type { AppChecklistTask } from '../src/domain/types'

describe('calendar export', () => {
  it('escapes calendar text correctly', () => {
    const text = buildCalendarIcs(
      [task({ title: 'Register, address; now', description: 'Line 1\nLine 2' })],
      { destinationCity: 'Berlin' },
    )

    expect(text).toContain('SUMMARY:Register\\, address\\; now')
    expect(text).toContain('DESCRIPTION:Line 1\\nLine 2')
  })

  it('uses stable event ids and avoids duplicate events', () => {
    const text = buildCalendarIcs([task(), task()], {})
    expect(text.match(/UID:movepath-task-1@movepath.online/g)).toHaveLength(1)
  })
})

function task(overrides?: Partial<AppChecklistTask>): AppChecklistTask {
  return {
    id: 'task-1',
    source: 'official',
    title: 'Register address',
    description: 'Bring your passport.',
    category: 'first-week',
    dueDate: '2026-10-10',
    completed: false,
    documents: [],
    officialSources: [],
    order: 1,
    assignment: 'me',
    ...overrides,
  }
}
