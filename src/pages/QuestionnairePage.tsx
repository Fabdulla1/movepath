import { useState } from 'react'
import type { UserRelocationProfile } from '../domain/types'

type QuestionnairePageProps = {
  initialProfile: Partial<UserRelocationProfile> | null
  onCancel: () => void
  onSubmit: (profile: UserRelocationProfile) => void
}

const emptyProfile: UserRelocationProfile = {
  arrivalDate: '',
  purpose: 'employment',
  expectedStay: 'long',
  employment: 'german-employer',
  visaStatus: 'not-started',
  housing: 'searching',
  movingWith: 'alone',
  pets: 'none',
  bringingVehicle: false,
  destinationCity: '',
  healthInsurance: 'not-arranged',
}

export function QuestionnairePage({ initialProfile, onCancel, onSubmit }: QuestionnairePageProps) {
  const [profile, setProfile] = useState<UserRelocationProfile>({
    ...emptyProfile,
    ...initialProfile,
  })
  const [submitted, setSubmitted] = useState(false)
  const arrivalError = submitted && !profile.arrivalDate ? 'Enter your planned arrival date.' : ''
  const cityError = submitted && !profile.destinationCity.trim() ? 'Enter your destination city.' : ''

  function update<Key extends keyof UserRelocationProfile>(
    key: Key,
    value: UserRelocationProfile[Key],
  ) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!profile.arrivalDate || !profile.destinationCity.trim()) return
    onSubmit({ ...profile, destinationCity: profile.destinationCity.trim() })
  }

  return (
    <main className="page-shell">
      <form className="questionnaire" onSubmit={handleSubmit} noValidate>
        <div className="page-heading">
          <p className="eyebrow">Questionnaire</p>
          <h1>Build your MovePath checklist</h1>
          <p>Answer a short set of planning questions. You can edit these answers later.</p>
        </div>

        <div className="form-grid">
          <label>
            Planned arrival date
            <input
              type="date"
              value={profile.arrivalDate}
              onChange={(event) => update('arrivalDate', event.target.value)}
              aria-invalid={Boolean(arrivalError)}
              aria-describedby={arrivalError ? 'arrival-error' : undefined}
              required
            />
            {arrivalError ? <span id="arrival-error" className="field-error">{arrivalError}</span> : null}
          </label>

          <label>
            Destination city
            <input
              value={profile.destinationCity}
              onChange={(event) => update('destinationCity', event.target.value)}
              placeholder="Berlin, Munich, Hamburg..."
              aria-invalid={Boolean(cityError)}
              aria-describedby={cityError ? 'city-error' : undefined}
              required
            />
            {cityError ? <span id="city-error" className="field-error">{cityError}</span> : null}
          </label>

          <Select label="Purpose of move" value={profile.purpose} onChange={(value) => update('purpose', value)}>
            <option value="employment">Employment</option>
            <option value="study">Study</option>
            <option value="family">Family</option>
            <option value="other">Other</option>
          </Select>

          <Select label="Expected stay" value={profile.expectedStay} onChange={(value) => update('expectedStay', value)}>
            <option value="short">90 days or less</option>
            <option value="long">More than 90 days</option>
          </Select>

          <Select label="Employment arrangement" value={profile.employment} onChange={(value) => update('employment', value)}>
            <option value="german-employer">German employer</option>
            <option value="remote-employer">Remote employer outside Germany</option>
            <option value="self-employed">Self-employed</option>
            <option value="not-working">Not working</option>
          </Select>

          <Select label="Visa or residence status" value={profile.visaStatus} onChange={(value) => update('visaStatus', value)}>
            <option value="not-started">Not started</option>
            <option value="in-progress">Application in progress</option>
            <option value="approved">Already approved</option>
            <option value="unsure">Unsure</option>
          </Select>

          <Select label="Housing status" value={profile.housing} onChange={(value) => update('housing', value)}>
            <option value="permanent">Permanent housing secured</option>
            <option value="temporary">Temporary housing secured</option>
            <option value="searching">Still searching</option>
          </Select>

          <Select label="Moving" value={profile.movingWith} onChange={(value) => update('movingWith', value)}>
            <option value="alone">Alone</option>
            <option value="partner">With partner</option>
            <option value="family">With family or children</option>
          </Select>

          <Select label="Bringing pets" value={profile.pets} onChange={(value) => update('pets', value)}>
            <option value="none">None</option>
            <option value="cat-or-dog">Cat or dog</option>
            <option value="other">Other animals</option>
          </Select>

          <Select label="Bringing a vehicle" value={profile.bringingVehicle ? 'yes' : 'no'} onChange={(value) => update('bringingVehicle', value === 'yes')}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>

          <Select label="Health insurance status" value={profile.healthInsurance} onChange={(value) => update('healthInsurance', value)}>
            <option value="not-arranged">Not arranged</option>
            <option value="temporary">Travel or temporary coverage</option>
            <option value="german-arranged">German coverage arranged</option>
            <option value="unsure">Unsure</option>
          </Select>
        </div>

        <div className="actions">
          <button className="button button--primary" type="submit">Generate checklist</button>
          <button className="button button--secondary" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </main>
  )
}

type SelectProps<Value extends string> = {
  label: string
  value: Value
  onChange: (value: Value) => void
  children: React.ReactNode
}

function Select<Value extends string>({ label, value, onChange, children }: SelectProps<Value>) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as Value)} required>
        {children}
      </select>
    </label>
  )
}
