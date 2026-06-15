// Differential-drive kinematics.
//
// Motor commands (same units as base speed, e.g. 0..255) are converted to wheel
// linear velocities; the body follows the standard unicycle integration.

export const WHEEL_BASE_MM = 90
export const SPEED_TO_MMS = 2.0 // motor command unit -> mm/s

/**
 * Integrate one step of motion.
 * @param pose {{x,y,heading}}
 * @param left  left motor command
 * @param right right motor command
 * @param dt    seconds
 * @returns new pose
 */
export function stepKinematics(pose, left, right, dt) {
  const vL = left * SPEED_TO_MMS
  const vR = right * SPEED_TO_MMS
  const v = (vL + vR) / 2
  const omega = (vR - vL) / WHEEL_BASE_MM
  const heading = pose.heading + omega * dt
  // Integrate using the mid-step heading for a little more accuracy.
  const hMid = pose.heading + (omega * dt) / 2
  return {
    x: pose.x + v * Math.cos(hMid) * dt,
    y: pose.y + v * Math.sin(hMid) * dt,
    heading,
  }
}
