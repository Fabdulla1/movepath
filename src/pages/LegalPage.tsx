import { monetizationConfig } from '../config/monetization'

type LegalPageProps = {
  kind: 'privacy' | 'terms' | 'refund' | 'contact' | 'disclaimer'
}

export function LegalPage({ kind }: LegalPageProps) {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      body: [
        'MovePath stores questionnaire answers, checklist progress, custom tasks, household assignments, and any activated MovePath Plus license data in your browser storage.',
        'After activation, the purchase email and license key are stored locally so this static application can validate MovePath Plus without a backend.',
        'Resetting your relocation plan keeps MovePath Plus connected to this browser. Clearing cookies and site data or local storage removes the saved activation, but your Lemon Squeezy purchase remains valid and can be restored with your purchase email and license key.',
        'Deactivate MovePath Plus before clearing browser site data when possible. Clearing local storage first may leave the browser activation counted by Lemon Squeezy until support releases it.',
        'License activation, validation, and deactivation requests are sent directly from your browser to Lemon Squeezy. Lemon Squeezy separately handles checkout and payment information.',
        'Clearing browser storage may remove local checklist progress, local custom tasks, and local activation state.',
      ],
    },
    terms: {
      title: 'Terms of Use',
      body: [
        'MovePath is operated as an independent project based in the United States.',
        'MovePath provides organizational relocation information and software features for personal planning. It does not provide legal, immigration, tax, financial, or insurance advice.',
        'MovePath Plus is a one-time purchase that unlocks client-side premium features after successful license activation and validation.',
        'Each purchase supports up to five browser or device activations. Deactivate old browsers before clearing site data when possible so those activations can be reused.',
      ],
    },
    refund: {
      title: 'Refund Policy',
      body: [
        'Refund terms should be reviewed and completed with the operator\'s final policy before live launch.',
        `Until finalized, use ${monetizationConfig.supportEmail} for refund questions related to MovePath Plus test purchases.`,
      ],
    },
    contact: {
      title: 'Contact',
      body: [
        `Support email: ${monetizationConfig.supportEmail}`,
        'Operator legal details are not listed on this page.',
        'If you lose your local activation or reach the activation limit, include your purchase email when contacting support. Do not send full license keys unless support specifically asks for them.',
      ],
    },
    disclaimer: {
      title: 'Disclaimer',
      body: [
        'MovePath provides organizational information for relocation planning and does not provide legal, immigration, tax, financial, or insurance advice.',
        'Always confirm current requirements with the responsible authority or a qualified adviser.',
      ],
    },
  }[kind]

  return (
    <main className="page-shell legal-page">
      <section className="page-heading">
        <p className="eyebrow">MovePath</p>
        <h1>{content.title}</h1>
      </section>
      <section className="questionnaire legal-copy">
        {content.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
    </main>
  )
}
