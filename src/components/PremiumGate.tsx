import type { ReactNode } from 'react'
import type { Entitlements } from '../domain/entitlement'
import type { PremiumFeature } from '../domain/types'
import { UpgradeCard } from './UpgradeCard'

type PremiumGateProps = {
  entitlements: Entitlements
  feature: PremiumFeature
  children: ReactNode
  title: string
}

export function PremiumGate({ entitlements, feature, children, title }: PremiumGateProps) {
  if (entitlements.has(feature)) return <>{children}</>

  return (
    <div className="premium-gate">
      <UpgradeCard
        compact
        title={`${title} is part of MovePath Plus`}
        description="The free checklist stays fully available. This control unlocks after a one-time Plus purchase and browser activation."
      />
    </div>
  )
}
