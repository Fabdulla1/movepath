import type {
  ActivationResult,
  DeactivationResult,
  LemonLicenseInstance,
  LemonLicenseKeyRecord,
  LemonLicenseMeta,
  ValidationResult,
} from '../domain/license'

const API_BASE = 'https://api.lemonsqueezy.com/v1/licenses'

export async function activateLicense(licenseKey: string, instanceName: string) {
  return postForm<ActivationResult>('/activate', {
    license_key: licenseKey,
    instance_name: instanceName,
  }).then(parseActivationResult)
}

export async function validateLicense(licenseKey: string, instanceId: string) {
  return postForm<ValidationResult>('/validate', {
    license_key: licenseKey,
    instance_id: instanceId,
  }).then(parseValidationResult)
}

export async function deactivateLicense(licenseKey: string, instanceId: string) {
  return postForm<DeactivationResult>('/deactivate', {
    license_key: licenseKey,
    instance_id: instanceId,
  }).then(parseDeactivationResult)
}

async function postForm<T>(path: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
  })

  const json = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    const error = asRecord(json)?.error
    throw new Error(typeof error === 'string' ? error : 'Unexpected license API error.')
  }

  return json as T
}

function parseActivationResult(value: unknown): ActivationResult {
  const record = asRecord(value)
  return {
    activated: record.activated === true,
    error: normalizeNullableString(record.error),
    licenseKey: parseLicenseKey(record.license_key),
    instance: parseInstance(record.instance),
    meta: parseMeta(record.meta),
  }
}

function parseValidationResult(value: unknown): ValidationResult {
  const record = asRecord(value)
  return {
    valid: record.valid === true,
    error: normalizeNullableString(record.error),
    licenseKey: parseLicenseKey(record.license_key),
    instance: parseInstance(record.instance),
    meta: parseMeta(record.meta),
  }
}

function parseDeactivationResult(value: unknown): DeactivationResult {
  const record = asRecord(value)
  return {
    deactivated: record.deactivated === true,
    error: normalizeNullableString(record.error),
  }
}

function parseLicenseKey(value: unknown): LemonLicenseKeyRecord {
  const record = asRecord(value)
  return {
    id: normalizeNullableId(record.id),
    status: normalizeNullableString(record.status),
    key: normalizeNullableString(record.key),
    activationLimit: typeof record.activation_limit === 'number' ? record.activation_limit : null,
    activationUsage: typeof record.activation_usage === 'number' ? record.activation_usage : null,
    expiresAt: normalizeNullableString(record.expires_at),
  }
}

function parseInstance(value: unknown): LemonLicenseInstance {
  const record = asRecord(value)
  return {
    id: normalizeNullableString(record.id),
    name: normalizeNullableString(record.name),
    createdAt: normalizeNullableString(record.created_at),
  }
}

function parseMeta(value: unknown): LemonLicenseMeta {
  const record = asRecord(value)
  return {
    storeId: normalizeNullableId(record.store_id),
    productId: normalizeNullableId(record.product_id),
    variantId: normalizeNullableId(record.variant_id),
    customerEmail: normalizeNullableString(record.customer_email),
    customerName: normalizeNullableString(record.customer_name),
  }
}

function asRecord(value: unknown) {
  if (!value || typeof value !== 'object') return {} as Record<string, unknown>
  return value as Record<string, unknown>
}

function normalizeNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function normalizeNullableId(value: unknown) {
  if (typeof value === 'number' || typeof value === 'string') return value
  return null
}
