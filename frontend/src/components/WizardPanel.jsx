import { Button } from 'react-bootstrap'
import { LESSONS } from '../teaching/lessons.js'

// Guided teaching overlay shown at the top of the main column. Always one tap
// away (toggle from the controls) so students can jump in and out mid-session.
export default function WizardPanel({ index, onIndex, onApply, onClose }) {
  const step = LESSONS[index]
  const last = LESSONS.length - 1

  return (
    <div className="mat-card wizard-panel p-3 mb-3">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="section-label text-uppercase small">Tutorial</div>
          <h6 className="mb-1">{step.title}</h6>
        </div>
        <Button size="sm" variant="outline-secondary" onClick={onClose}>Close</Button>
      </div>

      <p className="mb-2 small">{step.body}</p>

      <div className="d-flex align-items-center gap-2">
        <Button size="sm" variant="primary" onClick={() => onApply(step.setup)}>
          Apply setup
        </Button>
        <div className="ms-auto d-flex align-items-center gap-2">
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={index === 0}
            onClick={() => onIndex(index - 1)}
          >
            Back
          </Button>
          <span className="small text-muted">{index + 1} / {LESSONS.length}</span>
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={index === last}
            onClick={() => onIndex(index + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="d-flex gap-1 mt-2">
        {LESSONS.map((l, i) => (
          <span
            key={l.id}
            className="wizard-dot"
            style={{ background: i === index ? 'var(--mat-green)' : 'var(--mat-border)' }}
            onClick={() => onIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
