import { describe, expect, it } from 'vitest'
import { usToGermanyRulePack } from '../src/data/routes/us-to-germany'
import { generateChecklist } from '../src/domain/ruleEngine'
import { STORAGE_SCHEMA_VERSION, type StoredApplicationState } from '../src/domain/types'
import { buildExportedPlan } from '../src/services/exportPlan'
import {
  clearStoredLicenseState,
  freshState,
  loadState,
  resetRelocationPlanState,
  saveState,
  STORAGE_KEY,
} from '../src/services/storage'
import { employeeAlone } from './fixtures'

describe('storage and export behavior', () => {
  it('falls back safely when local-storage data is corrupt', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, '{bad json')

    expect(loadState(storage)).toEqual(freshState())
  })

  it('falls back safely when stored schema is outdated', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 0 }))

    expect(loadState(storage)).toEqual(freshState())
  })

  it('saves and loads valid state', () => {
    const storage = new MemoryStorage()
    const state: StoredApplicationState = {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      profile: employeeAlone,
      completedTaskIds: ['passport-validity'],
      generatedAt: '2026-07-27T00:00:00.000Z',
      routeId: 'us-to-germany',
      customTasks: [],
      taskAssignments: {},
      license: null,
    }

    saveState(state, storage)

    expect(loadState(storage)).toEqual(state)
  })

  it('resets relocation-plan data while preserving a valid Plus license', () => {
    const license = storedLicense()
    const reset = resetRelocationPlanState({
      schemaVersion: STORAGE_SCHEMA_VERSION,
      profile: employeeAlone,
      completedTaskIds: ['passport-validity'],
      generatedAt: '2026-07-27T00:00:00.000Z',
      routeId: 'us-to-germany',
      customTasks: [
        {
          id: 'custom-1',
          title: 'Book movers',
          description: 'Confirm timing',
          category: 'before-departure',
          dueDate: '2026-09-01',
          completed: true,
          createdAt: '2026-07-27T00:00:00.000Z',
          updatedAt: '2026-07-27T00:00:00.000Z',
        },
      ],
      taskAssignments: { 'passport-validity': 'partner', 'custom-1': 'both' },
      license,
    })

    expect(reset.profile).toBeNull()
    expect(reset.completedTaskIds).toEqual([])
    expect(reset.customTasks).toEqual([])
    expect(reset.taskAssignments).toEqual({})
    expect(reset.license).toEqual(license)
  })

  it('clears only the stored license when asked', () => {
    const state = {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      profile: employeeAlone,
      completedTaskIds: ['passport-validity'],
      generatedAt: '2026-07-27T00:00:00.000Z',
      routeId: 'us-to-germany',
      customTasks: [],
      taskAssignments: { 'passport-validity': 'me' },
      license: storedLicense(),
    }

    expect(clearStoredLicenseState(state)).toEqual({
      ...state,
      license: null,
    })
  })

  it('recovers corrupt relocation-plan data without deleting a valid license', () => {
    const storage = new MemoryStorage()
    const license = storedLicense()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: STORAGE_SCHEMA_VERSION,
        profile: 'corrupt',
        completedTaskIds: ['passport-validity'],
        generatedAt: '2026-07-27T00:00:00.000Z',
        routeId: 'us-to-germany',
        customTasks: [],
        taskAssignments: {},
        license,
      }),
    )

    expect(loadState(storage)).toEqual({
      ...freshState(),
      license,
    })
  })

  it('fails closed when stored license data is corrupt', () => {
    const storage = new MemoryStorage()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: STORAGE_SCHEMA_VERSION,
        profile: employeeAlone,
        completedTaskIds: [],
        generatedAt: '2026-07-27T00:00:00.000Z',
        routeId: 'us-to-germany',
        customTasks: [],
        taskAssignments: {},
        license: { plan: 'plus', licenseKey: 123 },
      }),
    )

    expect(loadState(storage).license).toBeNull()
  })

  it('exports the public plan schema without storage internals', () => {
    const tasks = generateChecklist(employeeAlone, usToGermanyRulePack, ['passport-validity'])
    const exported = buildExportedPlan(
      {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        profile: employeeAlone,
        completedTaskIds: ['passport-validity'],
        generatedAt: '2026-07-27T00:00:00.000Z',
        routeId: 'us-to-germany',
        customTasks: [],
        taskAssignments: {},
        license: {
          schemaVersion: 2,
          plan: 'plus',
          purchaseEmail: 'fixture@example.invalid',
          licenseKey: 'fixture-license-key',
          installationId: 'installation-1',
          instanceId: 'instance-1',
          instanceName: 'MovePath Browser abcd1234',
          activatedAt: '2026-07-27T00:00:00.000Z',
          lastValidatedAt: '2026-07-27T00:00:00.000Z',
          offlineValidUntil: '2026-08-03T00:00:00.000Z',
        },
      },
      tasks.map((task) => ({ ...task, source: 'official', assignment: 'unassigned' })),
    )

    expect(exported.applicationVersion).toBe('0.1.0')
    expect(exported.userAnswers).toEqual(employeeAlone)
    expect(exported.generatedTaskIds).toContain('passport-validity')
    expect(exported.completionState['passport-validity']).toBe(true)
    expect(exported).not.toHaveProperty('schemaVersion')
    expect(exported).not.toHaveProperty('generatedAt')
    expect(JSON.stringify(exported)).not.toContain('fixture-license-key')
  })
})

function storedLicense() {
  return {
    schemaVersion: 2,
    plan: 'plus' as const,
    purchaseEmail: 'fixture@example.invalid',
    licenseKey: 'fixture-license-key',
    installationId: 'installation-1',
    instanceId: 'instance-1',
    instanceName: 'MovePath Browser abcd1234',
    activatedAt: '2026-07-27T00:00:00.000Z',
    lastValidatedAt: '2026-07-27T00:00:00.000Z',
    offlineValidUntil: '2026-08-03T00:00:00.000Z',
  }
}

class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  length = 0

  clear(): void {
    this.data.clear()
    this.length = 0
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.data.delete(key)
    this.length = this.data.size
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
    this.length = this.data.size
  }
}
