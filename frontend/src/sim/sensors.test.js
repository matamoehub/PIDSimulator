import { describe, expect, it } from 'vitest'
import { readSensors } from './sensors.js'
import { buildTrack } from './tracks.js'

const straight = buildTrack('straight') // horizontal line at y=350
const opts = { sensorCount: 8, spacingMm: 12 }

describe('readSensors', () => {
  it('centred on the line gives near-zero error and active sensors', () => {
    const s = readSensors({ x: 300, y: 350, heading: 0 }, straight, opts)
    expect(s.lineLost).toBe(false)
    expect(Math.abs(s.error)).toBeLessThan(0.2)
    expect(s.active.some(Boolean)).toBe(true)
  })

  it('error sign tracks which side the line is on', () => {
    // robot above the line (smaller y); line is toward +lateral (higher index)
    const above = readSensors({ x: 300, y: 332, heading: 0 }, straight, opts)
    const below = readSensors({ x: 300, y: 368, heading: 0 }, straight, opts)
    expect(above.error).toBeGreaterThan(0)
    expect(below.error).toBeLessThan(0)
    expect(above.error).toBeCloseTo(-below.error, 1)
  })

  it('reports line lost when no sensor sees the line', () => {
    const s = readSensors({ x: 300, y: 600, heading: 0 }, straight, opts)
    expect(s.lineLost).toBe(true)
    expect(s.error).toBeNull()
  })

  it('produces one reading and world point per sensor', () => {
    const s = readSensors({ x: 300, y: 350, heading: 0 }, straight, opts)
    expect(s.readings).toHaveLength(8)
    expect(s.worldPoints).toHaveLength(8)
  })
})
