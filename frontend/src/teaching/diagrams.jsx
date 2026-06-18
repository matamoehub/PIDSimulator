// Inline concept diagrams rendered in WizardPanel intro slides.
// Each export is a React component — no props needed, purely illustrative.

const G   = '#4d8160'   // mat-green
const GL  = '#83b075'   // mat-green-light
const T   = '#7ebec5'   // mat-teal
const TXT = '#2d3940'
const MUT = '#888'
const BD  = '#d6e8da'
const BG2 = '#f0f5f1'
const RED = '#d64545'
const ORG = '#e08a1e'

// ── shared primitives ────────────────────────────────────────────────────────

function Box({ x, y, w, h, fill, stroke, r = 8, children }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke || BD}
        strokeWidth="1.5" rx={r}/>
      {children}
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, color = MUT }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.8"
      markerEnd={`url(#arr-${color.replace('#','')})`}/>
  )
}

function ArrowDefs({ colors = [MUT, G, T, RED, ORG] }) {
  return (
    <defs>
      {colors.map((c) => (
        <marker key={c} id={`arr-${c.replace('#','')}`}
          markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={c}/>
        </marker>
      ))}
    </defs>
  )
}

// ── Diagram A: what a line follower does ────────────────────────────────────

export function DiagramLineSensor() {
  // 8 sensor X positions across the robot front
  const sxBase = 169
  const sensorXs = Array.from({ length: 8 }, (_, i) => sxBase + i * 14)
  const lineLeft = 208, lineRight = 222 // where the "line" is

  return (
    <svg viewBox="0 0 440 190" style={{ width: '100%', maxWidth: 440, display: 'block' }}>
      <ArrowDefs />

      {/* Track surface */}
      <rect x="148" y="0" width="144" height="190" fill="#ede9df" rx="4"/>
      {/* Black line stripe */}
      <rect x={lineLeft} y="0" width={lineRight - lineLeft} height="190" fill="#1a1a1a"/>

      {/* Robot body */}
      <rect x="160" y="54" width="120" height="80" fill={G} rx="10"/>
      {/* Chassis detail */}
      <rect x="172" y="66" width="96" height="56" fill="#3a6149" rx="6"/>
      {/* Sensor bar at front */}
      <rect x="163" y="126" width="114" height="10" fill="#111" rx="4"/>

      {/* Sensor LEDs */}
      {sensorXs.map((sx, i) => {
        const cx = sx + 5
        const onLine = cx >= lineLeft && cx <= lineRight
        return (
          <circle key={i} cx={cx} cy="131" r="4.5"
            fill={onLine ? GL : '#d0dbd2'}
            stroke={onLine ? G : BD} strokeWidth="1"/>
        )
      })}

      {/* Wheels */}
      <rect x="146" y="64" width="16" height="44" fill="#111" rx="5"/>
      <rect x="278" y="64" width="16" height="44" fill="#111" rx="5"/>

      {/* "position" readout box */}
      <Box x="296" y="114" w="130" h="36" fill="white">
        <text x="361" y="127" textAnchor="middle" fill={MUT} fontSize="10" fontFamily="Lexend,sans-serif">sensor position</text>
        <text x="361" y="143" textAnchor="middle" fill={G} fontSize="13" fontFamily="'Changa One',sans-serif" fontWeight="700">= 3.5  (centre)</text>
      </Box>
      <Arrow x1="277" y1="131" x2="296" y2="131" color={G}/>

      {/* Error label */}
      <text x="361" y="100" textAnchor="middle" fill={TXT} fontSize="11" fontFamily="Lexend,sans-serif" fontWeight="600">error = position − centre</text>
      <line x1="361" y1="104" x2="361" y2="114" stroke={MUT} strokeWidth="1" strokeDasharray="3,2"/>

      {/* Left labels */}
      <text x="136" y="26" textAnchor="end" fill={MUT} fontSize="11" fontFamily="Lexend,sans-serif">Track</text>
      <line x1="138" y1="24" x2="148" y2="20" stroke={MUT} strokeWidth="1"/>
      <text x="136" y="50" textAnchor="end" fill="#1a1a1a" fontSize="11" fontFamily="Lexend,sans-serif" fontWeight="700">Line</text>
      <line x1="138" y1="48" x2="210" y2="30" stroke="#1a1a1a" strokeWidth="1"/>

      {/* Goal callout */}
      <text x="6" y="170" fill={TXT} fontSize="11" fontFamily="Lexend,sans-serif" fontWeight="700">Goal:</text>
      <text x="6" y="184" fill={MUT} fontSize="10" fontFamily="Lexend,sans-serif">keep error = 0</text>
    </svg>
  )
}

// ── Diagram B: PID control loop block diagram ────────────────────────────────

export function DiagramPIDLoop() {
  return (
    <svg viewBox="0 0 440 160" style={{ width: '100%', maxWidth: 440, display: 'block' }}>
      <ArrowDefs />

      {/* Setpoint / desired */}
      <text x="4" y="62" fill={MUT} fontSize="10" fontFamily="Lexend,sans-serif">desired</text>
      <text x="4" y="74" fill={TXT} fontSize="10" fontFamily="Lexend,sans-serif" fontWeight="700">(on the line)</text>
      <Arrow x1="72" y1="68" x2="94" y2="68" color={MUT}/>

      {/* Error summing node */}
      <circle cx="106" cy="68" r="12" fill="white" stroke={MUT} strokeWidth="1.5"/>
      <text x="106" y="73" textAnchor="middle" fill={MUT} fontSize="14" fontFamily="monospace">−</text>
      <text x="100" y="65" fill={MUT} fontSize="10" fontFamily="monospace">+</text>
      <Arrow x1="118" y1="68" x2="136" y2="68" color={MUT}/>
      <text x="127" y="62" textAnchor="middle" fill={RED} fontSize="10" fontFamily="Lexend,sans-serif" fontWeight="700">error</text>

      {/* PID block */}
      <Box x="136" y="50" w="88" h="36" fill={BG2}>
        <text x="180" y="66" textAnchor="middle" fill={TXT} fontSize="10" fontFamily="Lexend,sans-serif" fontWeight="700">P · I · D</text>
        <text x="180" y="79" textAnchor="middle" fill={MUT} fontSize="9" fontFamily="Lexend,sans-serif">Kp·e + Ki·∫e + Kd·ė</text>
      </Box>
      <Arrow x1="224" y1="68" x2="244" y2="68" color={G}/>
      <text x="234" y="62" textAnchor="middle" fill={G} fontSize="10" fontFamily="Lexend,sans-serif" fontWeight="700">output</text>

      {/* Motors block */}
      <Box x="244" y="50" w="72" h="36" fill={BG2}>
        <text x="280" y="66" textAnchor="middle" fill={TXT} fontSize="10" fontFamily="Lexend,sans-serif" fontWeight="700">Motors</text>
        <text x="280" y="78" textAnchor="middle" fill={MUT} fontSize="9" fontFamily="Lexend,sans-serif">L / R speed</text>
      </Box>
      <Arrow x1="316" y1="68" x2="336" y2="68" color={MUT}/>

      {/* Robot block */}
      <Box x="336" y="50" w="68" h="36" fill={G}>
        <text x="370" y="73" textAnchor="middle" fill="white" fontSize="11" fontFamily="'Changa One',sans-serif">Robot</text>
      </Box>

      {/* Feedback path */}
      <line x1="370" y1="86" x2="370" y2="120" stroke={T} strokeWidth="1.8"/>
      <line x1="370" y1="120" x2="106" y2="120" stroke={T} strokeWidth="1.8"/>
      <Arrow x1="106" y1="120" x2="106" y2="80" color={T}/>
      <text x="238" y="135" textAnchor="middle" fill={T} fontSize="10" fontFamily="Lexend,sans-serif">sensor feedback (actual position)</text>
    </svg>
  )
}

// ── Diagram C: the three PID terms explained ────────────────────────────────

function TermCard({ letter, color, label, tagline, desc }) {
  return (
    <div style={{
      background: 'white',
      border: `2px solid ${color}`,
      borderRadius: 12,
      padding: '10px 12px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: color, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', fontFamily: "'Changa One',sans-serif",
        margin: '0 auto 6px',
      }}>{letter}</div>
      <div style={{ fontFamily: "'Changa One',sans-serif", color, fontSize: '0.85rem' }}>{label}</div>
      <div style={{ fontSize: '0.72rem', color: MUT, marginBottom: 6 }}>{tagline}</div>
      <div style={{ fontSize: '0.75rem', color: TXT, lineHeight: 1.4 }}>{desc}</div>
    </div>
  )
}

export function DiagramTerms() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        <TermCard letter="P" color={RED} label="Proportional" tagline="the spring"
          desc="Pulls the robot back with force proportional to how far off the line it is. Big error → big correction." />
        <TermCard letter="I" color={G} label="Integral" tagline="the memory"
          desc="Builds up over time to correct a persistent drift that P alone never fully eliminates." />
        <TermCard letter="D" color={ORG} label="Derivative" tagline="the brake"
          desc="Resists rapid change. Damps oscillation by opposing the error when it's already shrinking fast." />
      </div>
      <div style={{ fontSize: '0.78rem', color: MUT, textAlign: 'center' }}>
        output = <strong style={{ color: RED }}>Kp</strong>×error + <strong style={{ color: G }}>Ki</strong>×∫error + <strong style={{ color: ORG }}>Kd</strong>×(Δerror/Ts)
      </div>
    </div>
  )
}
