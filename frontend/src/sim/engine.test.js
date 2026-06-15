import { describe, expect, it } from 'vitest'
import { Engine } from './engine.js'
import { distanceToPath } from './geometry.js'

function run(engine, steps) {
  let last
  for (let i = 0; i < steps; i++) last = engine.step()
  return last
}

describe('Engine', () => {
  it('produces a telemetry tick with the expected shape', () => {
    const e = new Engine({ track: 'straight' })
    const t = e.step()
    expect(t).toHaveProperty('error')
    expect(t).toHaveProperty('p_term')
    expect(t.sensor_readings).toHaveLength(e.sensorCount)
    expect(t.sensor_active).toHaveLength(e.sensorCount)
  })

  it('PD control recaptures and follows a straight line', () => {
    const e = new Engine({ track: 'straight', pid: { kp: 15, ki: 0, kd: 25 } })
    e.pose.y = 365 // start ~15mm off the line
    run(e, 250)
    const d = distanceToPath(e.pose, e.track.points, e.track.closed)
    expect(d).toBeLessThan(e.track.lineWidthMm) // back on the line
    expect(e.pose.x).toBeGreaterThan(200) // and it moved forward
  })

  it('follows a curved (circle) track without losing it', () => {
    const e = new Engine({ track: 'circle', pid: { kp: 24, ki: 0, kd: 20 } })
    let maxDist = 0
    for (let i = 0; i < 600; i++) {
      e.step()
      maxDist = Math.max(maxDist, distanceToPath(e.pose, e.track.points, e.track.closed))
    }
    expect(maxDist).toBeLessThan(40) // stays near the line all the way round
  })

  it('reset returns the robot to the track start', () => {
    const e = new Engine({ track: 'oval' })
    run(e, 50)
    e.reset()
    expect(e.pose).toEqual(e.track.start)
    expect(e.ticks).toBe(0)
  })

  it('higher Kp produces a stronger correction for the same error', () => {
    const soft = new Engine({ track: 'straight', pid: { kp: 5 } })
    const hard = new Engine({ track: 'straight', pid: { kp: 40 } })
    soft.pose.y = hard.pose.y = 365
    const a = soft.step()
    const b = hard.step()
    const spreadSoft = Math.abs(a.left_speed - a.right_speed)
    const spreadHard = Math.abs(b.left_speed - b.right_speed)
    expect(spreadHard).toBeGreaterThan(spreadSoft)
  })
})
