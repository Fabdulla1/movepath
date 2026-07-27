import type { StoredMovePathLicense } from './types'

export type LemonLicenseMeta = {
  storeId: number | string | null
  productId: number | string | null
  variantId: number | string | null
  customerEmail: string | null
  customerName: string | null
}

export type LemonLicenseKeyRecord = {
  id: number | string | null
  status: string | null
  key: string | null
  activationLimit: number | null
  activationUsage: number | null
  expiresAt: string | null
}

export type LemonLicenseInstance = {
  id: string | null
  name: string | null
  createdAt: string | null
}

export type ActivationResult = {
  activated: boolean
  error: string | null
  licenseKey: LemonLicenseKeyRecord
  instance: LemonLicenseInstance
  meta: LemonLicenseMeta
}

export type ValidationResult = {
  valid: boolean
  error: string | null
  licenseKey: LemonLicenseKeyRecord
  instance: LemonLicenseInstance
  meta: LemonLicenseMeta
}

export type DeactivationResult = {
  deactivated: boolean
  error: string | null
}

export type LicenseFailureReason =
  | 'invalid-key'
  | 'wrong-email'
  | 'activation-limit'
  | 'disabled'
  | 'expired'
  | 'product-mismatch'
  | 'network'
  | 'missing-config'
  | 'unexpected'
  | 'rate-limited'
  | 'not-validated'

export type LicenseCheckResult =
  | {
      ok: true
      license: StoredMovePathLicense
      offline: boolean
      message: string | null
    }
  | {
      ok: false
      reason: LicenseFailureReason
      message: string
    }
