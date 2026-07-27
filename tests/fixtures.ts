import type { UserRelocationProfile } from '../src/domain/types'

export const employeeAlone: UserRelocationProfile = {
  arrivalDate: '2026-10-15',
  purpose: 'employment',
  expectedStay: 'long',
  employment: 'german-employer',
  visaStatus: 'not-started',
  housing: 'permanent',
  movingWith: 'alone',
  pets: 'none',
  bringingVehicle: false,
  destinationCity: 'Berlin',
  healthInsurance: 'german-arranged',
}

export const familyPetsVehicle: UserRelocationProfile = {
  ...employeeAlone,
  housing: 'temporary',
  movingWith: 'family',
  pets: 'cat-or-dog',
  bringingVehicle: true,
  healthInsurance: 'temporary',
}
