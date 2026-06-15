// IR reflectance sensor array model.
//
// The sensor bar sits ahead of the robot centre, perpendicular to its heading.
// Each sensor samples distance to the track centre line; a sensor reads high
// ("on the black line") when within half the line width, fading to 0 about one
// spacing away. Error is the QTR-style weighted average of sensor positions.

import { distanceToPath } from './geometry.js'

export const SENSOR_FORWARD_OFFSET_MM = 40 // look-ahead of the bar
const READING_MAX = 1000

// Per-sensor reflectance reading in [0, 1000] from distance to the line.
function readingFromDistance(dist, halfWidth, fadeMm) {
  if (dist <= halfWidth) return READING_MAX
  const over = dist - halfWidth
  if (over >= fadeMm) return 0
  return Math.round(READING_MAX * (1 - over / fadeMm))
}

/**
 * Sample the sensor array for a given robot pose.
 * @returns {{readings:number[], active:boolean[], position:number|null,
 *            error:number|null, lineLost:boolean, worldPoints:{x,y}[]}}
 */
export function readSensors(pose, track, { sensorCount, spacingMm }) {
  const halfWidth = track.lineWidthMm / 2
  const fadeMm = Math.max(spacingMm, 6)
  const cos = Math.cos(pose.heading)
  const sin = Math.sin(pose.heading)
  // forward = (cos, sin); perpendicular (sensor bar axis) = (-sin, cos)
  const fx = pose.x + cos * SENSOR_FORWARD_OFFSET_MM
  const fy = pose.y + sin * SENSOR_FORWARD_OFFSET_MM
  const centreIndex = (sensorCount - 1) / 2

  const readings = []
  const active = []
  const worldPoints = []
  let weightSum = 0
  let weightedPos = 0

  for (let i = 0; i < sensorCount; i++) {
    const lateral = (i - centreIndex) * spacingMm
    const wp = { x: fx - sin * lateral, y: fy + cos * lateral }
    worldPoints.push(wp)
    const dist = distanceToPath(wp, track.points, track.closed)
    const r = readingFromDistance(dist, halfWidth, fadeMm)
    readings.push(r)
    active.push(dist <= halfWidth)
    weightSum += r
    weightedPos += r * i
  }

  if (weightSum === 0) {
    return { readings, active, position: null, error: null, lineLost: true, worldPoints }
  }
  const position = weightedPos / weightSum // 0 .. sensorCount-1
  const error = position - centreIndex // centred -> 0
  return { readings, active, position, error, lineLost: false, worldPoints }
}
