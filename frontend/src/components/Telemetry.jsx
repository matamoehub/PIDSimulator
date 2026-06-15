import { useEffect, useRef, useState } from 'react'

const CAP = 200 // samples retained per signal

const SIGNALS = [
  { key: 'error', label: 'Error (PV)', varName: '--tel-error', pick: (t) => t.error ?? 0 },
  { key: 'p', label: 'P-Term', varName: '--tel-p', pick: (t) => t.p_term ?? 0 },
  { key: 'i', label: 'I-Term', varName: '--tel-i', pick: (t) => t.i_term ?? 0 },
  { key: 'd', label: 'D-Term', varName: '--tel-d', pick: (t) => t.d_term ?? 0 },
]

function cssVar(name) {
  if (typeof window === 'undefined') return '#4d8160'
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#4d8160'
}

// Telemetry oriented like the robot's forward view: each graph flows
// top -> bottom, newest sample at the top (as if the signal is coming toward
// the robot). Laid out in a 2-column grid beneath the track.
export default function Telemetry({ tick }) {
  const [hist, setHist] = useState({ error: [], p: [], i: [], d: [] })

  useEffect(() => {
    if (!tick) return
    setHist((prev) => {
      const push = (a, v) => {
        const n = a.length >= CAP ? a.slice(1) : a.slice()
        n.push(v)
        return n
      }
      return {
        error: push(prev.error, tick.error ?? 0),
        p: push(prev.p, tick.p_term ?? 0),
        i: push(prev.i, tick.i_term ?? 0),
        d: push(prev.d, tick.d_term ?? 0),
      }
    })
  }, [tick])

  return (
    <div className="telemetry-grid">
      {SIGNALS.map((s) => (
        <div key={s.key} className="telemetry-cell">
          <div className="d-flex justify-content-between small mb-1">
            <span className="fw-medium" style={{ color: cssVar(s.varName) }}>{s.label}</span>
            <code className="text-muted">{s.pick(tick || {}).toFixed(1)}</code>
          </div>
          <VerticalSparkline values={hist[s.key]} color={cssVar(s.varName)} />
        </div>
      ))}
    </div>
  )
}

// x-axis = signal value (centred), y-axis = time (newest at top).
function VerticalSparkline({ values, color, height = 150 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const w = canvas.width
    const h = canvas.height
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)

    let max = 1
    for (const v of values) max = Math.max(max, Math.abs(v))
    max *= 1.15
    const xOf = (v) => w / 2 + (v / max) * (w / 2 - 4)
    const yOf = (i) => h * (1 - i / (CAP - 1)) // newest (last) at top

    // Centre (zero) line
    ctx.strokeStyle = '#e3e8e4'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)
    ctx.stroke()

    if (values.length > 1) {
      ctx.strokeStyle = color
      ctx.lineWidth = 1.75
      ctx.beginPath()
      values.forEach((v, i) => {
        const x = xOf(v)
        const y = yOf(i)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    }
  }, [values, color])

  return (
    <canvas
      ref={ref}
      width={150}
      height={height}
      style={{ width: '100%', height, background: '#fbfdfb', borderRadius: 8 }}
    />
  )
}
