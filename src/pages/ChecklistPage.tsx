import { useMemo, useState } from 'react'
import { RecommendedServices } from '../components/RecommendedServices'
import { PremiumGate } from '../components/PremiumGate'
import { UpgradeCard } from '../components/UpgradeCard'
import { categoryLabels, categoryOrder } from '../domain/labels'
import type { Entitlements } from '../domain/entitlement'
import type {
  AppChecklistTask,
  ChecklistCategory,
  CustomTask,
  HouseholdAssignment,
  StoredApplicationState,
} from '../domain/types'
import { buildExportedPlan, downloadJson } from '../services/exportPlan'
import { createCustomTask } from '../premium/customTasks'
import { assignmentLabels } from '../premium/householdAssignments'
import { buildCalendarIcs, downloadCalendar } from '../premium/calendarExport'
import { beginPremiumPrint } from '../premium/premiumPrint'
import { formatDate } from '../utils/date'

type CompletionFilter = 'all' | 'open' | 'complete'

type ChecklistPageProps = {
  state: StoredApplicationState
  tasks: AppChecklistTask[]
  entitlements: Entitlements
  licenseMessage: string | null
  onToggleTask: (taskId: string, completed: boolean) => void
  onAssignTask: (taskId: string, assignment: HouseholdAssignment) => void
  onAddCustomTask: (task: CustomTask) => void
  onEditCustomTask: (
    taskId: string,
    input: Omit<CustomTask, 'id' | 'createdAt' | 'updatedAt'>,
  ) => void
  onDeleteCustomTask: (taskId: string) => void
  onValidatePlus: () => Promise<boolean>
  onEditAnswers: () => void
  onOpenActivation: () => void
  onReset: () => void
}

export function ChecklistPage({
  state,
  tasks,
  entitlements,
  licenseMessage,
  onToggleTask,
  onAssignTask,
  onAddCustomTask,
  onEditCustomTask,
  onDeleteCustomTask,
  onValidatePlus,
  onEditAnswers,
  onOpenActivation,
  onReset,
}: ChecklistPageProps) {
  const [search, setSearch] = useState('')
  const [completion, setCompletion] = useState<CompletionFilter>('all')
  const [category, setCategory] = useState<ChecklistCategory | 'all'>('all')
  const [assignment, setAssignment] = useState<HouseholdAssignment | 'all'>('all')

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
          assignmentLabels[task.assignment],
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      const matchesCompletion =
        completion === 'all' ||
        (completion === 'complete' && task.completed) ||
        (completion === 'open' && !task.completed)
      const matchesCategory = category === 'all' || task.category === category
      const matchesAssignment = assignment === 'all' || task.assignment === assignment
      return matchesSearch && matchesCompletion && matchesCategory && matchesAssignment
    })
  }, [tasks, search, completion, category, assignment])

  function exportPlan() {
    downloadJson('movepath-us-to-germany-plan.json', buildExportedPlan(state, tasks))
  }

  async function exportCalendar() {
    const ok = await onValidatePlus()
    if (!ok) return
    const bytes = buildCalendarIcs(tasks, state.profile ?? {})
    downloadCalendar('movepath-plus-calendar.ics', bytes)
  }

  async function premiumPrint() {
    const ok = await onValidatePlus()
    if (!ok) return
    beginPremiumPrint()
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

      {entitlements.plan === 'plus' ? (
        <p className="status" role="status">
          MovePath Plus is active. {licenseMessage || 'Premium features are available on this browser.'}
        </p>
      ) : (
        <UpgradeCard compact title="MovePath Plus is ready when you are" />
      )}

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
        <label>
          Assignment
          <select value={assignment} onChange={(event) => setAssignment(event.target.value as HouseholdAssignment | 'all')}>
            <option value="all">All assignments</option>
            {Object.entries(assignmentLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <div className="toolbar__actions">
          <button className="button button--secondary" type="button" onClick={() => { setSearch(''); setCompletion('all'); setCategory('all'); setAssignment('all') }}>Clear filters</button>
          <button className="button button--secondary" type="button" onClick={() => window.print()}>Print</button>
          <button className="button button--secondary" type="button" onClick={exportPlan}>Export JSON</button>
          {entitlements.has('calendar-export') ? (
            <button className="button button--secondary" type="button" onClick={() => void exportCalendar()}>
              Export calendar
            </button>
          ) : (
            <button className="button button--secondary" type="button" onClick={onOpenActivation}>
              Unlock MovePath Plus
            </button>
          )}
          {entitlements.has('premium-print') ? (
            <button className="button button--secondary" type="button" onClick={() => void premiumPrint()}>
              Premium print
            </button>
          ) : null}
          <button className="button button--secondary" type="button" onClick={onEditAnswers}>Edit answers</button>
          <button className="button button--danger" type="button" onClick={resetPlan}>Reset plan</button>
        </div>
      </section>

      <section className="task-section no-print">
        <h2>Custom tasks</h2>
        <PremiumGate entitlements={entitlements} feature="custom-tasks" title="Custom tasks">
          <CustomTaskEditor tasks={state.customTasks} onAddCustomTask={onAddCustomTask} onEditCustomTask={onEditCustomTask} onDeleteCustomTask={onDeleteCustomTask} />
        </PremiumGate>
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
                  <TaskCard
                    key={task.id}
                    task={task}
                    canAssign={entitlements.has('household-assignments')}
                    onAssignTask={onAssignTask}
                    onToggle={onToggleTask}
                  />
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

      {entitlements.plan === 'free' ? (
        <div className="task-section">
          <UpgradeCard compact title="Ready for premium planning?" />
        </div>
      ) : null}

      <RecommendedServices />
    </main>
  )
}

function TaskCard({
  task,
  canAssign,
  onAssignTask,
  onToggle,
}: {
  task: AppChecklistTask
  canAssign: boolean
  onAssignTask: (taskId: string, assignment: HouseholdAssignment) => void
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
      {canAssign ? (
        <label className="inline-field">
          Assignment
          <select
            value={task.assignment}
            onChange={(event) => onAssignTask(task.id, event.target.value as HouseholdAssignment)}
          >
            {Object.entries(assignmentLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      ) : (
        <p className="status">Assignment: {assignmentLabels[task.assignment]}</p>
      )}
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
        {task.documents.length ? (
          <div>
            <strong>Useful documents</strong>
            <ul>
              {task.documents.map((document) => <li key={document}>{document}</li>)}
            </ul>
          </div>
        ) : null}
        {task.officialSources.length ? (
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
        ) : null}
        {task.lastVerified ? <p className="verified">Last verified: {task.lastVerified}</p> : null}
      </div>
    </article>
  )
}

function CustomTaskEditor({
  tasks,
  onAddCustomTask,
  onEditCustomTask,
  onDeleteCustomTask,
}: {
  tasks: CustomTask[]
  onAddCustomTask: (task: CustomTask) => void
  onEditCustomTask: (
    taskId: string,
    input: Omit<CustomTask, 'id' | 'createdAt' | 'updatedAt'>,
  ) => void
  onDeleteCustomTask: (taskId: string) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState<ChecklistCategory>('first-month')

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !dueDate) return
    onAddCustomTask(createCustomTask({ title, description, dueDate, category }))
    setTitle('')
    setDescription('')
    setDueDate('')
    setCategory('first-month')
  }

  return (
    <div className="custom-task-editor">
      <form className="questionnaire" onSubmit={addTask}>
        <div className="form-grid">
          <label>
            Task title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Due date
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <label>
            Timeline category
            <select value={category} onChange={(event) => setCategory(event.target.value as ChecklistCategory)}>
              {categoryOrder.map((value) => (
                <option key={value} value={value}>{categoryLabels[value]}</option>
              ))}
            </select>
          </label>
          <label>
            Description
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
        </div>
        <div className="actions">
          <button className="button button--primary" type="submit">Add custom task</button>
        </div>
      </form>
      {tasks.length ? (
        <div className="task-list">
          {tasks.map((task) => (
            <article key={task.id} className="task-card">
              <h3>{task.title}</h3>
              <p>{task.description || 'No description yet.'}</p>
              <p className="status">{formatDate(task.dueDate)} · {categoryLabels[task.category]}</p>
              <div className="actions">
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() =>
                    onEditCustomTask(task.id, {
                      title: task.title,
                      description: task.description,
                      dueDate: task.dueDate,
                      category: task.category,
                      completed: task.completed,
                    })
                  }
                >
                  Save current details
                </button>
                <button className="button button--danger" type="button" onClick={() => onDeleteCustomTask(task.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="status">No custom tasks yet.</p>
      )}
    </div>
  )
}
