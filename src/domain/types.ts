export const STORAGE_SCHEMA_VERSION = 1 as const

export type StorageSchemaVersion = typeof STORAGE_SCHEMA_VERSION

export type ChecklistCategory =
  | 'before-departure'
  | 'pre-arrival'
  | 'first-week'
  | 'first-month'
  | 'first-three-months'
  | 'ongoing'

export type PurposeOfMove = 'employment' | 'study' | 'family' | 'other'
export type ExpectedStay = 'short' | 'long'
export type EmploymentArrangement =
  | 'german-employer'
  | 'remote-employer'
  | 'self-employed'
  | 'not-working'
export type VisaStatus = 'not-started' | 'in-progress' | 'approved' | 'unsure'
export type HousingStatus = 'permanent' | 'temporary' | 'searching'
export type MovingWith = 'alone' | 'partner' | 'family'
export type PetStatus = 'none' | 'cat-or-dog' | 'other'
export type HealthInsuranceStatus =
  | 'not-arranged'
  | 'temporary'
  | 'german-arranged'
  | 'unsure'

export type UserRelocationProfile = {
  arrivalDate: string
  purpose: PurposeOfMove
  expectedStay: ExpectedStay
  employment: EmploymentArrangement
  visaStatus: VisaStatus
  housing: HousingStatus
  movingWith: MovingWith
  pets: PetStatus
  bringingVehicle: boolean
  destinationCity: string
  healthInsurance: HealthInsuranceStatus
}

export type QuestionnaireField = keyof UserRelocationProfile

export type ApplicabilityCondition =
  | { field: QuestionnaireField; operator: 'equals'; value: string | boolean }
  | { field: QuestionnaireField; operator: 'notEquals'; value: string | boolean }
  | { field: QuestionnaireField; operator: 'in'; value: Array<string | boolean> }
  | { field: QuestionnaireField; operator: 'notIn'; value: Array<string | boolean> }
  | { field: 'always'; operator: 'always'; value: true }

export type OfficialSource = {
  label: string
  url: string
}

export type RelativeDueDate = {
  relativeTo: 'arrival'
  offsetDays: number
}

export type ChecklistRule = {
  id: string
  title: string
  description: string
  category: ChecklistCategory
  order: number
  appliesWhen: ApplicabilityCondition[]
  dueDate?: RelativeDueDate
  documents: string[]
  officialSources: OfficialSource[]
  applicabilityNote?: string
  details?: string
  lastVerified: string
  outdated?: boolean
}

export type GeneratedChecklistTask = Omit<ChecklistRule, 'appliesWhen' | 'dueDate'> & {
  dueDate?: string
  completed: boolean
}

export type StoredApplicationState = {
  schemaVersion: StorageSchemaVersion
  profile: Partial<UserRelocationProfile> | null
  completedTaskIds: string[]
  generatedAt: string | null
  routeId: string
}

export type RouteRulePack = {
  id: string
  origin: string
  destination: string
  lastReviewed: string
  rules: ChecklistRule[]
}

export type ExportedPlan = {
  exportTimestamp: string
  applicationVersion: string
  routeId: string
  userAnswers: Partial<UserRelocationProfile> | null
  generatedTaskIds: string[]
  completionState: Record<string, boolean>
}
