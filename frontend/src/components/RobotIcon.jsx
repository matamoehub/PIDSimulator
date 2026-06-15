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
      {/* tyres at the rear (bottom) */}
      <rect x="3" y="38" width="9" height="20" rx="3" fill="#15171a" />
      <rect x="52" y="38" width="9" height="20" rx="3" fill="#15171a" />
      <circle cx="7.5" cy="48" r="2" fill="#b9952f" />
      <circle cx="56.5" cy="48" r="2" fill="#b9952f" />
      {/* chassis with pointed front (nose up) */}
      <polygon points="32,6 47,18 47,56 17,56 17,18" fill="#262b32" />
      {/* battery pack (rear, between wheels) */}
      <rect x="21" y="40" width="22" height="16" rx="2" fill="#3c434d" />
      <line x1="28.3" y1="40" x2="28.3" y2="56" stroke="#2a2f37" />
      <line x1="35.7" y1="40" x2="35.7" y2="56" stroke="#2a2f37" />
      {/* micro:bit edge connector (mid) */}
      <rect x="18" y="31" width="28" height="3" rx="1" fill="#c8a93a" />
      {/* ultrasonic eyes near the nose */}
      <circle cx="26" cy="18" r="4" fill="#9aa3ad" stroke="#3a3f45" />
      <circle cx="38" cy="18" r="4" fill="#9aa3ad" stroke="#3a3f45" />
      {/* three close line sensors at the nose */}
      <circle cx="29.5" cy="10" r="1.5" fill={SENSE} />
      <circle cx="32" cy="9.4" r="1.5" fill={SENSE} />
      <circle cx="34.5" cy="10" r="1.5" fill={SENSE} />
    </>
  ),
  cheetah: (
    <>
      {/* rear wheels */}
      <rect x="2" y="42" width="11" height="16" rx="2" fill="#15171a" />
      <rect x="51" y="42" width="11" height="16" rx="2" fill="#15171a" />
      <circle cx="7.5" cy="50" r="1.8" fill="#b9952f" />
      <circle cx="56.5" cy="50" r="1.8" fill="#b9952f" />
      {/* blue hourglass chassis */}
      <path
        d="M12,18 C12,10 22,9 32,9 C42,9 52,10 52,18 C52,24 44,28 44,32 C44,36 52,40 52,46 C52,54 42,56 32,56 C22,56 12,54 12,46 C12,40 20,36 20,32 C20,28 12,24 12,18 Z"
        fill="#2f86d8"
      />
      {/* red 8-sensor PCB at the front */}
      <rect x="14" y="8" width="36" height="9" rx="2" fill="#c0392b" />
      {[...Array(8)].map((_, i) => (
        <circle key={i} cx={18 + i * 4} cy={12.5} r="1.1" fill="#2b2b2b" />
      ))}
      {/* white front-corner sensors */}
      <circle cx="12" cy="14" r="4" fill="#efe9da" stroke="#cfc8b6" />
      <circle cx="52" cy="14" r="4" fill="#efe9da" stroke="#cfc8b6" />
    </>
  ),
  lego: (
    <>
      {/* big wheels (~56mm), mid-body */}
      <rect x="2" y="18" width="12" height="28" rx="3" fill="#1b1d1f" />
      <rect x="50" y="18" width="12" height="28" rx="3" fill="#1b1d1f" />
      <circle cx="8" cy="32" r="3" fill="#d9b43a" />
      <circle cx="56" cy="32" r="3" fill="#d9b43a" />
      {/* rear caster */}
      <circle cx="32" cy="58" r="4" fill="#3a3f45" />
      {/* brick body */}
      <rect x="16" y="8" width="32" height="48" rx="5" fill="#e9ecee" stroke="#c1c6ca" />
      {/* red Technic-beam rails */}
      <rect x="16" y="8" width="4" height="48" rx="2" fill="#d23b32" />
      <rect x="44" y="8" width="4" height="48" rx="2" fill="#d23b32" />
      {/* screen + D-pad */}
      <rect x="22" y="13" width="20" height="16" rx="2" fill="#c2cabc" />
      <circle cx="32" cy="42" r="6" fill="#9aa0a6" />
      <circle cx="32" cy="42" r="2" fill="#6b7176" />
      {/* front light sensors */}
      <circle cx="29" cy="9" r="1.6" fill={SENSE} />
      <circle cx="35" cy="9" r="1.6" fill={SENSE} />
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
      {/* rear purple foam wheels */}
      <rect x="2" y="40" width="14" height="18" rx="3" fill="#6f5f93" />
      <rect x="48" y="40" width="14" height="18" rx="3" fill="#6f5f93" />
      <circle cx="9" cy="49" r="2.5" fill="#241f30" />
      <circle cx="55" cy="49" r="2.5" fill="#241f30" />
      {/* control board + OLED */}
      <rect x="20" y="24" width="24" height="34" rx="3" fill="#1b1f24" />
      <rect x="25" y="30" width="14" height="14" rx="1" fill="#1d6fb8" />
      <rect x="27" y="32" width="10" height="10" fill="#7ec7ff" />
      {/* wide curved sensor wing */}
      <path
        d="M6,32 Q4,14 16,9 Q26,5 32,4 Q38,5 48,9 Q60,14 58,32 L52,32 Q52,16 40,12 Q34,10 32,9 Q30,10 24,12 Q12,16 12,32 Z"
        fill="#15171a"
      />
      {[...Array(16)].map((_, i) => {
        const t = (i / 15) * 2 - 1
        return <circle key={i} cx={32 + t * 24} cy={13 + t * t * 8} r="1.2" fill="#c8a93a" />
      })}
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
