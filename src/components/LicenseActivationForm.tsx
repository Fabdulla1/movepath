import { useState } from 'react'

type LicenseActivationFormProps = {
  onActivate: (purchaseEmail: string, licenseKey: string) => Promise<boolean>
  isActivating: boolean
}

export function LicenseActivationForm({
  onActivate,
  isActivating,
}: LicenseActivationFormProps) {
  const [purchaseEmail, setPurchaseEmail] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const emailError =
    submitted && !purchaseEmail.trim() ? 'Enter the purchase email used at checkout.' : ''
  const keyError = submitted && !licenseKey.trim() ? 'Enter your license key.' : ''

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!purchaseEmail.trim() || !licenseKey.trim()) return
    const success = await onActivate(purchaseEmail, licenseKey)
    if (success) {
      setLicenseKey('')
    }
  }

  return (
    <form className="activation-form" onSubmit={handleSubmit} noValidate>
      <label>
        Purchase email
        <input
          type="email"
          autoComplete="email"
          value={purchaseEmail}
          onChange={(event) => setPurchaseEmail(event.target.value)}
          aria-invalid={Boolean(emailError)}
        />
        {emailError ? <span className="field-error">{emailError}</span> : null}
      </label>
      <label>
        License key
        <input
          type="password"
          autoComplete="off"
          value={licenseKey}
          onChange={(event) => setLicenseKey(event.target.value)}
          aria-invalid={Boolean(keyError)}
        />
        {keyError ? <span className="field-error">{keyError}</span> : null}
      </label>
      <div className="actions">
        <button className="button button--primary" type="submit" disabled={isActivating}>
          {isActivating ? 'Activating...' : 'Activate MovePath Plus'}
        </button>
        <a className="button button--secondary" href="https://movepath.online/#activate">
          Restore MovePath Plus
        </a>
      </div>
    </form>
  )
}
