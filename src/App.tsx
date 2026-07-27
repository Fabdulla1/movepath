import { startTransition, useEffect, useState } from 'react'
import './styles/app.css'
import { useStoredState } from './hooks/useStoredState'
import { ActivationPage } from './pages/ActivationPage'
import { ChecklistPage } from './pages/ChecklistPage'
import { LandingPage } from './pages/LandingPage'
import { LegalPage } from './pages/LegalPage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { SiteFooter } from './components/SiteFooter'
import { isCompleteProfile } from './utils/profile'

type View =
  | 'landing'
  | 'questionnaire'
  | 'checklist'
  | 'activate'
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'contact'
  | 'disclaimer'

function App() {
  const {
    state,
    tasks,
    entitlements,
    licenseError,
    licenseMessage,
    isActivating,
    isValidating,
    saveProfile,
    setTaskCompleted,
    setTaskAssignment,
    upsertCustomTask,
    editCustomTask,
    deleteCustomTask,
    activatePlus,
    refreshLicense,
    deactivatePlus,
    deactivatePlusAndEraseAllData,
    clearLocalLicenseData,
    clearAllLocalData,
    resetRelocationPlan,
  } = useStoredState()
  const hasPlan = isCompleteProfile(state.profile)
  const [view, setView] = useState<View>(() => resolveViewFromHash(hasPlan))

  useEffect(() => {
    const onHashChange = () => {
      startTransition(() => {
        setView(resolveViewFromHash(hasPlan))
      })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [hasPlan])

  if (view === 'questionnaire') {
    return withFooter(
      <QuestionnairePage
        initialProfile={state.profile}
        onCancel={() => navigate(hasPlan ? 'checklist' : 'landing', setView)}
        onSubmit={(profile) => {
          saveProfile(profile)
          navigate('checklist', setView)
        }}
      />,
    )
  }

  if (view === 'checklist' && hasPlan) {
    return withFooter(
      <ChecklistPage
        state={state}
        tasks={tasks}
        entitlements={entitlements}
        licenseMessage={licenseMessage}
        onToggleTask={setTaskCompleted}
        onAssignTask={setTaskAssignment}
        onAddCustomTask={upsertCustomTask}
        onEditCustomTask={editCustomTask}
        onDeleteCustomTask={deleteCustomTask}
        onValidatePlus={() => refreshLicense(true)}
        onEditAnswers={() => navigate('questionnaire', setView)}
        onReset={() => {
          resetRelocationPlan()
          navigate('landing', setView)
        }}
      />,
    )
  }

  if (view === 'activate') {
    return withFooter(
      <ActivationPage
        license={state.license}
        message={licenseMessage}
        error={licenseError}
        isActivating={isActivating}
        isValidating={isValidating}
        onActivate={activatePlus}
        onValidate={() => refreshLicense(true)}
        onDeactivate={deactivatePlus}
        onDeactivateAndEraseAll={async () => {
          const ok = await deactivatePlusAndEraseAllData()
          if (ok) navigate('landing', setView)
          return ok
        }}
        onClearLocal={clearLocalLicenseData}
        onClearAllLocalData={clearAllLocalData}
      />,
    )
  }

  if (['privacy', 'terms', 'refund', 'contact', 'disclaimer'].includes(view)) {
    return withFooter(
      <LegalPage kind={view as 'privacy' | 'terms' | 'refund' | 'contact' | 'disclaimer'} />,
    )
  }

  return withFooter(
    <LandingPage
      hasPlan={hasPlan}
      onStart={() => navigate('questionnaire', setView)}
      onResume={() => navigate('checklist', setView)}
    />,
  )
}

export default App

function resolveViewFromHash(hasPlan: boolean): View {
  const hash = window.location.hash.replace('#', '')
  switch (hash) {
    case 'activate':
    case 'privacy':
    case 'terms':
    case 'refund':
    case 'contact':
    case 'disclaimer':
      return hash
    default:
      return hasPlan ? 'checklist' : 'landing'
  }
}

function navigate(view: View, setView: (view: View) => void) {
  const hashMap: Record<View, string> = {
    landing: '',
    questionnaire: '',
    checklist: '',
    activate: '#activate',
    privacy: '#privacy',
    terms: '#terms',
    refund: '#refund',
    contact: '#contact',
    disclaimer: '#disclaimer',
  }
  window.location.hash = hashMap[view]
  setView(view)
}

function withFooter(content: React.ReactNode) {
  return (
    <>
      {content}
      <SiteFooter />
    </>
  )
}
