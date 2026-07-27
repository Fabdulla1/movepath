import { monetizationConfig } from '../config/monetization'
import type {
  ActivationResult,
  LicenseCheckResult,
  LicenseFailureReason,
  ValidationResult,
} from '../domain/license'
import type { StoredMovePathLicense } from '../domain/types'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const GRACE_DAYS_MS = 7 * ONE_DAY_MS

export function normalizePurchaseEmail(email: string) {
  return email.trim().toLowerCase()
}

export function buildStoredLicense(
  purchaseEmail: string,
  licenseKey: string,
  installationId: string,
  instanceName: string,
  instanceId: string,
): StoredMovePathLicense {
  const now = new Date().toISOString()
  return {
    schemaVersion: 2,
    plan: 'plus',
    purchaseEmail: normalizePurchaseEmail(purchaseEmail),
    licenseKey,
    installationId,
    instanceId,
    instanceName,
    activatedAt: now,
    lastValidatedAt: now,
    offlineValidUntil: new Date(Date.now() + GRACE_DAYS_MS).toISOString(),
  }
}

export function evaluateActivation(
  purchaseEmail: string,
  installationId: string,
  instanceName: string,
  result: ActivationResult,
): LicenseCheckResult {
  if (!monetizationConfig.isConfigured) {
    return failure('missing-config', 'MovePath Plus activation is not fully configured yet.')
  }

  if (!result.activated || result.error || result.licenseKey.status !== 'active') {
    return failure(mapApiError(result.error, result.licenseKey.status), userMessage(result.error))
  }

  if (
    !matchesId(result.meta.storeId, monetizationConfig.storeId) ||
    !matchesId(result.meta.productId, monetizationConfig.productId) ||
    !matchesId(result.meta.variantId, monetizationConfig.variantId)
  ) {
    return failure('product-mismatch', 'This license key does not match the configured MovePath Plus product.')
  }

  if (normalizePurchaseEmail(result.meta.customerEmail || '') !== normalizePurchaseEmail(purchaseEmail)) {
    return failure('wrong-email', 'The purchase email does not match this license key.')
  }

  if (!result.instance.id) {
    return failure('unexpected', 'MovePath Plus activation did not return an installation record.')
  }

    return {
      ok: true,
      license: buildStoredLicense(
        purchaseEmail,
        result.licenseKey.key || '',
        installationId,
        instanceName,
        result.instance.id,
      ),
      offline: false,
      message: null,
    }
}

export function evaluateValidation(
  stored: StoredMovePathLicense,
  result: ValidationResult,
): LicenseCheckResult {
  if (!result.valid || result.error || result.licenseKey.status !== 'active') {
    return failure(mapApiError(result.error, result.licenseKey.status), userMessage(result.error))
  }

  if (
    !result.instance.id ||
    result.instance.id !== stored.instanceId ||
    !matchesId(result.meta.storeId, monetizationConfig.storeId) ||
    !matchesId(result.meta.productId, monetizationConfig.productId) ||
    !matchesId(result.meta.variantId, monetizationConfig.variantId) ||
    normalizePurchaseEmail(result.meta.customerEmail || '') !== stored.purchaseEmail
  ) {
    return failure('product-mismatch', 'The saved license no longer matches this MovePath Plus installation.')
  }

  return {
    ok: true,
    license: {
      ...stored,
      lastValidatedAt: new Date().toISOString(),
      offlineValidUntil: new Date(Date.now() + GRACE_DAYS_MS).toISOString(),
    },
    offline: false,
    message: null,
  }
}

export function evaluateStoredLicense(stored: StoredMovePathLicense | null): LicenseCheckResult {
  if (!stored) return failure('not-validated', 'MovePath Plus is not active on this browser.')
  if (!monetizationConfig.isConfigured) {
    return failure('missing-config', 'MovePath Plus activation is not fully configured yet.')
  }

  const now = Date.now()
  const offlineUntil = Date.parse(stored.offlineValidUntil)
  if (Number.isNaN(offlineUntil) || offlineUntil < now) {
    return failure('not-validated', 'MovePath Plus needs a fresh license validation before premium features can be used.')
  }

  return {
    ok: true,
    license: stored,
    offline: Date.parse(stored.lastValidatedAt) + ONE_DAY_MS < now,
    message:
      Date.parse(stored.lastValidatedAt) + ONE_DAY_MS < now
        ? 'Using the last successful license validation while offline.'
        : null,
  }
}

export function shouldValidateOnOpen(stored: StoredMovePathLicense | null) {
  if (!stored) return false
  const validatedAt = Date.parse(stored.lastValidatedAt)
  return Number.isNaN(validatedAt) || validatedAt + ONE_DAY_MS < Date.now()
}

function matchesId(actual: number | string | null, expected: string) {
  return String(actual ?? '') === String(expected)
}

function failure(reason: LicenseFailureReason, message: string): LicenseCheckResult {
  return { ok: false, reason, message }
}

function mapApiError(error: string | null, status: string | null): LicenseFailureReason {
  const normalized = (error || '').toLowerCase()
  if (normalized.includes('activation limit')) return 'activation-limit'
  if (normalized.includes('email')) return 'wrong-email'
  if (normalized.includes('expired') || status === 'expired') return 'expired'
  if (normalized.includes('disabled') || status === 'disabled') return 'disabled'
  if (normalized.includes('429') || normalized.includes('rate')) return 'rate-limited'
  if (normalized.includes('invalid') || normalized.includes('not found')) return 'invalid-key'
  return 'unexpected'
}

function userMessage(error: string | null) {
  if (!error) return 'The license could not be verified.'
  return error
}
