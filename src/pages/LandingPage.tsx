import { usToGermanyRulePack } from '../data/routes/us-to-germany'
import { UpgradeCard } from '../components/UpgradeCard'

type LandingPageProps = {
  onStart: () => void
  onResume: () => void
  hasPlan: boolean
}

export function LandingPage({ onStart, onResume, hasPlan }: LandingPageProps) {
  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
          <p className="eyebrow">MovePath · United States to Germany</p>
          <h1 id="hero-title">Moving from the United States to Germany?</h1>
          <p className="hero__copy">
            Build a personalized relocation timeline based on your move date, employment, housing,
            family, pets, vehicle plans, and health-insurance status.
          </p>
          <div className="actions no-print">
            <button className="button button--primary" type="button" onClick={onStart}>
              Build my checklist
            </button>
            {hasPlan ? (
              <button className="button button--secondary" type="button" onClick={onResume}>
                Resume saved plan
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="content-band">
        <div className="example-grid">
          <article>
            <h2>What your plan includes</h2>
            <p>
              Dated tasks before departure, during your first week, and through ongoing annual
              maintenance, with required documents and official sources attached.
            </p>
          </article>
          <article>
            <h2>Private by design</h2>
            <p>
              Your answers and progress are stored only in this browser. MovePath has no backend,
              accounts, analytics, ads, or server-side personal-data storage.
            </p>
          </article>
          <article>
            <h2>First release scope</h2>
            <p>
              This MVP currently supports U.S. citizens relocating from the United States to Germany.
              Additional routes can be added later through separate rule packs.
            </p>
          </article>
        </div>
      </section>

      <section className="content-band">
        <UpgradeCard />
      </section>

      <section className="disclaimer" aria-label="Informational disclaimer">
        <strong>Informational disclaimer.</strong> MovePath provides organizational information and
        does not provide legal, immigration, tax, financial, or insurance advice. Confirm current
        requirements with the responsible authority or a qualified adviser.
        <span> Last reviewed: {usToGermanyRulePack.lastReviewed}.</span>
      </section>
    </main>
  )
}
