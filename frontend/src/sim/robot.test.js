import { describe, expect, it } from 'vitest'
import { stepKinematics } from './robot.js'

describe('stepKinematics', () => {
  it('drives straight when both motors match', () => {
    const p = stepKinematics({ x: 0, y: 0, heading: 0 }, 100, 100, 0.1)
    expect(p.heading).toBeCloseTo(0)
    expect(p.x).toBeGreaterThan(0)
    expect(p.y).toBeCloseTo(0)
  })

  it('turns when motor speeds differ', () => {
    // right faster than left -> turns toward +heading (counter-clockwise in
    // x-right / y-down coords)
    const p = stepKinematics({ x: 0, y: 0, heading: 0 }, 50, 150, 0.1)
    expect(p.heading).toBeGreaterThan(0)
  })

  it('spins in place for equal and opposite speeds', () => {
    const p = stepKinematics({ x: 0, y: 0, heading: 0 }, -100, 100, 0.1)
    expect(p.x).toBeCloseTo(0)
    expect(p.y).toBeCloseTo(0)
    expect(p.heading).not.toBeCloseTo(0)
  })
})
