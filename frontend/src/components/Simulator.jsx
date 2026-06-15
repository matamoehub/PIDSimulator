import { useEffect, useState } from 'react'
import { Badge, Button, Col, Form, Row } from 'react-bootstrap'
import { useSimulation } from '../hooks/useSimulation.js'
import { getRobots } from '../api/client.js'
import { DEFAULT_PLATFORM } from '../sim/engine.js'
import { listTracks } from '../sim/tracks.js'
import { LESSONS } from '../teaching/lessons.js'
import TrackCanvas from './TrackCanvas.jsx'
import Telemetry from './Telemetry.jsx'
import RobotIcon from './RobotIcon.jsx'
import WizardPanel from './WizardPanel.jsx'

const TRACKS = listTracks()
const FALLBACK = { ...DEFAULT_PLATFORM, name: 'ESP32 QTR-8RC (default)', icon: 'qtr8', builtin: true }

export default function Simulator() {
  const sim = useSimulation({ track: 'circle', pid: { kp: 30, ki: 0, kd: 20 } })
  const [robots, setRobots] = useState([FALLBACK])
  const [platformId, setPlatformId] = useState(FALLBACK.id)
  const [track, setTrackName] = useState('circle')
  const [sensorCount, setSensorCountState] = useState(8)
  const [kp, setKp] = useState(30)
  const [ki, setKi] = useState(0)
  const [kd, setKd] = useState(20)
  const [base, setBase] = useState(150)
  const [ts, setTs] = useState(10)
  const [showTrail, setShowTrail] = useState(true)
  const [trailNonce, setTrailNonce] = useState(0)
  const [teachOn, setTeachOn] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    getRobots()
      .then((list) => {
        if (!list?.length) return
        setRobots(list)
        applyPlatform(list.find((r) => r.id === 'esp32_qtr8') || list[0])
      })
      .catch(() => {/* offline: keep FALLBACK */})
  }, []) // eslint-disable-line

  useEffect(() => { sim.setPid({ kp, ki, kd }) }, [kp, ki, kd]) // eslint-disable-line
  useEffect(() => { sim.setBaseSpeed(base) }, [base]) // eslint-disable-line
  useEffect(() => { sim.setTsMs(ts) }, [ts]) // eslint-disable-line
  useEffect(() => { sim.setSensorCount(sensorCount); sim.reset() }, [sensorCount]) // eslint-disable-line

  const platform = robots.find((r) => r.id === platformId) || FALLBACK
  const sensorOptions = platform.sensor_count_options || [8]

  function applyPlatform(p) {
    sim.setPlatform(p)
    setPlatformId(p.id)
    setSensorCountState(p.sensor_count_options[0])
    setBase(p.default_base_speed)
    setTs(p.loop_time_ms)
  }

  const onTrack = (name) => { setTrackName(name); sim.setTrack(name) }
  const onStop = () => { sim.pause(); sim.reset() }

  // Apply a lesson's suggested setup (track + gains + speed).
  function applyLesson(s) {
    onTrack(s.track)
    setKp(s.kp); setKi(s.ki); setKd(s.kd); setBase(s.base)
    sim.reset()
  }

  // Highlight class for a control when the active lesson references it.
  const hl = (key) =>
    teachOn && LESSONS[stepIndex].highlight.includes(key) ? 'tt-highlight' : ''

  return (
    <Row className="g-0 app-body">
      {/* Column 1 — Controls */}
      <Col xs={12} md={3} className="panel panel-controls p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="section-label text-uppercase mb-0">Controls</h6>
          <Button
            size="sm"
            variant={teachOn ? 'success' : 'outline-success'}
            onClick={() => setTeachOn((v) => !v)}
          >
            Tutorial
          </Button>
        </div>

        <Form.Group className={`mb-2 ${hl('platform')}`}>
          <Form.Label className="small mb-1">Robot platform</Form.Label>
          <div className="d-flex align-items-center gap-2">
            <RobotIcon kind={platform.icon} size={44} />
            <Form.Select
              size="sm"
              value={platformId}
              onChange={(e) => applyPlatform(robots.find((r) => r.id === e.target.value))}
            >
              {robots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Form.Select>
          </div>
          <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
            {platform.motor_max_rpm} RPM · range {platform.motor_speed_range?.join('–')} ·
            {' '}loop {platform.loop_time_ms}ms · {platform.code_target}
          </div>
        </Form.Group>

        <Form.Group className={`mb-3 ${hl('track')}`}>
          <Form.Label className="small mb-1">Track</Form.Label>
          <Form.Select size="sm" value={track} onChange={(e) => onTrack(e.target.value)}>
            {TRACKS.map((t) => (
              <option key={t.name} value={t.name}>{t.label} · {t.difficulty}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className={`mb-3 ${hl('sensor')}`}>
          <Form.Label className="small mb-1">Sensor count</Form.Label>
          <Form.Select
            size="sm"
            value={sensorCount}
            onChange={(e) => setSensorCountState(Number(e.target.value))}
            disabled={sensorOptions.length === 1}
          >
            {sensorOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </Form.Select>
        </Form.Group>

        <Slider label="Kp" value={kp} min={0} max={80} step={1} onChange={setKp} cls={hl('kp')} />
        <Slider label="Ki" value={ki} min={0} max={20} step={0.5} onChange={setKi} cls={hl('ki')} />
        <Slider label="Kd" value={kd} min={0} max={80} step={1} onChange={setKd} cls={hl('kd')} />
        <Slider label="Base speed" value={base} min={20} max={Math.max(...platform.motor_speed_range)} step={5} onChange={setBase} cls={hl('base')} />
        <Slider label="Ts (ms)" value={ts} min={2} max={50} step={1} onChange={setTs} cls={hl('ts')} />

        <div className="d-flex gap-2 mt-3">
          {sim.running ? (
            <Button size="sm" variant="warning" onClick={sim.pause}>Pause</Button>
          ) : (
            <Button size="sm" variant="primary" onClick={sim.start}>Start</Button>
          )}
          <Button size="sm" variant="danger" onClick={onStop}>Stop</Button>
          <Button size="sm" variant="outline-secondary" onClick={sim.reset}>Reset</Button>
        </div>

        <div className="d-flex align-items-center justify-content-between mt-3">
          <Form.Check
            type="switch"
            id="trail-toggle"
            label="Show trail"
            checked={showTrail}
            onChange={(e) => setShowTrail(e.target.checked)}
          />
          <Button size="sm" variant="outline-secondary" onClick={() => setTrailNonce((n) => n + 1)}>
            Clear trail
          </Button>
        </div>
      </Col>

      {/* Column 2 — Main */}
      <Col xs={12} md={9} className="panel p-3">
        {teachOn && (
          <WizardPanel
            index={stepIndex}
            onIndex={setStepIndex}
            onApply={applyLesson}
            onClose={() => setTeachOn(false)}
          />
        )}

        <div className="mat-card sensor-bar mb-2">
          <SensorLeds tick={sim.tick} />
        </div>

        <div className="d-flex justify-content-between align-items-center mb-2 small text-muted px-1">
          <span>t = {((sim.tick.elapsed_ms || 0) / 1000).toFixed(1)}s</span>
          {sim.tick.line_lost && <Badge bg="danger">line lost</Badge>}
          <span>L {Math.round(sim.tick.left_speed)} · R {Math.round(sim.tick.right_speed)}</span>
        </div>

        <div className="canvas-stage mb-3" style={{ width: '56%', margin: '0 auto' }}>
          <TrackCanvas
            track={sim.engine.track}
            tick={sim.tick}
            showTrail={showTrail}
            trailNonce={trailNonce}
          />
        </div>

        <h6 className={`section-label text-uppercase ${hl('telemetry')}`}>Telemetry</h6>
        <div className={hl('telemetry')}>
          <Telemetry tick={sim.tick} />
        </div>
      </Col>
    </Row>
  )
}

function Slider({ label, value, min, max, step, onChange, cls = '' }) {
  return (
    <Form.Group className={`mb-2 ${cls}`}>
      <div className="d-flex justify-content-between small">
        <span>{label}</span>
        <code className="text-muted">{value}</code>
      </div>
      <Form.Range
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Form.Group>
  )
}

function SensorLeds({ tick }) {
  const active = tick.sensor_active || []
  if (active.length === 0) {
    return <span className="small text-muted">sensors — press Start</span>
  }
  return active.map((on, i) => (
    <span key={i} title={`sensor ${i}`} className={`sensor-led${on ? ' on' : ''}`} />
  ))
}
