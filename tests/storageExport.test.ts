import { describe, expect, it } from 'vitest'
import { usToGermanyRulePack } from '../src/data/routes/us-to-germany'
import { generateChecklist } from '../src/domain/ruleEngine'
import { STORAGE_SCHEMA_VERSION, type StoredApplicationState } from '../src/domain/types'
import { buildExportedPlan } from '../src/services/exportPlan'
import { freshState, loadState, saveState, STORAGE_KEY } from '../src/services/storage'
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
          purchaseEmail: 'buyer@example.com',
          licenseKey: 'secret-key',
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
    expect(JSON.stringify(exported)).not.toContain('secret-key')
  })
})

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
