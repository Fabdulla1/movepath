import { useState } from 'react'
import './styles/app.css'
import { useStoredState } from './hooks/useStoredState'
import { ChecklistPage } from './pages/ChecklistPage'
import { LandingPage } from './pages/LandingPage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { isCompleteProfile } from './utils/profile'

type View = 'landing' | 'questionnaire' | 'checklist'

function App() {
  const { state, tasks, saveProfile, setTaskCompleted, reset } = useStoredState()
  const hasPlan = isCompleteProfile(state.profile)
  const [view, setView] = useState<View>(hasPlan ? 'checklist' : 'landing')

  if (view === 'questionnaire') {
    return (
      <QuestionnairePage
        initialProfile={state.profile}
        onCancel={() => setView(hasPlan ? 'checklist' : 'landing')}
        onSubmit={(profile) => {
          saveProfile(profile)
          setView('checklist')
        }}
      />
    )
  }

  if (view === 'checklist' && hasPlan) {
    return (
      <ChecklistPage
        state={state}
        tasks={tasks}
        onToggleTask={setTaskCompleted}
        onEditAnswers={() => setView('questionnaire')}
        onReset={() => {
          reset()
          setView('landing')
        }}
      />
    )
  }

  return (
    <LandingPage
      hasPlan={hasPlan}
      onStart={() => setView('questionnaire')}
      onResume={() => setView('checklist')}
    />
  )
}

export default App
