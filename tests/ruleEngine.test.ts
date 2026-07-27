import { describe, expect, it } from 'vitest'
import { usToGermanyRulePack } from '../src/data/routes/us-to-germany'
import { generateChecklist, reconcileCompletedTaskIds } from '../src/domain/ruleEngine'
import { employeeAlone, familyPetsVehicle } from './fixtures'

describe('rule engine', () => {
  it('generates core employee tasks without pet or vehicle tasks', () => {
    const tasks = generateChecklist(employeeAlone, usToGermanyRulePack)

    expect(tasks.map((task) => task.id)).toContain('employment-proof')
    expect(tasks.map((task) => task.id)).toContain('payroll-tax-details')
    expect(tasks.map((task) => task.id)).not.toContain('pet-entry')
    expect(tasks.map((task) => task.id)).not.toContain('vehicle-import')
  })

  it('includes family, temporary housing, pet, and vehicle tasks', () => {
    const taskIds = generateChecklist(familyPetsVehicle, usToGermanyRulePack).map((task) => task.id)

    expect(taskIds).toEqual(expect.arrayContaining([
      'temporary-accommodation',
      'family-docs',
      'childcare-school',
      'pet-entry',
      'vehicle-import',
      'driver-license-conversion',
    ]))
  })

  it('handles a student without permanent housing', () => {
    const taskIds = generateChecklist(
      { ...employeeAlone, purpose: 'study', employment: 'not-working', housing: 'searching' },
      usToGermanyRulePack,
    ).map((task) => task.id)

    expect(taskIds).toContain('study-proof')
    expect(taskIds).toContain('temporary-accommodation')
    expect(taskIds).not.toContain('payroll-tax-details')
  })

  it('includes long-stay residence tasks for a remote worker', () => {
    const taskIds = generateChecklist(
      { ...employeeAlone, employment: 'remote-employer' },
      usToGermanyRulePack,
    ).map((task) => task.id)

    expect(taskIds).toContain('visa-route')
    expect(taskIds).toContain('residence-permit-application')
    expect(taskIds).toContain('employment-proof')
  })

  it('uses short-stay tasks and omits long-stay residence tasks', () => {
    const taskIds = generateChecklist(
      { ...employeeAlone, expectedStay: 'short' },
      usToGermanyRulePack,
    ).map((task) => task.id)

    expect(taskIds).toContain('short-stay-rules')
    expect(taskIds).not.toContain('visa-route')
    expect(taskIds).not.toContain('address-registration')
  })

  it('adds approved-status follow-up when a visa is already approved', () => {
    const taskIds = generateChecklist(
      { ...employeeAlone, visaStatus: 'approved' },
      usToGermanyRulePack,
    ).map((task) => task.id)

    expect(taskIds).toContain('visa-approved-followup')
  })

  it('prioritizes health-insurance tasks when coverage is not arranged', () => {
    const taskIds = generateChecklist(
      { ...employeeAlone, healthInsurance: 'not-arranged' },
      usToGermanyRulePack,
    ).map((task) => task.id)

    expect(taskIds).toContain('health-not-arranged')
  })

  it('preserves completed state for tasks that remain applicable after edits', () => {
    const tasks = generateChecklist(
      { ...familyPetsVehicle, housing: 'permanent' },
      usToGermanyRulePack,
      ['passport-validity', 'pet-entry'],
    )

    expect(tasks.find((task) => task.id === 'passport-validity')?.completed).toBe(true)
    expect(tasks.find((task) => task.id === 'pet-entry')?.completed).toBe(true)
  })

  it('removes completion for tasks that are no longer applicable after edits', () => {
    const completed = reconcileCompletedTaskIds(employeeAlone, usToGermanyRulePack, [
      'passport-validity',
      'pet-entry',
    ])

    expect(completed).toEqual(['passport-validity'])
  })

  it('recalculates due dates when arrival date changes', () => {
    const first = generateChecklist(employeeAlone, usToGermanyRulePack).find(
      (task) => task.id === 'confirm-travel',
    )
    const second = generateChecklist(
      { ...employeeAlone, arrivalDate: '2026-11-15' },
      usToGermanyRulePack,
    ).find((task) => task.id === 'confirm-travel')

    expect(first?.dueDate).toBe('2026-10-01')
    expect(second?.dueDate).toBe('2026-11-01')
  })

  it('handles missing arrival dates without crashing', () => {
    const task = generateChecklist({ ...employeeAlone, arrivalDate: '' }, usToGermanyRulePack).find(
      (item) => item.id === 'confirm-travel',
    )

    expect(task?.dueDate).toBeUndefined()
  })
})
