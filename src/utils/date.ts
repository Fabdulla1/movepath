export function formatDate(date: string | undefined) {
  if (!date) return 'No due date'
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return 'No due date'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
