// PID controller, matching the spec's discrete formulation:
//   p = Kp * error
//   i += Ki * error * Ts
//   d = Kd * (error - prevError) / Ts
//   output = p + i + d
// Ts is the sampling time in seconds.

export class PID {
  constructor({ kp = 0, ki = 0, kd = 0 } = {}) {
    this.setGains({ kp, ki, kd })
    this.reset()
  }

  setGains({ kp, ki, kd }) {
    if (kp !== undefined) this.kp = kp
    if (ki !== undefined) this.ki = ki
    if (kd !== undefined) this.kd = kd
  }

  reset() {
    this.integral = 0
    this.prevError = 0
    this.started = false
  }

  /** Advance one step. Returns the term breakdown and combined output. */
  step(error, ts) {
    const p = this.kp * error
    this.integral += this.ki * error * ts
    // Avoid a derivative kick on the very first sample.
    const dErr = this.started ? error - this.prevError : 0
    const d = ts > 0 ? (this.kd * dErr) / ts : 0
    this.prevError = error
    this.started = true
    const i = this.integral
    return { p, i, d, output: p + i + d }
  }
}
