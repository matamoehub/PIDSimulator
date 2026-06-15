// Top-down robot drawing for the track canvas. All coordinates are in
// millimetres, with the robot's centre at the origin and the front facing +x
// (the caller has already translated, rotated to heading, and scaled to px).
// Mirrors the SVG icons in RobotIcon.jsx.

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

export function drawRobot(ctx, kind, lost) {
  if (kind === 'maqueen') return drawMaqueen(ctx, lost)
  if (kind === 'fast') return drawFast(ctx, lost)
  return drawGeneric(ctx, lost)
}

// DFRobot Maqueen (from the top-down photo): two big tyres on the sides, a
// 3xAAA battery pack at the rear, the micro:bit edge connector across the
// middle, and a pointed front PCB with two ultrasonic "eyes".
function drawMaqueen(ctx, lost) {
  // tyres (protrude on the sides)
  ctx.fillStyle = '#15171a'
  rr(ctx, -18, -39, 26, 13, 3); ctx.fill()
  rr(ctx, -18, 26, 26, 13, 3); ctx.fill()
  ctx.fillStyle = '#b9952f' // brass hubs
  for (const y of [-32, 32]) { ctx.beginPath(); ctx.arc(-5, y, 2.4, 0, 7); ctx.fill() }

  // chassis with pointed nose at +x
  const body = () => {
    ctx.beginPath()
    ctx.moveTo(-44, -25); ctx.lineTo(15, -25); ctx.lineTo(34, 0)
    ctx.lineTo(15, 25); ctx.lineTo(-44, 25); ctx.closePath()
  }
  ctx.fillStyle = '#262b32'; body(); ctx.fill()

  // battery pack (rear)
  ctx.fillStyle = '#3c434d'; rr(ctx, -42, -20, 30, 40, 3); ctx.fill()
  ctx.strokeStyle = '#2a2f37'; ctx.lineWidth = 1
  for (const y of [-6.7, 6.7]) { ctx.beginPath(); ctx.moveTo(-42, y); ctx.lineTo(-12, y); ctx.stroke() }

  // micro:bit edge connector
  ctx.fillStyle = '#c8a93a'; rr(ctx, -10, -22, 4, 44, 1); ctx.fill()

  // ultrasonic eyes near the nose
  ctx.fillStyle = '#9aa3ad'; ctx.strokeStyle = '#3a3f45'; ctx.lineWidth = 0.8
  for (const y of [-9, 9]) { ctx.beginPath(); ctx.arc(20, y, 4.5, 0, 7); ctx.fill(); ctx.stroke() }

  if (lost) { ctx.strokeStyle = '#d64545'; ctx.lineWidth = 2.5; body(); ctx.stroke() }
}

// Competition wedge.
function drawFast(ctx, lost) {
  ctx.fillStyle = '#15171a'
  rr(ctx, -24, -35, 22, 12, 3); ctx.fill()
  rr(ctx, -24, 23, 22, 12, 3); ctx.fill()
  ctx.fillStyle = lost ? '#d64545' : '#4d8160'
  ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(-26, -30); ctx.lineTo(-26, 30); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#1b1f24'; rr(ctx, 18, -22, 5, 44, 2); ctx.fill()
}

// Generic two-wheel chassis (Arduino / ESP32 / LEGO etc).
function drawGeneric(ctx, lost) {
  ctx.fillStyle = '#15171a'
  rr(ctx, -16, -37, 26, 13, 3); ctx.fill()
  rr(ctx, -16, 24, 26, 13, 3); ctx.fill()
  ctx.fillStyle = lost ? '#d64545' : '#4d8160'
  ctx.beginPath()
  ctx.moveTo(-38, -24); ctx.lineTo(16, -24); ctx.lineTo(30, 0)
  ctx.lineTo(16, 24); ctx.lineTo(-38, 24); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#13634f'; rr(ctx, -20, -12, 22, 24, 2); ctx.fill()
}
