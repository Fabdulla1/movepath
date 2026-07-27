import type { HouseholdAssignment } from '../domain/types'

export const assignmentLabels: Record<HouseholdAssignment, string> = {
  unassigned: 'Unassigned',
  me: 'Me',
  partner: 'Partner',
  both: 'Both',
  'child-or-family': 'Child or family',
  household: 'Household',
}
