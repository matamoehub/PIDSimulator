// Track geometry. Each track is built as a dense polyline (the centre line) in
// millimetres, plus a line width. The simulation samples distance-to-centre to
// decide what each IR sensor sees; the renderer (M2) draws the same polyline.

import { boundsOf } from './geometry.js'

const STEP_MM = 4 // polyline resolution

function line(p0, p1, includeEnd = false) {
  const len = Math.hypot(p1.x - p0.x, p1.y - p0.y)
  const n = Math.max(1, Math.round(len / STEP_MM))
  const pts = []
  const last = includeEnd ? n : n - 1
  for (let i = 0; i <= last; i++) {
    const t = i / n
    pts.push({ x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t })
  }
  return pts
}

function arc(cx, cy, r, a0, a1, includeEnd = false) {
  const span = Math.abs(a1 - a0) * r
  const n = Math.max(1, Math.round(span / STEP_MM))
  const pts = []
  const last = includeEnd ? n : n - 1
  for (let i = 0; i <= last; i++) {
    const a = a0 + (a1 - a0) * (i / n)
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  }
  return pts
}

function startPose(points) {
  const a = points[0]
  const b = points[1] || points[0]
  return { x: a.x, y: a.y, heading: Math.atan2(b.y - a.y, b.x - a.x) }
}

function make(name, label, difficulty, points, closed, lineWidthMm = 18) {
  return {
    name,
    label,
    difficulty,
    closed,
    lineWidthMm,
    points,
    bounds: boundsOf(points),
    start: startPose(points),
  }
}

const builders = {
  straight: () =>
    make('straight', 'Straight', 'Intro',
      line({ x: 120, y: 350 }, { x: 880, y: 350 }, true), false),

  circle: () => {
    const cx = 500, cy = 350, r = 220
    // start at top, heading +x (counter-clockwise as drawn)
    return make('circle', 'Circle', 'Beginner',
      arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI), true)
  },

  oval: () => {
    const r = 150, top = 350 - r, bot = 350 + r
    const pts = [
      ...line({ x: 300, y: top }, { x: 700, y: top }),
      ...arc(700, 350, r, -Math.PI / 2, Math.PI / 2),
      ...line({ x: 700, y: bot }, { x: 300, y: bot }),
      ...arc(300, 350, r, Math.PI / 2, (3 * Math.PI) / 2),
    ]
    return make('oval', 'Oval', 'Beginner', pts, true)
  },

  rectangle: () => {
    const c = [
      { x: 180, y: 200 }, { x: 820, y: 200 },
      { x: 820, y: 500 }, { x: 180, y: 500 },
    ]
    const pts = [
      ...line(c[0], c[1]), ...line(c[1], c[2]),
      ...line(c[2], c[3]), ...line(c[3], c[0]),
    ]
    return make('rectangle', 'Rectangle', 'Intermediate', pts, true)
  },

  square: () => {
    const c = [
      { x: 300, y: 150 }, { x: 700, y: 150 },
      { x: 700, y: 550 }, { x: 300, y: 550 },
    ]
    const pts = [
      ...line(c[0], c[1]), ...line(c[1], c[2]),
      ...line(c[2], c[3]), ...line(c[3], c[0]),
    ]
    return make('square', 'Square', 'Intermediate', pts, true)
  },

  infinity: () => {
    // Lemniscate of Bernoulli, scaled and centred. Crosses itself at centre.
    const cx = 500, cy = 350, a = 320, sy = 1.1
    const pts = []
    const n = 400
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * 2 * Math.PI
      const d = 1 + Math.sin(t) * Math.sin(t)
      pts.push({
        x: cx + (a * Math.cos(t)) / d,
        y: cy + (a * sy * Math.sin(t) * Math.cos(t)) / d,
      })
    }
    return make('infinity', 'Infinity (figure-8)', 'Intermediate', pts, true)
  },

  chicane: () => {
    // S-curve: horizontal run with a sinusoidal lateral wiggle.
    const x0 = 120, x1 = 880, amp = 130, period = 320
    const pts = []
    const n = Math.round((x1 - x0) / STEP_MM)
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * (i / n)
      const y = 350 + amp * Math.sin(((x - x0) / period) * 2 * Math.PI)
      pts.push({ x, y })
    }
    return make('chicane', 'Chicane', 'Advanced', pts, false)
  },

  competition: () => {
    // Mixed: a wiggly top straight, rounded right turn, bottom straight,
    // rounded left turn — a closed circuit with varied elements.
    const top = 200, bot = 500, r = 150
    const wiggle = []
    const wx0 = 330, wx1 = 670
    const wn = Math.round((wx1 - wx0) / STEP_MM)
    for (let i = 0; i <= wn; i++) {
      const x = wx0 + (wx1 - wx0) * (i / wn)
      const y = top + 60 * Math.sin(((x - wx0) / 170) * 2 * Math.PI)
      wiggle.push({ x, y })
    }
    const pts = [
      ...wiggle,
      ...arc(670, top + r, r, -Math.PI / 2, Math.PI / 2),
      ...line({ x: 670, y: bot }, { x: 330, y: bot }),
      ...arc(330, top + r, r, Math.PI / 2, (3 * Math.PI) / 2),
    ]
    return make('competition', 'Competition course', 'Advanced', pts, true)
  },
}

export const TRACK_NAMES = Object.keys(builders)

export function buildTrack(name) {
  const b = builders[name]
  if (!b) throw new Error(`unknown track: ${name}`)
  return b()
}

export function listTracks() {
  return TRACK_NAMES.map((n) => {
    const t = builders[n]()
    return { name: t.name, label: t.label, difficulty: t.difficulty }
  })
}
