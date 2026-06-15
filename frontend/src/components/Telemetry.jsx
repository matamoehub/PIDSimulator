import { useEffect, useRef, useState } from 'react'

const CAP = 240 // ~ last few seconds of samples

const SIGNALS = [
  { key: 'error', label: 'Error (PV)', color: '#4ea1ff', pick: (t) => t.error ?? 0 },
  { key: 'p', label: 'P-Term', color: '#ff5c5c', pick: (t) => t.p_term ?? 0 },
  { key: 'i', label: 'I-Term', color: '#4cd964', pick: (t) => t.i_term ?? 0 },
  { key: 'd', label: 'D-Term', color: '#ff9f40', pick: (t) => t.d_term ?? 0 },
]

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
    <div>
      {SIGNALS.map((s) => (
        <div key={s.key} className="mb-3">
          <div className="d-flex justify-content-between small">
            <span style={{ color: s.color }}>{s.label}</span>
            <code className="text-secondary">{(s.pick(tick || {})).toFixed(1)}</code>
          </div>
          <Sparkline values={hist[s.key]} color={s.color} />
        </div>
      ))}
    </div>
  )
}

function Sparkline({ values, color, height = 56 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const w = canvas.width
    const h = canvas.height
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)

    // Baseline (zero)
    let max = 1
    for (const v of values) max = Math.max(max, Math.abs(v))
    max *= 1.15
    const yOf = (v) => h / 2 - (v / max) * (h / 2 - 3)

    ctx.strokeStyle = '#2a2e38'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()

    if (values.length > 1) {
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      values.forEach((v, i) => {
        const x = (i / (CAP - 1)) * w
        const y = yOf(v)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    }
  }, [values, color])

  return (
    <canvas
      ref={ref}
      width={300}
      height={height}
      style={{ width: '100%', height, background: '#15171c', borderRadius: 6 }}
    />
  )
}
