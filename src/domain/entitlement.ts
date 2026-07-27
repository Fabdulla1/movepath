import type { PremiumFeature } from './types'

export const premiumFeatures: PremiumFeature[] = [
  'calendar-export',
  'premium-print',
  'custom-tasks',
  'household-assignments',
]

export type Entitlements = {
  has: (feature: PremiumFeature) => boolean
  plan: 'free' | 'plus'
  statusMessage: string | null
  offline: boolean
}
