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
      target: { value: 'fixture@example.invalid' },
    })
    fireEvent.change(screen.getByLabelText('License key'), {
      target: { value: 'fixture-license-key' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Activate MovePath Plus' }))

    expect(onActivate).toHaveBeenCalledWith('fixture@example.invalid', 'fixture-license-key')
  })

  it('links to Lemon Squeezy My Orders for purchase restoration', () => {
    render(<LicenseActivationForm onActivate={vi.fn(async () => false)} isActivating={false} />)

    const link = screen.getByRole('link', { name: 'Find my order' })
    expect(link.getAttribute('href')).toBe('https://app.lemonsqueezy.com/my-orders')
    expect(link.getAttribute('target')).toBe('_blank')
  })
})
