import { describe, expect, it } from 'vitest'
import { TRACK_NAMES, buildTrack, listTracks } from './tracks.js'
import { distanceToPath } from './geometry.js'

describe('tracks', () => {
  it('lists all eight Phase 1 tracks', () => {
    expect(TRACK_NAMES).toEqual([
      'straight', 'circle', 'oval', 'rectangle',
      'square', 'infinity', 'chicane', 'competition',
    ])
    expect(listTracks()).toHaveLength(8)
  })

  it.each(TRACK_NAMES)('%s: start pose sits on the line', (name) => {
    const t = buildTrack(name)
    const d = distanceToPath(t.start, t.points, t.closed)
    expect(d).toBeLessThanOrEqual(t.lineWidthMm / 2)
  })

  it.each(TRACK_NAMES)('%s: polyline is continuous', (name) => {
    const t = buildTrack(name)
    expect(t.points.length).toBeGreaterThan(10)
    let maxGap = 0
    for (let i = 1; i < t.points.length; i++) {
      const g = Math.hypot(
        t.points[i].x - t.points[i - 1].x,
        t.points[i].y - t.points[i - 1].y,
      )
      if (g > maxGap) maxGap = g
    }
    expect(maxGap).toBeLessThan(12) // ~STEP_MM, no big jumps
  })

  it('throws on an unknown track', () => {
    expect(() => buildTrack('nope')).toThrow()
  })
})
