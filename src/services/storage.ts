import { STORAGE_SCHEMA_VERSION, type StoredApplicationState } from '../domain/types'

export const STORAGE_KEY = 'movepath:app-state:v1'

export const freshState = (): StoredApplicationState => ({
  schemaVersion: STORAGE_SCHEMA_VERSION,
  profile: null,
  completedTaskIds: [],
  generatedAt: null,
  routeId: 'us-to-germany',
})

export function loadState(storage: Storage | undefined = getStorage()): StoredApplicationState {
  if (!storage) return freshState()

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw) as unknown
    if (!isStoredApplicationState(parsed)) return freshState()
    return parsed
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
    candidate.routeId === 'us-to-germany'
  )
}
