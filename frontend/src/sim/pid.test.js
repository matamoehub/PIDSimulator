import { describe, expect, it } from 'vitest'
import { PID } from './pid.js'

describe('PID', () => {
  it('P term is proportional to error', () => {
    const pid = new PID({ kp: 10 })
    expect(pid.step(2, 0.01).p).toBe(20)
  })

  it('no derivative kick on the first sample', () => {
    const pid = new PID({ kd: 5 })
    expect(pid.step(3, 0.01).d).toBe(0)
  })

  it('D term responds to change in error', () => {
    const pid = new PID({ kd: 2 })
    pid.step(0, 0.01)
    const { d } = pid.step(1, 0.01) // delta 1 over ts 0.01
    expect(d).toBeCloseTo((2 * 1) / 0.01)
  })

  it('I term accumulates over time', () => {
    const pid = new PID({ ki: 1 })
    pid.step(2, 0.5)
    const { i } = pid.step(2, 0.5)
    expect(i).toBeCloseTo(2) // 1*2*0.5 + 1*2*0.5
  })

  it('reset clears integral and history', () => {
    const pid = new PID({ ki: 1, kd: 1 })
    pid.step(5, 0.1)
    pid.reset()
    expect(pid.integral).toBe(0)
    expect(pid.step(1, 0.1).d).toBe(0)
  })
})
