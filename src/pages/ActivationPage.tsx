import { monetizationConfig } from '../config/monetization'
import type { StoredMovePathLicense } from '../domain/types'
import { LicenseActivationForm } from '../components/LicenseActivationForm'
import { LicenseStatusPanel } from '../components/LicenseStatusPanel'
import { UpgradeCard } from '../components/UpgradeCard'

type ActivationPageProps = {
  license: StoredMovePathLicense | null
  message: string | null
  error: string | null
  isActivating: boolean
  isValidating: boolean
  onActivate: (purchaseEmail: string, licenseKey: string) => Promise<boolean>
  onValidate: () => Promise<boolean>
  onDeactivate: () => Promise<boolean>
  onClearLocal: () => void
}

export function ActivationPage(props: ActivationPageProps) {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow">MovePath Plus</p>
        <h1>Activate or restore MovePath Plus</h1>
        <p>
          Purchase uses a hosted Lemon Squeezy checkout. Returning from checkout is not treated as
          proof of purchase. Plus unlocks only after this browser successfully activates and
          validates a license key.
        </p>
      </section>

      <div className="stack-grid">
        <UpgradeCard compact />
        <section className="questionnaire">
          <h2>Activate your license</h2>
          <p className="status">
            Enter the purchase email and license key from your Lemon Squeezy receipt or My Orders.
          </p>
          <LicenseActivationForm
            onActivate={props.onActivate}
            isActivating={props.isActivating}
          />
          <p className="fine-print">
            Test mode status: {monetizationConfig.isTestModeUrl ? 'Configured with the provided test checkout URL.' : 'Checkout URL is not the provided test URL.'}
          </p>
          <p className="fine-print">Support: {monetizationConfig.supportEmail}</p>
        </section>
        <LicenseStatusPanel
          license={props.license}
          message={props.message}
          error={props.error}
          isValidating={props.isValidating}
          onValidate={props.onValidate}
          onDeactivate={props.onDeactivate}
          onClearLocal={props.onClearLocal}
        />
      </div>
    </main>
  )
}
