import { useEffect, useRef } from 'react'

// Imperative canvas renderer. Redraws on each new tick: the track centre line,
// a fading trail of where the robot has been, the robot body, and the sensor
// bar (bright = sensor over the line, dim = over background).
export default function TrackCanvas({ track, tick, width = 660, height = 480 }) {
  const canvasRef = useRef(null)
  const trailRef = useRef([])

  // Reset the trail whenever the track changes.
  useEffect(() => { trailRef.current = [] }, [track])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !track) return
    const ctx = canvas.getContext('2d')
    const { bounds } = track
    const pad = 36
    const scale = Math.min(
      (width - 2 * pad) / (bounds.width || 1),
      (height - 2 * pad) / (bounds.height || 1),
    )
    const offX = (width - bounds.width * scale) / 2 - bounds.minX * scale
    const offY = (height - bounds.height * scale) / 2 - bounds.minY * scale
    const sx = (p) => p.x * scale + offX
    const sy = (p) => p.y * scale + offY

    // Background
    ctx.fillStyle = '#15171c'
    ctx.fillRect(0, 0, width, height)

    // Track centre line
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#e9edf2'
    ctx.lineWidth = Math.max(2, track.lineWidthMm * scale)
    ctx.beginPath()
    track.points.forEach((p, i) =>
      i === 0 ? ctx.moveTo(sx(p), sy(p)) : ctx.lineTo(sx(p), sy(p)))
    if (track.closed) ctx.closePath()
    ctx.stroke()

    // Trail
    const trail = trailRef.current
    if (tick) {
      trail.push({ x: tick.x, y: tick.y })
      if (trail.length > 600) trail.shift()
    }
    if (trail.length > 1) {
      ctx.strokeStyle = 'rgba(78,161,255,0.55)'
      ctx.lineWidth = 2
      ctx.beginPath()
      trail.forEach((p, i) =>
        i === 0 ? ctx.moveTo(sx(p), sy(p)) : ctx.lineTo(sx(p), sy(p)))
      ctx.stroke()
    }

    if (!tick) return

    // Robot body (triangle pointing along heading)
    ctx.save()
    ctx.translate(sx(tick), sy(tick))
    ctx.rotate(tick.heading)
    const L = 60 * scale
    const W = 70 * scale
    ctx.fillStyle = tick.line_lost ? '#ff5c5c' : '#4cd964'
    ctx.beginPath()
    ctx.moveTo(L * 0.6, 0)
    ctx.lineTo(-L * 0.4, W * 0.5)
    ctx.lineTo(-L * 0.4, -W * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // Sensor bar LEDs
    const pts = tick.sensor_world || []
    pts.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(sx(p), sy(p), Math.max(3, 4.5 * scale * 0.9), 0, 2 * Math.PI)
      ctx.fillStyle = tick.sensor_active?.[i] ? '#ffffff' : '#586074'
      ctx.fill()
      ctx.strokeStyle = '#11131a'
      ctx.lineWidth = 1
      ctx.stroke()
    })
  }, [track, tick, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: 'auto', borderRadius: 8 }}
    />
  )
}
