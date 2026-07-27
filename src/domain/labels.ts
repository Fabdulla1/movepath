import type { ChecklistCategory } from './types'

export const categoryLabels: Record<ChecklistCategory, string> = {
  'before-departure': 'Before departure',
  'pre-arrival': 'Two to four weeks before arrival',
  'first-week': 'First week in Germany',
  'first-month': 'First month',
  'first-three-months': 'First three months',
  ongoing: 'Ongoing and annual tasks',
}

export const categoryOrder = Object.keys(categoryLabels) as ChecklistCategory[]
