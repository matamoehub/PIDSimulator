// Top-down robot icons. Each is drawn facing "up" (front = top), so the row of
// IR sensors sits at the top edge — matching the robot's forward perspective.
// Colours use the Matamoe CSS variables so they theme consistently.

const G = 'var(--mat-green)'
const GL = 'var(--mat-green-light)'
const DARK = '#2d3940'
const SENSE = 'var(--mat-teal)'

function Wheels({ x0 = 4, x1 = 52, y = 20, w = 8, h = 24 }) {
  return (
    <>
      <rect x={x0} y={y} width={w} height={h} rx="3" fill={DARK} />
      <rect x={x1} y={y} width={w} height={h} rx="3" fill={DARK} />
    </>
  )
}

// A row of n sensor dots across the front edge.
function Sensors({ n, y = 13, x0 = 18, x1 = 46, r = 2, color = SENSE }) {
  const dots = []
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? 32 : x0 + ((x1 - x0) * i) / (n - 1)
    dots.push(<circle key={i} cx={x} cy={y} r={r} fill={color} />)
  }
  return <>{dots}</>
}

function Studs() {
  const dots = []
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      dots.push(<circle key={`${r}-${c}`} cx={24 + c * 8} cy={26 + r * 8} r="2" fill={GL} />)
  return <>{dots}</>
}

const SHAPES = {
  maqueen: (
    <>
      {/* tyres */}
      <rect x="3" y="20" width="9" height="22" rx="3" fill="#15171a" />
      <rect x="52" y="20" width="9" height="22" rx="3" fill="#15171a" />
      <circle cx="7.5" cy="31" r="2" fill="#b9952f" />
      <circle cx="56.5" cy="31" r="2" fill="#b9952f" />
      {/* chassis with pointed front (nose up) */}
      <polygon points="32,6 47,18 47,52 17,52 17,18" fill="#262b32" />
      {/* battery pack (rear) */}
      <rect x="20" y="34" width="24" height="18" rx="2" fill="#3c434d" />
      <line x1="28" y1="34" x2="28" y2="52" stroke="#2a2f37" />
      <line x1="36" y1="34" x2="36" y2="52" stroke="#2a2f37" />
      {/* micro:bit edge connector */}
      <rect x="18" y="30" width="28" height="3" rx="1" fill="#c8a93a" />
      {/* ultrasonic eyes */}
      <circle cx="26" cy="18" r="4" fill="#9aa3ad" stroke="#3a3f45" />
      <circle cx="38" cy="18" r="4" fill="#9aa3ad" stroke="#3a3f45" />
      {/* line sensors at the nose */}
      <circle cx="28" cy="10" r="1.6" fill={SENSE} />
      <circle cx="32" cy="9" r="1.6" fill={SENSE} />
      <circle cx="36" cy="10" r="1.6" fill={SENSE} />
    </>
  ),
  lego: (
    <>
      <Wheels x0={3} x1={53} y={16} w={9} h={30} />
      <rect x="14" y="14" width="36" height="38" rx="3" fill={G} />
      <Studs />
      <Sensors n={2} x0={26} x1={38} />
    </>
  ),
  spike: (
    <>
      <Wheels x0={4} x1={52} y={18} w={8} h={28} />
      <rect x="15" y="14" width="34" height="38" rx="8" fill={G} />
      <circle cx="32" cy="34" r="7" fill={GL} />
      <Sensors n={3} x0={24} x1={40} />
    </>
  ),
  arduino: (
    <>
      <Wheels y={18} h={28} />
      <rect x="13" y="14" width="38" height="38" rx="3" fill={G} />
      <rect x="22" y="28" width="20" height="14" rx="2" fill="#13634f" />
      <rect x="24" y="22" width="16" height="4" rx="1" fill={DARK} />
      <Sensors n={5} x0={20} x1={44} />
    </>
  ),
  qtr8: (
    <>
      <Wheels y={20} h={26} />
      <rect x="13" y="16" width="38" height="36" rx="3" fill={G} />
      <rect x="14" y="11" width="36" height="6" rx="2" fill={DARK} />
      <Sensors n={8} x0={17} x1={47} y={14} r={1.6} />
    </>
  ),
  ir16: (
    <>
      <Wheels x0={2} x1={54} y={22} h={24} />
      <rect x="11" y="16" width="42" height="36" rx="3" fill={G} />
      <rect x="10" y="10" width="44" height="6" rx="2" fill={DARK} />
      <Sensors n={8} x0={14} x1={50} y={13} r={1.5} />
      <Sensors n={8} x0={16} x1={48} y={13} r={1.5} />
    </>
  ),
  fast: (
    <>
      <Wheels x0={6} x1={50} y={30} h={20} />
      <polygon points="32,8 52,52 12,52" fill={G} />
      <rect x="16" y="10" width="32" height="5" rx="2" fill={DARK} />
      <Sensors n={7} x0={19} x1={45} y={12.5} r={1.5} />
      <circle cx="32" cy="40" r="5" fill={DARK} />
    </>
  ),
}

export default function RobotIcon({ kind, size = 56, className }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${kind || 'robot'} top-down icon`}
    >
      {SHAPES[kind] || SHAPES.arduino}
    </svg>
  )
}
