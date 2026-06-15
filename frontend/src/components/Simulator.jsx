import { useEffect, useState } from 'react'
import { Badge, Button, Col, Form, Row } from 'react-bootstrap'
import { useSimulation } from '../hooks/useSimulation.js'
import { listTracks } from '../sim/tracks.js'
import TrackCanvas from './TrackCanvas.jsx'
import Telemetry from './Telemetry.jsx'

const TRACKS = listTracks()
const SENSOR_COUNTS = [1, 2, 3, 5, 8, 12, 16]

export default function Simulator() {
  const sim = useSimulation({ track: 'circle', pid: { kp: 30, ki: 0, kd: 20 } })
  const [track, setTrackName] = useState('circle')
  const [sensorCount, setSensorCountState] = useState(8)
  const [kp, setKp] = useState(30)
  const [ki, setKi] = useState(0)
  const [kd, setKd] = useState(20)
  const [base, setBase] = useState(150)
  const [ts, setTs] = useState(10)

  // Push live control changes into the engine without restarting the run.
  useEffect(() => { sim.setPid({ kp, ki, kd }) }, [kp, ki, kd]) // eslint-disable-line
  useEffect(() => { sim.setBaseSpeed(base) }, [base]) // eslint-disable-line
  useEffect(() => { sim.setTsMs(ts) }, [ts]) // eslint-disable-line
  useEffect(() => { sim.setSensorCount(sensorCount); sim.reset() }, [sensorCount]) // eslint-disable-line

  const onTrack = (name) => { setTrackName(name); sim.setTrack(name) }

  return (
    <Row className="g-0 app-body">
      {/* Controls */}
      <Col xs={3} className="panel panel-controls p-3">
        <h6 className="text-uppercase text-secondary">Controls</h6>

        <Form.Group className="mb-3">
          <Form.Label className="small mb-1">Track</Form.Label>
          <Form.Select size="sm" value={track} onChange={(e) => onTrack(e.target.value)}>
            {TRACKS.map((t) => (
              <option key={t.name} value={t.name}>{t.label} · {t.difficulty}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small mb-1">Sensor count</Form.Label>
          <Form.Select
            size="sm"
            value={sensorCount}
            onChange={(e) => setSensorCountState(Number(e.target.value))}
          >
            {SENSOR_COUNTS.map((n) => <option key={n} value={n}>{n}</option>)}
          </Form.Select>
        </Form.Group>

        <Slider label="Kp" value={kp} min={0} max={80} step={1} onChange={setKp} />
        <Slider label="Ki" value={ki} min={0} max={20} step={0.5} onChange={setKi} />
        <Slider label="Kd" value={kd} min={0} max={80} step={1} onChange={setKd} />
        <Slider label="Base speed" value={base} min={20} max={255} step={5} onChange={setBase} />
        <Slider label="Ts (ms)" value={ts} min={2} max={50} step={1} onChange={setTs} />

        <div className="d-flex gap-2 mt-3">
          {sim.running ? (
            <Button size="sm" variant="warning" onClick={sim.pause}>Pause</Button>
          ) : (
            <Button size="sm" variant="success" onClick={sim.start}>Start</Button>
          )}
          <Button size="sm" variant="outline-light" onClick={sim.reset}>Reset</Button>
        </div>
      </Col>

      {/* Canvas */}
      <Col xs={6} className="panel p-3">
        <div className="d-flex justify-content-between mb-2">
          <span className="small text-secondary">
            t = {((sim.tick.elapsed_ms || 0) / 1000).toFixed(1)}s
          </span>
          {sim.tick.line_lost && <Badge bg="danger">line lost</Badge>}
          <span className="small text-secondary">
            L {Math.round(sim.tick.left_speed)} · R {Math.round(sim.tick.right_speed)}
          </span>
        </div>
        <TrackCanvas track={sim.engine.track} tick={sim.tick} />
        <SensorBar tick={sim.tick} />
      </Col>

      {/* Telemetry */}
      <Col xs={3} className="panel panel-telemetry p-3">
        <h6 className="text-uppercase text-secondary">Telemetry</h6>
        <Telemetry tick={sim.tick} />
      </Col>
    </Row>
  )
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <Form.Group className="mb-2">
      <div className="d-flex justify-content-between small">
        <span>{label}</span>
        <code className="text-secondary">{value}</code>
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

// Top-down sensor strip: the bar the robot "sees", lit where over the line.
function SensorBar({ tick }) {
  const active = tick.sensor_active || []
  return (
    <div className="d-flex justify-content-center gap-1 mt-2">
      {active.map((on, i) => (
        <span
          key={i}
          title={`sensor ${i}`}
          style={{
            width: 16, height: 16, borderRadius: '50%',
            background: on ? '#ffffff' : '#3a4150',
            border: '1px solid #11131a',
          }}
        />
      ))}
    </div>
  )
}
