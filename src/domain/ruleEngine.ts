import type {
  ApplicabilityCondition,
  ChecklistRule,
  GeneratedChecklistTask,
  RouteRulePack,
  UserRelocationProfile,
} from './types'

export function conditionApplies(
  condition: ApplicabilityCondition,
  profile: Partial<UserRelocationProfile>,
) {
  if (condition.field === 'always') return true

  const actual = profile[condition.field]

  switch (condition.operator) {
    case 'equals':
      return actual === condition.value
    case 'notEquals':
      return actual !== condition.value
    case 'in':
      return condition.value.includes(actual as string | boolean)
    case 'notIn':
      return !condition.value.includes(actual as string | boolean)
  }
}

export function ruleApplies(rule: ChecklistRule, profile: Partial<UserRelocationProfile>) {
  return rule.appliesWhen.every((condition) => conditionApplies(condition, profile))
}

export function calculateDueDate(
  arrivalDate: string | undefined,
  offsetDays: number,
): string | undefined {
  if (!arrivalDate) return undefined
  const parsed = new Date(`${arrivalDate}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return undefined
  parsed.setUTCDate(parsed.getUTCDate() + offsetDays)
  return parsed.toISOString().slice(0, 10)
}

export function generateChecklist(
  profile: Partial<UserRelocationProfile>,
  rulePack: RouteRulePack,
  completedTaskIds: Iterable<string> = [],
): GeneratedChecklistTask[] {
  const completed = new Set(completedTaskIds)

  return rulePack.rules
    .filter((rule) => ruleApplies(rule, profile))
    .map((rule) => ({
      id: rule.id,
      title: rule.title,
      description: rule.description,
      category: rule.category,
      order: rule.order,
      documents: rule.documents,
      officialSources: rule.officialSources,
      applicabilityNote: rule.applicabilityNote,
      details: rule.details,
      lastVerified: rule.lastVerified,
      outdated: rule.outdated,
      dueDate: rule.dueDate
        ? calculateDueDate(profile.arrivalDate, rule.dueDate.offsetDays)
        : undefined,
      completed: completed.has(rule.id),
    }))
    .sort(compareTasks)
}

export function reconcileCompletedTaskIds(
  profile: Partial<UserRelocationProfile>,
  rulePack: RouteRulePack,
  completedTaskIds: Iterable<string>,
) {
  const applicableIds = new Set(generateChecklist(profile, rulePack).map((task) => task.id))
  return Array.from(new Set(completedTaskIds)).filter((id) => applicableIds.has(id))
}

function compareTasks(a: GeneratedChecklistTask, b: GeneratedChecklistTask) {
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
    return a.dueDate.localeCompare(b.dueDate)
  }
  if (a.dueDate && !b.dueDate) return -1
  if (!a.dueDate && b.dueDate) return 1
  if (a.category !== b.category) return categoryOrder(a.category) - categoryOrder(b.category)
  return a.order - b.order
}

function categoryOrder(category: GeneratedChecklistTask['category']) {
  return [
    'before-departure',
    'pre-arrival',
    'first-week',
    'first-month',
    'first-three-months',
    'ongoing',
  ].indexOf(category)
}
