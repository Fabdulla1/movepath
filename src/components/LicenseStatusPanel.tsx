import { useState } from 'react'
import { ConfirmationDialog } from './ConfirmationDialog'
import { monetizationConfig } from '../config/monetization'
import type { StoredMovePathLicense } from '../domain/types'

type LicenseStatusPanelProps = {
  license: StoredMovePathLicense | null
  message: string | null
  error: string | null
  isValidating: boolean
  onValidate: () => Promise<boolean>
  onDeactivate: () => Promise<boolean>
  onDeactivateAndEraseAll: () => Promise<boolean>
  onClearLocal: () => void
  onClearAllLocalData: () => void
}

export function LicenseStatusPanel({
  license,
  message,
  error,
  isValidating,
  onValidate,
  onDeactivate,
  onDeactivateAndEraseAll,
  onClearLocal,
  onClearAllLocalData,
}: LicenseStatusPanelProps) {
  const [dialog, setDialog] = useState<'erase' | 'deactivation-failed' | 'clear-anyway' | null>(null)
  const [isErasing, setIsErasing] = useState(false)

  async function deactivateAndErase() {
    setIsErasing(true)
    const ok = await onDeactivateAndEraseAll()
    setIsErasing(false)
    setDialog(ok ? null : 'deactivation-failed')
  }

  function clearAnyway() {
    onClearAllLocalData()
    setDialog(null)
  }

  return (
    <section className="status-panel">
      <div className="page-heading">
        <p className="eyebrow">Activation</p>
        <h2>MovePath Plus on this browser</h2>
      </div>
      <p className="status" role="status" aria-live="polite">
        {error || message || (license ? 'MovePath Plus is available on this browser.' : 'MovePath Plus is not active on this browser.')}
      </p>
      <p className="fine-print">Support: {monetizationConfig.supportEmail}</p>
      {license ? (
        <>
          <p className="fine-print">
            Before clearing browser site data, deactivate MovePath Plus on this browser. This releases
            one of your five available activations. If local site data is cleared first, your Lemon
            Squeezy purchase remains valid, but this browser may still count toward the activation limit.
          </p>
          <dl className="license-grid">
            <div>
              <dt>Plan</dt>
              <dd>MovePath Plus</dd>
            </div>
            <div>
              <dt>Purchase email</dt>
              <dd>{license.purchaseEmail}</dd>
            </div>
            <div>
              <dt>Activated</dt>
              <dd>{license.activatedAt.slice(0, 10)}</dd>
            </div>
            <div>
              <dt>Offline grace until</dt>
              <dd>{license.offlineValidUntil.slice(0, 10)}</dd>
            </div>
          </dl>
          <div className="actions">
            <button className="button button--secondary" type="button" onClick={() => void onValidate()} disabled={isValidating}>
              {isValidating ? 'Validating...' : 'Revalidate license'}
            </button>
            <button className="button button--danger" type="button" onClick={() => void onDeactivate()}>
              Deactivate Plus on this browser
            </button>
            <a
              className="button button--secondary"
              href="https://app.lemonsqueezy.com/my-orders"
              target="_blank"
              rel="noreferrer"
            >
              Open Lemon Squeezy My Orders
            </a>
            <a className="button button--secondary" href="#activate">
              View purchase recovery instructions
            </a>
            <button className="button button--secondary" type="button" onClick={onClearLocal}>
              Clear local license data
            </button>
            <button className="button button--danger" type="button" onClick={() => setDialog('erase')}>
              Deactivate Plus and erase all data
            </button>
          </div>
        </>
      ) : null}
      {dialog === 'erase' ? (
        <ConfirmationDialog
          title="Deactivate Plus and erase all data?"
          description="This will attempt to release this browser's MovePath Plus activation, then remove your relocation plan, progress, custom tasks, household assignments, and locally stored license information. You will need your purchase email and license key to restore access. Your Lemon Squeezy purchase itself will not be deleted."
          actions={[
            {
              label: isErasing ? 'Deactivating...' : 'Deactivate and erase',
              onClick: () => void deactivateAndErase(),
              variant: 'danger',
              disabled: isErasing,
            },
          ]}
          onCancel={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'deactivation-failed' ? (
        <ConfirmationDialog
          title="Remote deactivation failed"
          description={`MovePath kept the saved license on this browser because Lemon Squeezy did not confirm deactivation. This browser may still count toward the five-activation limit. Retry deactivation, cancel, or clear local data anyway. Support: ${monetizationConfig.supportEmail}.`}
          actions={[
            {
              label: isErasing ? 'Retrying...' : 'Retry deactivation',
              onClick: () => void deactivateAndErase(),
              variant: 'primary',
              disabled: isErasing,
            },
            {
              label: 'Clear local data anyway',
              onClick: () => setDialog('clear-anyway'),
              variant: 'danger',
            },
          ]}
          onCancel={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'clear-anyway' ? (
        <ConfirmationDialog
          title="Clear local data without remote deactivation?"
          description={`This removes the saved license and relocation data only from this browser. If Lemon Squeezy still has this activation instance, you may need support to release the abandoned activation slot. Your purchase remains in Lemon Squeezy. Support: ${monetizationConfig.supportEmail}.`}
          actions={[
            {
              label: 'Clear local data anyway',
              onClick: clearAnyway,
              variant: 'danger',
            },
          ]}
          onCancel={() => setDialog('deactivation-failed')}
        />
      ) : null}
    </section>
  )
}
