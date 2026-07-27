import { monetizationConfig } from '../config/monetization'
import type { Entitlements } from '../domain/entitlement'
import type { LicenseCheckResult } from '../domain/license'
import { premiumFeatures } from '../domain/entitlement'

export function buildEntitlements(result: LicenseCheckResult): Entitlements {
  if (!result.ok) {
    return {
      has: () => false,
      plan: 'free',
      statusMessage:
        result.reason === 'missing-config'
          ? `MovePath Plus activation needs configuration: ${monetizationConfig.missing.join(', ')}`
          : null,
      offline: false,
    }
  }

  return {
    has: (feature) => premiumFeatures.includes(feature),
    plan: 'plus',
    statusMessage: result.message,
    offline: result.offline,
  }
}
