import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LicenseStatusPanel } from '../src/components/LicenseStatusPanel'

describe('LicenseStatusPanel', () => {
  it('offers retry and cancel when full erase cannot remotely deactivate', async () => {
    const onDeactivateAndEraseAll = vi.fn(async () => false)
    const onClearAllLocalData = vi.fn()

    render(
      <LicenseStatusPanel
        license={storedLicense()}
        message={null}
        error={null}
        isValidating={false}
        onValidate={vi.fn(async () => true)}
        onDeactivate={vi.fn(async () => true)}
        onDeactivateAndEraseAll={onDeactivateAndEraseAll}
        onClearLocal={vi.fn()}
        onClearAllLocalData={onClearAllLocalData}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Plus and erase all data' }))
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate and erase' }))

    expect(await screen.findByRole('dialog', { name: 'Remote deactivation failed' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Retry deactivation' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy()
    expect(onDeactivateAndEraseAll).toHaveBeenCalledTimes(1)
    expect(onClearAllLocalData).not.toHaveBeenCalled()
  })

  it('requires another confirmation before clearing local data after failed deactivation', async () => {
    const onClearAllLocalData = vi.fn()

    render(
      <LicenseStatusPanel
        license={storedLicense()}
        message={null}
        error={null}
        isValidating={false}
        onValidate={vi.fn(async () => true)}
        onDeactivate={vi.fn(async () => true)}
        onDeactivateAndEraseAll={vi.fn(async () => false)}
        onClearLocal={vi.fn()}
        onClearAllLocalData={onClearAllLocalData}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Plus and erase all data' }))
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate and erase' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Clear local data anyway' }))

    expect(screen.getByRole('dialog', { name: 'Clear local data without remote deactivation?' })).toBeTruthy()
    expect(onClearAllLocalData).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Clear local data anyway' }))
    expect(onClearAllLocalData).toHaveBeenCalledTimes(1)
  })

  it('links to purchase recovery instructions and Lemon Squeezy My Orders', () => {
    render(
      <LicenseStatusPanel
        license={storedLicense()}
        message={null}
        error={null}
        isValidating={false}
        onValidate={vi.fn(async () => true)}
        onDeactivate={vi.fn(async () => true)}
        onDeactivateAndEraseAll={vi.fn(async () => true)}
        onClearLocal={vi.fn()}
        onClearAllLocalData={vi.fn()}
      />,
    )

    expect(screen.getByRole('link', { name: 'View purchase recovery instructions' }).getAttribute('href')).toBe(
      '#activate',
    )
    expect(screen.getByRole('link', { name: 'Open Lemon Squeezy My Orders' }).getAttribute('href')).toBe(
      'https://app.lemonsqueezy.com/my-orders',
    )
  })
})

function storedLicense() {
  return {
    schemaVersion: 2,
    plan: 'plus' as const,
    purchaseEmail: 'fixture@example.invalid',
    licenseKey: 'fixture-license-key',
    installationId: 'installation-1',
    instanceId: 'instance-1',
    instanceName: 'MovePath Browser abcd1234',
    activatedAt: '2026-07-27T00:00:00.000Z',
    lastValidatedAt: '2026-07-27T00:00:00.000Z',
    offlineValidUntil: '2026-08-03T00:00:00.000Z',
  }
}
