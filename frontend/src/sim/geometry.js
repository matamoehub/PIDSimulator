// Small 2D geometry helpers. World units are millimetres; x right, y down,
// heading in radians with 0 along +x.

export function closestPointOnSegment(p, a, b) {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const len2 = abx * abx + aby * aby
  let t = 0
  if (len2 > 0) {
    t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2
    t = Math.max(0, Math.min(1, t))
  }
  const point = { x: a.x + t * abx, y: a.y + t * aby }
  const dx = p.x - point.x
  const dy = p.y - point.y
  return { point, t, dist: Math.hypot(dx, dy) }
}

// Minimum distance from point p to a polyline (optionally closed).
export function distanceToPath(p, points, closed = false) {
  let best = Infinity
  for (let i = 0; i < points.length - 1; i++) {
    const d = closestPointOnSegment(p, points[i], points[i + 1]).dist
    if (d < best) best = d
  }
  if (closed && points.length > 1) {
    const d = closestPointOnSegment(p, points[points.length - 1], points[0]).dist
    if (d < best) best = d
  }
  return best
}

export function boundsOf(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}
