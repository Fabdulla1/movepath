import { monetizationConfig } from '../config/monetization'
import type { StoredMovePathLicense } from '../domain/types'

type LicenseStatusPanelProps = {
  license: StoredMovePathLicense | null
  message: string | null
  error: string | null
  isValidating: boolean
  onValidate: () => Promise<boolean>
  onDeactivate: () => Promise<boolean>
  onClearLocal: () => void
}

export function LicenseStatusPanel({
  license,
  message,
  error,
  isValidating,
  onValidate,
  onDeactivate,
  onClearLocal,
}: LicenseStatusPanelProps) {
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
              {isValidating ? 'Validating...' : 'Validate license now'}
            </button>
            <button className="button button--danger" type="button" onClick={() => void onDeactivate()}>
              Deactivate Plus on this browser
            </button>
            <button className="button button--secondary" type="button" onClick={onClearLocal}>
              Clear local license data
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
