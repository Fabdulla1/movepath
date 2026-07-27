import { STORAGE_SCHEMA_VERSION, type HouseholdAssignment, type StoredApplicationState, type StoredMovePathLicense } from '../domain/types'

export const STORAGE_KEY = 'movepath:app-state:v1'

export const freshState = (): StoredApplicationState => ({
  schemaVersion: STORAGE_SCHEMA_VERSION,
  profile: null,
  completedTaskIds: [],
  generatedAt: null,
  routeId: 'us-to-germany',
  customTasks: [],
  taskAssignments: {},
  license: null,
})

export function loadState(storage: Storage | undefined = getStorage()): StoredApplicationState {
  if (!storage) return freshState()

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw) as unknown
    return migrateState(parsed)
  } catch {
    return freshState()
  }
}

export function saveState(
  state: StoredApplicationState,
  storage: Storage | undefined = getStorage(),
) {
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState(storage: Storage | undefined = getStorage()) {
  if (!storage) return
  storage.removeItem(STORAGE_KEY)
}

function getStorage() {
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

function isStoredApplicationState(value: unknown): value is StoredApplicationState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.schemaVersion === STORAGE_SCHEMA_VERSION &&
    (candidate.profile === null || typeof candidate.profile === 'object') &&
    Array.isArray(candidate.completedTaskIds) &&
    candidate.completedTaskIds.every((id) => typeof id === 'string') &&
    (candidate.generatedAt === null || typeof candidate.generatedAt === 'string') &&
    candidate.routeId === 'us-to-germany' &&
    Array.isArray(candidate.customTasks) &&
    candidate.customTasks.every(isCustomTask) &&
    isAssignments(candidate.taskAssignments) &&
    (candidate.license === null || isLicense(candidate.license))
  )
}

function migrateState(value: unknown): StoredApplicationState {
  if (isStoredApplicationState(value)) return value
  if (!value || typeof value !== 'object') return freshState()
  const candidate = value as Record<string, unknown>

  if (
    candidate.schemaVersion === 1 &&
    (candidate.profile === null || typeof candidate.profile === 'object') &&
    Array.isArray(candidate.completedTaskIds) &&
    candidate.completedTaskIds.every((id) => typeof id === 'string') &&
    (candidate.generatedAt === null || typeof candidate.generatedAt === 'string') &&
    candidate.routeId === 'us-to-germany'
  ) {
    return {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      profile: candidate.profile as StoredApplicationState['profile'],
      completedTaskIds: candidate.completedTaskIds,
      generatedAt: candidate.generatedAt as string | null,
      routeId: 'us-to-germany',
      customTasks: [],
      taskAssignments: {},
      license: null,
    }
  }

  return freshState()
}

function isCustomTask(value: unknown) {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.dueDate === 'string' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

function isAssignments(value: unknown): value is Record<string, HouseholdAssignment> {
  if (!value || typeof value !== 'object') return false
  return Object.values(value as Record<string, unknown>).every((assignment) =>
    [
      'unassigned',
      'me',
      'partner',
      'both',
      'child-or-family',
      'household',
    ].includes(String(assignment)),
  )
}

function isLicense(value: unknown): value is StoredMovePathLicense {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.schemaVersion === 'number' &&
    candidate.plan === 'plus' &&
    typeof candidate.purchaseEmail === 'string' &&
    typeof candidate.licenseKey === 'string' &&
    typeof candidate.installationId === 'string' &&
    typeof candidate.instanceId === 'string' &&
    typeof candidate.instanceName === 'string' &&
    typeof candidate.activatedAt === 'string' &&
    typeof candidate.lastValidatedAt === 'string' &&
    typeof candidate.offlineValidUntil === 'string'
  )
}
