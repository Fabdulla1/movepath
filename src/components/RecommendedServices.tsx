import { featureFlags } from '../config'

export function RecommendedServices() {
  if (!featureFlags.recommendedServices) return null
  return <aside aria-label="Recommended services" />
}
