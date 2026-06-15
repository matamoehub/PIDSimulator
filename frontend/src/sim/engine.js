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
import { distanceToPath } from './geometry.js'

// How far off the line counts as "off the course" -> stop the run.
export const OFF_COURSE_MM = 150

export const DEFAULT_PLATFORM = {
  id: 'esp32_qtr8',
  sensor_count_options: [8],
  sensor_spacing_mm: 12,
  motor_speed_range: [0, 255],
  motor_max_rpm: 300,
  wheel_diameter_mm: 32.5,
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

  // Top linear speed in mm/s (RPM x wheel circumference).
  get topSpeedMmS() {
    const rpm = this.platform.motor_max_rpm || 300
    const dia = this.platform.wheel_diameter_mm || 32.5
    return (rpm / 60) * Math.PI * dia
  }

  // mm/s per motor-command unit (full command -> top speed).
  get speedPerCommand() {
    const hi = this.platform.motor_speed_range[1]
    return this.topSpeedMmS / hi
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

    // Real PID line-follower behaviour. When every sensor is off the line the
    // position is held at the last-seen extreme (as QTR-style sensor libraries
    // do), so the controller keeps steering hard toward where the line vanished
    // and whips around to reacquire it. PID runs every tick — there is no
    // separate "drive straight" mode.
    const [lo, hi] = this.platform.motor_speed_range
    let error
    if (sense.lineLost) {
      const maxErr = (this.sensorCount - 1) / 2
      error = this.lastError >= 0 ? maxErr : -maxErr
    } else {
      error = sense.error
      this.lastError = error
    }

    const { p, i, d, output } = this.pid.step(error, ts)

    // Positive error => line is to the robot's right => steer right
    // (right wheel faster). In x-right / y-down coords that increases heading.
    const base = this.baseSpeed
    const left = clamp(base - output, lo, hi)
    const right = clamp(base + output, lo, hi)

    this.pose = stepKinematics(this.pose, left, right, ts, this.speedPerCommand)
    this.ticks += 1
    this.elapsedMs += this.tsMs

    const offLine = distanceToPath(this.pose, this.track.points, this.track.closed)
    const outOfBounds = offLine > OFF_COURSE_MM

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
      off_line_mm: offLine,
      out_of_bounds: outOfBounds,
      tick_ms: this.tsMs,
      elapsed_ms: this.elapsedMs,
    }
  }
}
