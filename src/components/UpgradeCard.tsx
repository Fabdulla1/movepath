import { monetizationConfig } from '../config/monetization'

type UpgradeCardProps = {
  title?: string
  description?: string
  compact?: boolean
}

export function UpgradeCard({
  title = 'MovePath Plus',
  description = 'Unlock calendar export, premium print, custom tasks, and household assignments with a one-time purchase.',
  compact = false,
}: UpgradeCardProps) {
  return (
    <section className={`upgrade-card ${compact ? 'upgrade-card--compact' : ''}`}>
      <p className="eyebrow">MovePath Plus</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <p className="price-line">One-time purchase: $4.99</p>
      <ul className="feature-list">
        <li>Calendar export</li>
        <li>Premium printable relocation plan</li>
        <li>Custom tasks and due dates</li>
        <li>Household task assignments</li>
        <li>Up to five browser or device activations</li>
        <li>No subscription</li>
      </ul>
      <div className="actions">
        <a className="button button--primary" href={monetizationConfig.checkoutUrl} target="_blank" rel="noreferrer">
          Unlock MovePath Plus
        </a>
        <a className="button button--secondary" href="#activate">
          Already purchased? Activate Plus
        </a>
      </div>
      <p className="fine-print">
        Checkout opens in Lemon Squeezy. Returning from checkout does not unlock Plus until the
        license is activated on this browser.
      </p>
    </section>
  )
}
