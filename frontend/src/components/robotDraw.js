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
  if (kind === 'cheetah') return drawCheetah(ctx, lost)
  if (kind === 'ir16') return drawIr16(ctx, lost)
  if (kind === 'lego') return drawEv3(ctx, lost)
  if (kind === 'fast') return drawFast(ctx, lost)
  return drawGeneric(ctx, lost)
}

// LEGO EV3 driving base: the white/grey Intelligent Brick (screen + D-pad, red
// Technic-beam rails), two big 56mm wheels, a front light sensor, rear caster.
function drawEv3(ctx, lost) {
  // big wheels (~56mm), mid-body
  ctx.fillStyle = '#1b1d1f'
  rr(ctx, -30, -41, 56, 16, 4); ctx.fill()
  rr(ctx, -30, 25, 56, 16, 4); ctx.fill()
  ctx.fillStyle = '#d9b43a' // yellow hubs
  for (const y of [-33, 33]) { ctx.beginPath(); ctx.arc(-2, y, 3, 0, 7); ctx.fill() }
  // rear caster
  ctx.fillStyle = '#3a3f45'; ctx.beginPath(); ctx.arc(-58, 0, 5, 0, 7); ctx.fill()

  // brick body
  const body = () => rr(ctx, -54, -30, 76, 60, 6)
  ctx.fillStyle = '#e9ecee'; ctx.strokeStyle = '#c1c6ca'; ctx.lineWidth = 1
  body(); ctx.fill(); ctx.stroke()
  // red side rails
  ctx.fillStyle = '#d23b32'
  rr(ctx, -54, -31, 76, 5, 2); ctx.fill()
  rr(ctx, -54, 26, 76, 5, 2); ctx.fill()
  // screen (toward front)
  ctx.fillStyle = '#c2cabc'; rr(ctx, -26, -18, 30, 24, 2); ctx.fill()
  // D-pad (toward rear)
  ctx.fillStyle = '#9aa0a6'; ctx.beginPath(); ctx.arc(-40, 0, 8, 0, 7); ctx.fill()
  ctx.fillStyle = '#6b7176'; ctx.beginPath(); ctx.arc(-40, 0, 2.6, 0, 7); ctx.fill()
  // front light-sensor arm
  ctx.fillStyle = '#b9c0c6'; rr(ctx, 20, -11, 14, 22, 2); ctx.fill()

  if (lost) { ctx.strokeStyle = '#d64545'; ctx.lineWidth = 2.5; body(); ctx.stroke() }
}

// ESP32 + wide 16-IR array (from the photo): a broad curved "wing" sensor board
// up front with 16 gold pads, an OLED control board, and big purple foam wheels
// at the rear.
function drawIr16(ctx, lost) {
  // rear wheels (large purple foam)
  ctx.fillStyle = '#6f5f93'
  rr(ctx, -54, -45, 30, 19, 5); ctx.fill()
  rr(ctx, -54, 26, 30, 19, 5); ctx.fill()
  ctx.fillStyle = '#241f30'
  for (const y of [-35, 35]) { ctx.beginPath(); ctx.arc(-30, y, 4, 0, 7); ctx.fill() }

  // control board + OLED
  ctx.fillStyle = '#1b1f24'; rr(ctx, -46, -17, 64, 34, 4); ctx.fill()
  ctx.fillStyle = '#1d6fb8'; rr(ctx, -2, -9, 16, 18, 2); ctx.fill()
  ctx.fillStyle = '#7ec7ff'; rr(ctx, 0, -6, 12, 12, 1); ctx.fill()

  // wide curved sensor wing at the front
  const wing = () => {
    ctx.beginPath()
    ctx.moveTo(14, -60); ctx.lineTo(22, -54)
    ctx.quadraticCurveTo(34, -22, 37, 0)
    ctx.quadraticCurveTo(34, 22, 22, 54); ctx.lineTo(14, 60); ctx.lineTo(9, 54)
    ctx.quadraticCurveTo(25, 20, 25, 0)
    ctx.quadraticCurveTo(25, -20, 9, -54); ctx.closePath()
  }
  ctx.fillStyle = '#15171a'; wing(); ctx.fill()

  // 16 gold sensor pads along the swept leading edge
  ctx.fillStyle = '#c8a93a'
  for (let i = 0; i < 16; i++) {
    const t = (i / 15) * 2 - 1
    ctx.beginPath(); ctx.arc(30 - 12 * t * t, t * 56, 1.8, 0, 7); ctx.fill()
  }

  if (lost) { ctx.strokeStyle = '#d64545'; ctx.lineWidth = 2.5; wing(); ctx.stroke() }
}

// DFRobot Maqueen (from the top-down photos): two tyres at the REAR, a 3xAAA
// battery pack between them, the micro:bit edge connector across the middle,
// and a pointed front PCB with two ultrasonic eyes + three close line sensors.
function drawMaqueen(ctx, lost) {
  // tyres at the rear
  ctx.fillStyle = '#15171a'
  rr(ctx, -50, -40, 26, 13, 3); ctx.fill()
  rr(ctx, -50, 27, 26, 13, 3); ctx.fill()
  ctx.fillStyle = '#b9952f' // brass hubs
  for (const y of [-33, 33]) { ctx.beginPath(); ctx.arc(-37, y, 2.4, 0, 7); ctx.fill() }

  // chassis with pointed nose at +x
  const body = () => {
    ctx.beginPath()
    ctx.moveTo(-46, -26); ctx.lineTo(15, -26); ctx.lineTo(34, 0)
    ctx.lineTo(15, 26); ctx.lineTo(-46, 26); ctx.closePath()
  }
  ctx.fillStyle = '#262b32'; body(); ctx.fill()

  // battery pack (rear, between the wheels)
  ctx.fillStyle = '#3c434d'; rr(ctx, -44, -18, 28, 36, 3); ctx.fill()
  ctx.strokeStyle = '#2a2f37'; ctx.lineWidth = 1
  for (const y of [-6, 6]) { ctx.beginPath(); ctx.moveTo(-44, y); ctx.lineTo(-16, y); ctx.stroke() }

  // micro:bit edge connector (mid)
  ctx.fillStyle = '#c8a93a'; rr(ctx, -2, -20, 4, 40, 1); ctx.fill()

  // ultrasonic eyes near the nose
  ctx.fillStyle = '#9aa3ad'; ctx.strokeStyle = '#3a3f45'; ctx.lineWidth = 0.8
  for (const y of [-9, 9]) { ctx.beginPath(); ctx.arc(22, y, 4.2, 0, 7); ctx.fill(); ctx.stroke() }

  if (lost) { ctx.strokeStyle = '#d64545'; ctx.lineWidth = 2.5; body(); ctx.stroke() }
}

// Cheetah Fast LFR (from the photo): blue hourglass chassis, red 8-sensor PCB
// at the front, white sensors on the front corners, small wheels at the rear.
function drawCheetah(ctx, lost) {
  // rear wheels
  ctx.fillStyle = '#15171a'
  rr(ctx, -54, -39, 26, 13, 3); ctx.fill()
  rr(ctx, -54, 26, 26, 13, 3); ctx.fill()
  ctx.fillStyle = '#b9952f'
  for (const y of [-32, 32]) { ctx.beginPath(); ctx.arc(-30, y, 2.2, 0, 7); ctx.fill() }

  // blue acrylic chassis: front lobe + rear lobe joined by a waist
  ctx.fillStyle = '#2f86d8'
  rr(ctx, 4, -34, 28, 68, 12); ctx.fill()    // front lobe
  rr(ctx, -58, -32, 30, 64, 12); ctx.fill()  // rear lobe
  rr(ctx, -32, -18, 40, 36, 6); ctx.fill()   // waist

  // red sensor PCB across the front
  ctx.fillStyle = '#c0392b'; rr(ctx, 24, -30, 10, 60, 2); ctx.fill()

  // white front-corner sensors
  ctx.fillStyle = '#efe9da'; ctx.strokeStyle = '#cfc8b6'; ctx.lineWidth = 0.8
  for (const y of [-30, 30]) { ctx.beginPath(); ctx.arc(24, y, 4.5, 0, 7); ctx.fill(); ctx.stroke() }

  if (lost) {
    ctx.strokeStyle = '#d64545'; ctx.lineWidth = 2.5
    rr(ctx, 24, -30, 10, 60, 2); ctx.stroke()
  }
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
