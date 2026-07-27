import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { monetizationConfig } from '../config/monetization'
import { usToGermanyRulePack } from '../data/routes/us-to-germany'
import { buildEntitlements } from '../services/entitlementService'
import { activateLicense, deactivateLicense, validateLicense } from '../services/lemonLicenseApi'
import {
  evaluateActivation,
  evaluateStoredLicense,
  evaluateValidation,
  shouldValidateOnOpen,
} from '../services/licensePolicy'
import { generateChecklist, reconcileCompletedTaskIds } from '../domain/ruleEngine'
import type {
  AppChecklistTask,
  CustomTask,
  HouseholdAssignment,
  StoredApplicationState,
  UserRelocationProfile,
} from '../domain/types'
import { clearState, freshState, loadState, saveState } from '../services/storage'
import { customTaskToAppTask, updateCustomTask } from '../premium/customTasks'

export function useStoredState() {
  const [state, setState] = useState<StoredApplicationState>(() => loadState())
  const [licenseMessage, setLicenseMessage] = useState<string | null>(null)
  const [licenseError, setLicenseError] = useState<string | null>(null)
  const [isActivating, setIsActivating] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const validatedThisSession = useRef(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  const officialTasks = useMemo(
    () => generateChecklist(state.profile ?? {}, usToGermanyRulePack, state.completedTaskIds),
    [state.profile, state.completedTaskIds],
  )

  const tasks = useMemo<AppChecklistTask[]>(() => {
    const official = officialTasks.map((task) => ({
      ...task,
      source: 'official' as const,
      assignment: state.taskAssignments[task.id] ?? 'unassigned',
    }))
    const custom = state.customTasks.map((task) =>
      customTaskToAppTask(task, state.taskAssignments[task.id] ?? 'unassigned'),
    )
    return [...official, ...custom].sort(compareTasks)
  }, [officialTasks, state.customTasks, state.taskAssignments])

  const licenseStatus = evaluateStoredLicense(state.license)
  const entitlements = buildEntitlements(
    licenseStatus.ok && licenseMessage
      ? { ...licenseStatus, message: licenseMessage }
      : licenseStatus,
  )

  const onLicenseOpenValidation = useEffectEvent(async () => {
    if (shouldValidateOnOpen(state.license) && !validatedThisSession.current) {
      await refreshLicense()
    }
  })

  useEffect(() => {
    void onLicenseOpenValidation()
  }, [state.license])

  function saveProfile(profile: UserRelocationProfile) {
    setState((current) => {
      const completedTaskIds = reconcileCompletedTaskIds(
        profile,
        usToGermanyRulePack,
        current.completedTaskIds,
      )
      return {
        ...current,
        profile,
        completedTaskIds,
        generatedAt: new Date().toISOString(),
      }
    })
  }

  function setTaskCompleted(taskId: string, completed: boolean) {
    setState((current) => {
      const customTask = current.customTasks.find((task) => task.id === taskId)
      if (customTask) {
        return {
          ...current,
          customTasks: current.customTasks.map((task) =>
            task.id === taskId ? { ...task, completed, updatedAt: new Date().toISOString() } : task,
          ),
        }
      }

      const ids = new Set(current.completedTaskIds)
      if (completed) ids.add(taskId)
      else ids.delete(taskId)
      return { ...current, completedTaskIds: Array.from(ids) }
    })
  }

  function reset() {
    clearState()
    setState(freshState())
    setLicenseMessage(null)
    setLicenseError(null)
  }

  function upsertCustomTask(task: CustomTask) {
    setState((current) => {
      const exists = current.customTasks.some((item) => item.id === task.id)
      return {
        ...current,
        customTasks: exists
          ? current.customTasks.map((item) => (item.id === task.id ? task : item))
          : [...current.customTasks, task],
      }
    })
  }

  function editCustomTask(taskId: string, input: Omit<CustomTask, 'id' | 'createdAt' | 'updatedAt'>) {
    setState((current) => ({
      ...current,
      customTasks: current.customTasks.map((task) =>
        task.id === taskId ? updateCustomTask(task, input) : task,
      ),
    }))
  }

  function deleteCustomTask(taskId: string) {
    setState((current) => {
      const assignments = { ...current.taskAssignments }
      delete assignments[taskId]
      return {
        ...current,
        customTasks: current.customTasks.filter((task) => task.id !== taskId),
        taskAssignments: assignments,
      }
    })
  }

  function setTaskAssignment(taskId: string, assignment: HouseholdAssignment) {
    setState((current) => ({
      ...current,
      taskAssignments: {
        ...current.taskAssignments,
        [taskId]: assignment,
      },
    }))
  }

  async function activatePlus(purchaseEmail: string, licenseKey: string) {
    if (!monetizationConfig.isConfigured) {
      setLicenseError('MovePath Plus configuration is incomplete.')
      return false
    }

    setIsActivating(true)
    setLicenseError(null)
    setLicenseMessage('Activating MovePath Plus...')
    try {
      const installationId = crypto.randomUUID()
      const instanceName = `MovePath Browser ${installationId.slice(0, 8)}`
      const activation = await activateLicense(licenseKey, instanceName)
      const activationCheck = evaluateActivation(
        purchaseEmail,
        installationId,
        instanceName,
        activation,
      )

      if (!activationCheck.ok) {
        setLicenseError(activationCheck.message)
        setLicenseMessage(null)
        return false
      }

      const validation = await validateLicense(licenseKey, activationCheck.license.instanceId)
      const validated = evaluateValidation(activationCheck.license, validation)

      if (!validated.ok) {
        setLicenseError(validated.message)
        setLicenseMessage(null)
        return false
      }

      setState((current) => ({ ...current, license: validated.license }))
      setLicenseMessage('MovePath Plus activated on this browser.')
      validatedThisSession.current = true
      return true
    } catch (error) {
      setLicenseError(asUserMessage(error))
      setLicenseMessage(null)
      return false
    } finally {
      setIsActivating(false)
    }
  }

  async function refreshLicense(force = false) {
    if (!state.license) return false
    if (validatedThisSession.current && !force) return true

    setIsValidating(true)
    setLicenseError(null)
    try {
      const result = await validateLicense(state.license.licenseKey, state.license.instanceId)
      const evaluated = evaluateValidation(state.license, result)
      if (!evaluated.ok) {
        setState((current) => ({ ...current, license: null }))
        setLicenseError(evaluated.message)
        setLicenseMessage(null)
        return false
      }

      setState((current) => ({ ...current, license: evaluated.license }))
      setLicenseMessage(evaluated.message)
      validatedThisSession.current = true
      return true
    } catch (error) {
      const fallback = evaluateStoredLicense(state.license)
      if (fallback.ok) {
        setLicenseMessage('MovePath Plus is temporarily using the last successful validation.')
        return true
      }
      setState((current) => ({ ...current, license: null }))
      setLicenseError(asUserMessage(error))
      return false
    } finally {
      setIsValidating(false)
    }
  }

  async function deactivatePlus() {
    if (!state.license) return false
    setLicenseError(null)
    setLicenseMessage('Deactivating this browser...')
    try {
      const response = await deactivateLicense(state.license.licenseKey, state.license.instanceId)
      if (!response.deactivated || response.error) {
        setLicenseError(response.error || 'MovePath Plus could not be deactivated right now.')
        setLicenseMessage(null)
        return false
      }
      clearLocalLicenseData()
      setLicenseMessage('MovePath Plus has been deactivated on this browser.')
      return true
    } catch (error) {
      setLicenseError(asUserMessage(error))
      setLicenseMessage(null)
      return false
    }
  }

  function clearLocalLicenseData() {
    setState((current) => ({ ...current, license: null }))
    validatedThisSession.current = false
  }

  return {
    state,
    tasks,
    officialTasks,
    entitlements,
    licenseError,
    licenseMessage,
    isActivating,
    isValidating,
    saveProfile,
    setTaskCompleted,
    setTaskAssignment,
    upsertCustomTask,
    editCustomTask,
    deleteCustomTask,
    activatePlus,
    refreshLicense,
    deactivatePlus,
    clearLocalLicenseData,
    reset,
  }
}

function compareTasks(a: AppChecklistTask, b: AppChecklistTask) {
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
    return a.dueDate.localeCompare(b.dueDate)
  }
  if (a.dueDate && !b.dueDate) return -1
  if (!a.dueDate && b.dueDate) return 1
  return a.order - b.order
}

function asUserMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'A network error prevented license verification.'
}
