import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { LESSONS } from '../teaching/lessons.js'
import { DiagramLineSensor, DiagramPIDLoop, DiagramTerms } from '../teaching/diagrams.jsx'

const PARAMS = { kp: 'Kp', ki: 'Ki', kd: 'Kd', base: 'Base', ts: 'Ts' }

const DIAGRAMS = {
  'line-sensor': DiagramLineSensor,
  'pid-loop':    DiagramPIDLoop,
  'terms':       DiagramTerms,
}

export default function WizardPanel({ index, onIndex, onApply, onClose, values = {}, onShowCode }) {
  const step    = LESSONS[index]
  const last    = LESSONS.length - 1
  const isIntro = step.type === 'intro'
  const focus   = step.highlight.filter((k) => PARAMS[k])
  const Diagram = step.diagram ? DIAGRAMS[step.diagram] : null

  // Checklist resets when lesson changes
  const [checked, setChecked] = useState([])
  useEffect(() => setChecked([]), [index])

  const toggle = (i) =>
    setChecked((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])

  const allDone = step.steps?.length > 0 && checked.length === step.steps.length

  return (
    <div className="mat-card wizard-panel p-3 mb-3">
      <div className="d-flex gap-3">

        {/* Live watch box — only meaningful for exercises */}
        {!isIntro && (
          <div className="wizard-watch">
            <div className="wizard-watch-title">Watching</div>
            {focus.length === 0 && <div className="small text-muted">telemetry</div>}
            {focus.map((k) => (
              <div key={k} className="wizard-watch-item">
                <span className="small text-muted">{PARAMS[k]}</span>
                <span className="wizard-watch-val">{values[k] ?? '—'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Lesson content */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <div>
              <div className="section-label text-uppercase small">
                Tutorial — {index + 1} of {LESSONS.length}
              </div>
              <h6 className="mb-0">{step.title}</h6>
            </div>
            <Button size="sm" variant="outline-secondary" onClick={onClose}>Close</Button>
          </div>

          {step.goal && (
            <p className="mb-2 small fst-italic text-muted">{step.goal}</p>
          )}

          {/* Concept diagram for intro slides */}
          {Diagram && (
            <div className="wizard-diagram mb-2">
              <Diagram />
            </div>
          )}

          <p className="mb-2 small">{step.body}</p>

          {/* Step checklist */}
          {step.steps?.length > 0 && (
            <div className="wizard-steps mb-2">
              {step.steps.map((s, i) => (
                <label key={i} className={`wizard-step${checked.includes(i) ? ' done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={() => toggle(i)}
                    className="me-2"
                  />
                  {s.includes('Code panel') && onShowCode ? (
                    <>
                      {s.split('Code panel')[0]}
                      <button className="wizard-code-link" onClick={onShowCode}>Code panel</button>
                      {s.split('Code panel')[1]}
                    </>
                  ) : s}
                </label>
              ))}
            </div>
          )}

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {!isIntro && step.setup && (
              <Button size="sm" variant="primary" onClick={() => onApply(step.setup)}>
                Apply setup
              </Button>
            )}
            <div className="ms-auto d-flex align-items-center gap-2">
              <Button size="sm" variant="outline-secondary" disabled={index === 0}
                onClick={() => onIndex(index - 1)}>Back</Button>
              <Button
                size="sm"
                variant={allDone ? 'success' : 'outline-secondary'}
                disabled={index === last}
                onClick={() => onIndex(index + 1)}
              >
                {allDone ? 'Next ✓' : 'Next'}
              </Button>
            </div>
          </div>

          <div className="d-flex gap-1 mt-2">
            {LESSONS.map((l, i) => (
              <span key={l.id} className="wizard-dot"
                title={l.title}
                style={{
                  background: i === index
                    ? 'var(--mat-green)'
                    : l.type === 'intro'
                    ? 'var(--mat-teal)'
                    : 'var(--mat-border)',
                }}
                onClick={() => onIndex(i)} />
            ))}
          </div>
          <div className="d-flex gap-1 mt-1">
            <span className="small text-muted" style={{ fontSize: '0.65rem' }}>
              ● teal = concept  ● green = exercise
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
