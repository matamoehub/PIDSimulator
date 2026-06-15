// Differential-drive kinematics.
//
// Motor commands are converted to wheel linear velocities via a per-platform
// scale (mm/s per command unit) derived from the platform's top speed
// (RPM x wheel circumference). Faster robots therefore genuinely cover more
// ground per second.

export const WHEEL_BASE_MM = 90
export const SPEED_TO_MMS = 2.0 // fallback scale (also keeps unit tests stable)

// The built-in tracks are only ~0.4 m across, so genuinely fast robots
// (6000 RPM LFRs ~ 7.8 m/s) would be uncontrollable / leave the canvas in a
// single frame. Cap the wheel speed so they stay on-screen; their *real* top
// speed is still reported in the UI for comparison.
export const MAX_WHEEL_SPEED_MMS = 1500
const MAX_SUBSTEP_MM = 6 // split long moves so fast robots don't teleport

/**
 * Integrate one step of motion.
 * @param pose {{x,y,heading}}
 * @param left  left motor command
 * @param right right motor command
 * @param dt    seconds
 * @param speedPerCmd mm/s per command unit (defaults to the legacy constant)
 * @returns new pose
 */
export function stepKinematics(pose, left, right, dt, speedPerCmd = SPEED_TO_MMS) {
  let vL = left * speedPerCmd
  let vR = right * speedPerCmd

  const peak = Math.max(Math.abs(vL), Math.abs(vR))
  if (peak > MAX_WHEEL_SPEED_MMS) {
    const k = MAX_WHEEL_SPEED_MMS / peak
    vL *= k
    vR *= k
  }

  // Sub-step the integration so a fast robot can't jump across the line
  // between samples (sensing still happens once per loop, as on real hardware).
  const moved = Math.max(Math.abs(vL), Math.abs(vR)) * dt
  const nSub = Math.max(1, Math.ceil(moved / MAX_SUBSTEP_MM))
  const sub = dt / nSub

  let { x, y, heading } = pose
  const v = (vL + vR) / 2
  const omega = (vR - vL) / WHEEL_BASE_MM
  for (let i = 0; i < nSub; i++) {
    const hMid = heading + (omega * sub) / 2
    x += v * Math.cos(hMid) * sub
    y += v * Math.sin(hMid) * sub
    heading += omega * sub
  }
  return { x, y, heading }
}
