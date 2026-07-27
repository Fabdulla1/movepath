import { APP_VERSION } from '../config'
import type { ExportedPlan, GeneratedChecklistTask, StoredApplicationState } from '../domain/types'

export function buildExportedPlan(
  state: StoredApplicationState,
  tasks: GeneratedChecklistTask[],
): ExportedPlan {
  return {
    exportTimestamp: new Date().toISOString(),
    applicationVersion: APP_VERSION,
    routeId: state.routeId,
    userAnswers: state.profile,
    generatedTaskIds: tasks.map((task) => task.id),
    completionState: Object.fromEntries(tasks.map((task) => [task.id, task.completed])),
  }
}

export function downloadJson(filename: string, data: ExportedPlan) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
