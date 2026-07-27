import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LicenseActivationForm } from '../src/components/LicenseActivationForm'

describe('LicenseActivationForm', () => {
  it('shows accessible validation errors', async () => {
    const onActivate = vi.fn(async () => false)
    render(<LicenseActivationForm onActivate={onActivate} isActivating={false} />)

    fireEvent.submit(screen.getByRole('button', { name: 'Activate MovePath Plus' }))

    expect(await screen.findByText('Enter the purchase email used at checkout.')).toBeTruthy()
    expect(await screen.findByText('Enter your license key.')).toBeTruthy()
    expect(onActivate).not.toHaveBeenCalled()
  })

  it('submits the purchase email and key', async () => {
    const onActivate = vi.fn(async () => true)
    render(<LicenseActivationForm onActivate={onActivate} isActivating={false} />)

    fireEvent.change(screen.getByLabelText('Purchase email'), {
      target: { value: 'buyer@example.com' },
    })
    fireEvent.change(screen.getByLabelText('License key'), {
      target: { value: 'license-key-1' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Activate MovePath Plus' }))

    expect(onActivate).toHaveBeenCalledWith('buyer@example.com', 'license-key-1')
  })
})
