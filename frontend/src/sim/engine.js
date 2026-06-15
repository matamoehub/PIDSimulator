// Simulation engine: one Ts tick = sensors -> error -> PID -> motors ->
// kinematics. Produces a telemetry tick shaped like the spec's payload.
//
// Runs entirely client-side. The React layer drives it with a fixed-timestep
// loop (accumulate real time, call step() once per Ts) so the physics stays
// frame-rate independent — tuning transfers to real hardware.

import { PID } from './pid.js'
import { readSensors } from './sensors.js'
import { stepKinematics } from './robot.js'
import { buildTrack } from './tracks.js'

export const DEFAULT_PLATFORM = {
  id: 'esp32_qtr8',
  sensor_count_options: [8],
  sensor_spacing_mm: 12,
  motor_speed_range: [0, 255],
  loop_time_ms: 10,
  default_base_speed: 150,
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v
}

export class Engine {
  constructor(opts = {}) {
    this.platform = opts.platform || DEFAULT_PLATFORM
    this.sensorCount = opts.sensorCount || this.platform.sensor_count_options[0]
    this.tsMs = opts.tsMs ?? this.platform.loop_time_ms
    this.baseSpeed = opts.baseSpeed ?? this.platform.default_base_speed
    this.pid = new PID(opts.pid || { kp: 15, ki: 0, kd: 25 })
    this.setTrack(opts.track || 'straight')
    this.reset()
  }

  setTrack(name) {
    this.track = buildTrack(name)
    this.reset()
  }

  setPlatform(platform) {
    this.platform = platform
    const opts = platform.sensor_count_options || [this.sensorCount]
    if (!opts.includes(this.sensorCount)) this.sensorCount = opts[0]
    this.reset()
  }

  setSensorCount(n) {
    this.sensorCount = n
  }

  setPid(gains) {
    this.pid.setGains(gains)
  }

  setBaseSpeed(v) {
    this.baseSpeed = v
  }

  setTsMs(v) {
    this.tsMs = v
  }

  reset() {
    this.pose = { ...this.track.start }
    this.pid.reset()
    this.lastError = 0
    this.ticks = 0
    this.elapsedMs = 0
  }

  /** Advance one sampling period. Returns a telemetry tick. */
  step() {
    const ts = this.tsMs / 1000
    const sense = readSensors(this.pose, this.track, {
      sensorCount: this.sensorCount,
      spacingMm: this.platform.sensor_spacing_mm,
    })

    // Line-lost policy (Phase 1): keep steering the way we last saw the line
    // and ease off the throttle so the robot can reacquire it.
    let error = sense.error
    if (sense.lineLost) error = this.lastError
    else this.lastError = error

    const { p, i, d, output } = this.pid.step(error, ts)

    const speedScale = sense.lineLost ? 0.5 : 1
    const base = this.baseSpeed * speedScale
    // Positive error => line is to the robot's right => steer right
    // (right wheel faster). In x-right / y-down coords that increases heading.
    const [lo, hi] = this.platform.motor_speed_range
    const left = clamp(base - output, lo, hi)
    const right = clamp(base + output, lo, hi)

    this.pose = stepKinematics(this.pose, left, right, ts)
    this.ticks += 1
    this.elapsedMs += this.tsMs

    return {
      x: this.pose.x,
      y: this.pose.y,
      heading: this.pose.heading,
      sensor_readings: sense.readings,
      sensor_active: sense.active,
      sensor_world: sense.worldPoints,
      error,
      p_term: p,
      i_term: i,
      d_term: d,
      left_speed: left,
      right_speed: right,
      line_lost: sense.lineLost,
      tick_ms: this.tsMs,
      elapsed_ms: this.elapsedMs,
    }
  }
}
