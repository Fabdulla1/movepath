import { useEffect, useId, useRef } from 'react'

type DialogAction = {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

type ConfirmationDialogProps = {
  title: string
  description: string
  actions: DialogAction[]
  onCancel: () => void
}

export function ConfirmationDialog({
  title,
  description,
  actions,
  onCancel,
}: ConfirmationDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="confirmation-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="actions">
          <button ref={cancelRef} className="button button--secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
          {actions.map((action) => (
            <button
              className={`button button--${action.variant ?? 'secondary'}`}
              disabled={action.disabled}
              key={action.label}
              type="button"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
