import type { AppChecklistTask, CustomTask, HouseholdAssignment } from '../domain/types'

export function createCustomTask(input: {
  title: string
  description: string
  dueDate: string
  category: CustomTask['category']
}) {
  const timestamp = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: input.dueDate,
    category: input.category,
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies CustomTask
}

export function updateCustomTask(task: CustomTask, input: Omit<CustomTask, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    ...task,
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    updatedAt: new Date().toISOString(),
  }
}

export function customTaskToAppTask(
  task: CustomTask,
  assignment: HouseholdAssignment,
): AppChecklistTask {
  return {
    id: task.id,
    source: 'custom',
    title: task.title,
    description: task.description,
    category: task.category,
    dueDate: task.dueDate,
    completed: task.completed,
    documents: [],
    officialSources: [],
    order: 999,
    assignment,
  }
}
