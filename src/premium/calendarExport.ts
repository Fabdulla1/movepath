import type { AppChecklistTask, UserRelocationProfile } from '../domain/types'

export function buildCalendarIcs(tasks: AppChecklistTask[], profile: Partial<UserRelocationProfile>) {
  const datedTasks = dedupeTasks(tasks.filter((task) => task.dueDate))
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MovePath//MovePath Plus//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const task of datedTasks) {
    const descriptionParts = [
      task.description,
      `Category: ${task.category}`,
      profile.destinationCity ? `Destination: ${profile.destinationCity}` : '',
      task.assignment !== 'unassigned' ? `Assignment: ${task.assignment}` : '',
      task.officialSources.length
        ? `Sources: ${task.officialSources.map((source) => source.url).join(' ')}`
        : '',
      'MovePath: https://movepath.online/',
    ].filter(Boolean)

    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeText(`movepath-${task.id}@movepath.online`)}`,
      `DTSTAMP:${toDateTimeStamp(new Date().toISOString())}`,
      `DTSTART;VALUE=DATE:${formatDateOnly(task.dueDate!)}`,
      `SUMMARY:${escapeText(task.title)}`,
      `DESCRIPTION:${escapeText(descriptionParts.join('\\n'))}`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadCalendar(filename: string, calendarText: string) {
  const blob = new Blob([calendarText], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function dedupeTasks(tasks: AppChecklistTask[]) {
  const seen = new Set<string>()
  return tasks.filter((task) => {
    const key = `${task.id}:${task.dueDate}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function formatDateOnly(value: string) {
  return value.replaceAll('-', '')
}

function toDateTimeStamp(value: string) {
  return value.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}
