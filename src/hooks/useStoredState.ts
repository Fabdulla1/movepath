import { useEffect, useMemo, useState } from 'react'
import { usToGermanyRulePack } from '../data/routes/us-to-germany'
import { generateChecklist, reconcileCompletedTaskIds } from '../domain/ruleEngine'
import type { StoredApplicationState, UserRelocationProfile } from '../domain/types'
import { clearState, freshState, loadState, saveState } from '../services/storage'

export function useStoredState() {
  const [state, setState] = useState<StoredApplicationState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const tasks = useMemo(
    () => generateChecklist(state.profile ?? {}, usToGermanyRulePack, state.completedTaskIds),
    [state.profile, state.completedTaskIds],
  )

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
      const ids = new Set(current.completedTaskIds)
      if (completed) ids.add(taskId)
      else ids.delete(taskId)
      return { ...current, completedTaskIds: Array.from(ids), generatedAt: current.generatedAt }
    })
  }

  function reset() {
    clearState()
    setState(freshState())
  }

  return { state, tasks, saveProfile, setTaskCompleted, reset }
}
