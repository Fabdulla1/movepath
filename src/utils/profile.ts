import type { UserRelocationProfile } from '../domain/types'

export function isCompleteProfile(
  profile: Partial<UserRelocationProfile> | null,
): profile is UserRelocationProfile {
  return Boolean(
    profile?.arrivalDate &&
      profile.purpose &&
      profile.expectedStay &&
      profile.employment &&
      profile.visaStatus &&
      profile.housing &&
      profile.movingWith &&
      profile.pets &&
      typeof profile.bringingVehicle === 'boolean' &&
      profile.destinationCity?.trim() &&
      profile.healthInsurance,
  )
}
