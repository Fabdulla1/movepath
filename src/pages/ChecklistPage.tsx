import { useMemo, useState } from 'react'
import { RecommendedServices } from '../components/RecommendedServices'
import { categoryLabels, categoryOrder } from '../domain/labels'
import type { ChecklistCategory, GeneratedChecklistTask, StoredApplicationState } from '../domain/types'
import { buildExportedPlan, downloadJson } from '../services/exportPlan'
import { formatDate } from '../utils/date'

type CompletionFilter = 'all' | 'open' | 'complete'

type ChecklistPageProps = {
  state: StoredApplicationState
  tasks: GeneratedChecklistTask[]
  onToggleTask: (taskId: string, completed: boolean) => void
  onEditAnswers: () => void
  onReset: () => void
}

export function ChecklistPage({
  state,
  tasks,
  onToggleTask,
  onEditAnswers,
  onReset,
}: ChecklistPageProps) {
  const [search, setSearch] = useState('')
  const [completion, setCompletion] = useState<CompletionFilter>('all')
  const [category, setCategory] = useState<ChecklistCategory | 'all'>('all')

  const completedCount = tasks.filter((task) => task.completed).length
  const remainingCount = tasks.length - completedCount
  const percentage = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

  const filteredTasks = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchesSearch =
        !normalized ||
        [
          task.title,
          task.description,
          task.category,
          task.documents.join(' '),
          task.officialSources.map((source) => source.label).join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      const matchesCompletion =
        completion === 'all' ||
        (completion === 'complete' && task.completed) ||
        (completion === 'open' && !task.completed)
      const matchesCategory = category === 'all' || task.category === category
      return matchesSearch && matchesCompletion && matchesCategory
    })
  }, [tasks, search, completion, category])

  function exportPlan() {
    downloadJson('movepath-us-to-germany-plan.json', buildExportedPlan(state, tasks))
  }

  function resetPlan() {
    const confirmed = window.confirm('Reset all locally stored MovePath data in this browser?')
    if (confirmed) onReset()
  }

  return (
    <main className="page-shell checklist-page">
      <section className="page-heading">
        <p className="eyebrow">Your relocation checklist</p>
        <h1>MovePath plan for {state.profile?.destinationCity || 'Germany'}</h1>
        <p>
          Tasks are calculated from your planned arrival date. Confirm official requirements with
          the responsible authority before relying on any administrative step.
        </p>
      </section>

      <section className="summary-panel" aria-label="Checklist summary">
        <div>
          <strong>{percentage}%</strong>
          <span>complete</span>
        </div>
        <div>
          <strong>{completedCount}</strong>
          <span>completed</span>
        </div>
        <div>
          <strong>{remainingCount}</strong>
          <span>remaining</span>
        </div>
      </section>

      <section className="toolbar no-print" aria-label="Checklist tools">
        <label>
          Search tasks
          <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" />
        </label>
        <label>
          Completion
          <select value={completion} onChange={(event) => setCompletion(event.target.value as CompletionFilter)}>
            <option value="all">All tasks</option>
            <option value="open">Open tasks</option>
            <option value="complete">Completed tasks</option>
          </select>
        </label>
        <label>
          Timeline
          <select value={category} onChange={(event) => setCategory(event.target.value as ChecklistCategory | 'all')}>
            <option value="all">All sections</option>
            {categoryOrder.map((value) => (
              <option key={value} value={value}>{categoryLabels[value]}</option>
            ))}
          </select>
        </label>
        <div className="toolbar__actions">
          <button className="button button--secondary" type="button" onClick={() => { setSearch(''); setCompletion('all'); setCategory('all') }}>Clear filters</button>
          <button className="button button--secondary" type="button" onClick={() => window.print()}>Print</button>
          <button className="button button--secondary" type="button" onClick={exportPlan}>Export JSON</button>
          <button className="button button--secondary" type="button" onClick={onEditAnswers}>Edit answers</button>
          <button className="button button--danger" type="button" onClick={resetPlan}>Reset plan</button>
        </div>
      </section>

      <p className="status" role="status">
        Showing {filteredTasks.length} of {tasks.length} tasks.
      </p>

      {filteredTasks.length ? (
        categoryOrder.map((section) => {
          const sectionTasks = filteredTasks.filter((task) => task.category === section)
          if (!sectionTasks.length) return null
          return (
            <section className="task-section" key={section} aria-labelledby={`${section}-heading`}>
              <h2 id={`${section}-heading`}>{categoryLabels[section]}</h2>
              <div className="task-list">
                {sectionTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onToggle={onToggleTask} />
                ))}
              </div>
            </section>
          )
        })
      ) : (
        <section className="empty-state">
          <h2>No tasks match these filters</h2>
          <p>Clear filters or edit your answers to generate a different checklist.</p>
        </section>
      )}

      <RecommendedServices />
    </main>
  )
}

function TaskCard({
  task,
  onToggle,
}: {
  task: GeneratedChecklistTask
  onToggle: (taskId: string, completed: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const detailsId = `${task.id}-details`

  return (
    <article className={`task-card ${task.completed ? 'task-card--complete' : ''}`}>
      <div className="task-card__top">
        <label className="check-label">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(event) => onToggle(task.id, event.target.checked)}
          />
          <span>{task.completed ? 'Completed' : 'Open'}</span>
        </label>
        <span className="due-date">{formatDate(task.dueDate)}</span>
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <button
        className="details-toggle no-print"
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? 'Hide details' : 'Show details'}
      </button>
      <div id={detailsId} className={`task-details ${open ? 'is-open' : ''}`}>
        {task.applicabilityNote ? <p><strong>Why this appears:</strong> {task.applicabilityNote}</p> : null}
        {task.details ? <p>{task.details}</p> : null}
        <div>
          <strong>Useful documents</strong>
          <ul>
            {task.documents.map((document) => <li key={document}>{document}</li>)}
          </ul>
        </div>
        <div>
          <strong>Official sources</strong>
          <ul>
            {task.officialSources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                <span className="print-url"> - {source.url}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="verified">Last verified: {task.lastVerified}</p>
      </div>
    </article>
  )
}
