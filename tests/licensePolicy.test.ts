import { beforeEach, describe, expect, it } from 'vitest'
import { monetizationConfig } from '../src/config/monetization'
import {
  evaluateActivation,
  evaluateStoredLicense,
  evaluateValidation,
  shouldValidateOnOpen,
} from '../src/services/licensePolicy'
import type { ActivationResult, ValidationResult } from '../src/domain/license'
import type { StoredMovePathLicense } from '../src/domain/types'

describe('license policy', () => {
  beforeEach(() => {
    monetizationConfig.storeId = '10'
    monetizationConfig.productId = '20'
    monetizationConfig.variantId = '30'
    monetizationConfig.supportEmail = 'support@movepath.online'
    monetizationConfig.isConfigured = true
    monetizationConfig.missing = []
  })

  it('accepts a successful activation with matching metadata', () => {
    const result = evaluateActivation(
      'Buyer@example.com',
      'installation-1',
      'MovePath Browser abcd1234',
      activationResult(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.license.purchaseEmail).toBe('buyer@example.com')
      expect(result.license.instanceId).toBe('instance-1')
    }
  })

  it('rejects the wrong purchase email', () => {
    const result = evaluateActivation(
      'different@example.com',
      'installation-1',
      'MovePath Browser abcd1234',
      activationResult(),
    )

    expect(result).toEqual({
      ok: false,
      reason: 'wrong-email',
      message: 'The purchase email does not match this license key.',
    })
  })

  it('rejects the wrong store id', () => {
    const result = evaluateActivation(
      'buyer@example.com',
      'installation-1',
      'MovePath Browser abcd1234',
      activationResult({ meta: { storeId: 999 } }),
    )

    expect(result).toEqual({
      ok: false,
      reason: 'product-mismatch',
      message: 'This license key does not match the configured MovePath Plus product.',
    })
  })

  it('rejects activation-limit responses', () => {
    const result = evaluateActivation(
      'buyer@example.com',
      'installation-1',
      'MovePath Browser abcd1234',
      activationResult({
        activated: false,
        error: 'This license key has reached the activation limit.',
      }),
    )

    expect(result).toEqual({
      ok: false,
      reason: 'activation-limit',
      message: 'This license key has reached the activation limit.',
    })
  })

  it('accepts a successful validation and refreshes grace dates', () => {
    const result = evaluateValidation(storedLicense(), validationResult())
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.license.lastValidatedAt).toMatch(/^20/)
      expect(result.offline).toBe(false)
    }
  })

  it('rejects disabled licenses', () => {
    const result = evaluateValidation(
      storedLicense(),
      validationResult({ licenseKey: { status: 'disabled' }, valid: false, error: 'License is disabled.' }),
    )

    expect(result).toEqual({
      ok: false,
      reason: 'disabled',
      message: 'License is disabled.',
    })
  })

  it('allows offline grace for a previously validated license', () => {
    const result = evaluateStoredLicense(storedLicense())
    expect(result.ok).toBe(true)
  })

  it('fails closed for an expired grace window', () => {
    const expired = storedLicense({
      offlineValidUntil: '2026-07-01T00:00:00.000Z',
      lastValidatedAt: '2026-07-01T00:00:00.000Z',
    })
    const result = evaluateStoredLicense(expired)

    expect(result).toEqual({
      ok: false,
      reason: 'not-validated',
      message: 'MovePath Plus needs a fresh license validation before premium features can be used.',
    })
  })

  it('requests validation when the last successful validation is older than one day', () => {
    expect(shouldValidateOnOpen(storedLicense({ lastValidatedAt: '2026-07-20T00:00:00.000Z' }))).toBe(true)
    expect(shouldValidateOnOpen(storedLicense({ lastValidatedAt: new Date().toISOString() }))).toBe(false)
  })
})

function activationResult(
  overrides?: Partial<{
    activated: boolean
    error: string | null
    meta: Partial<{ storeId: number; productId: number; variantId: number; customerEmail: string }>
  }>,
): ActivationResult {
  return {
    activated: overrides?.activated ?? true,
    error: overrides?.error ?? null,
    licenseKey: {
      id: 1,
      status: 'active',
      key: 'license-key-1',
      activationLimit: 5,
      activationUsage: 1,
      expiresAt: null,
    },
    instance: {
      id: 'instance-1',
      name: 'MovePath Browser abcd1234',
      createdAt: '2026-07-27T00:00:00.000Z',
    },
    meta: {
      storeId: overrides?.meta?.storeId ?? 10,
      productId: overrides?.meta?.productId ?? 20,
      variantId: overrides?.meta?.variantId ?? 30,
      customerEmail: overrides?.meta?.customerEmail ?? 'buyer@example.com',
      customerName: 'Buyer',
    },
  }
}

function validationResult(
  overrides?: Partial<{
    valid: boolean
    error: string | null
    licenseKey: Partial<{ status: string }>
  }>,
): ValidationResult {
  return {
    valid: overrides?.valid ?? true,
    error: overrides?.error ?? null,
    licenseKey: {
      id: 1,
      status: overrides?.licenseKey?.status ?? 'active',
      key: 'license-key-1',
      activationLimit: 5,
      activationUsage: 1,
      expiresAt: null,
    },
    instance: {
      id: 'instance-1',
      name: 'MovePath Browser abcd1234',
      createdAt: '2026-07-27T00:00:00.000Z',
    },
    meta: {
      storeId: 10,
      productId: 20,
      variantId: 30,
      customerEmail: 'buyer@example.com',
      customerName: 'Buyer',
    },
  }
}

function storedLicense(overrides?: Partial<StoredMovePathLicense>): StoredMovePathLicense {
  return {
    schemaVersion: 2,
    plan: 'plus',
    purchaseEmail: 'buyer@example.com',
    licenseKey: 'license-key-1',
    installationId: 'installation-1',
    instanceId: 'instance-1',
    instanceName: 'MovePath Browser abcd1234',
    activatedAt: '2026-07-20T00:00:00.000Z',
    lastValidatedAt: '2026-07-27T00:00:00.000Z',
    offlineValidUntil: '2026-08-03T00:00:00.000Z',
    ...overrides,
  }
}
