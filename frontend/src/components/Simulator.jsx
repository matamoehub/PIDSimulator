import { useEffect, useState } from 'react'
import { Badge, Button, Col, Container, Row } from 'react-bootstrap'
import { getHealth } from '../api/client.js'

// M0 shell: the three-panel layout from the spec. Panels are placeholders that
// later milestones fill in (controls, canvas renderer, telemetry graphs).
export default function Simulator() {
  const [api, setApi] = useState('checking')

  useEffect(() => {
    getHealth()
      .then(() => setApi('ok'))
      .catch(() => setApi('down'))
  }, [])

  return (
    <Container fluid className="app-body p-0">
      <div className="d-flex align-items-center gap-2 px-3 py-2 border-bottom">
        <Button size="sm" variant="outline-light" disabled>Robot Platform ▾</Button>
        <Button size="sm" variant="outline-light" disabled>Sensor Count ▾</Button>
        <Button size="sm" variant="outline-light" disabled>Calibrate</Button>
        <Badge
          className="ms-auto"
          bg={api === 'ok' ? 'success' : api === 'down' ? 'danger' : 'secondary'}
        >
          API: {api}
        </Badge>
      </div>

      <Row className="g-0">
        <Col xs={3} className="panel panel-controls p-3">
          <h6 className="text-uppercase text-secondary">Controls</h6>
          <p className="text-secondary small">
            Track select, PID sliders (Kp, Ki, Kd), sampling time, base speed,
            START / RESET. Built in M3.
          </p>
        </Col>

        <Col xs={6} className="panel">
          <div className="canvas-stage">
            <div className="canvas-placeholder">Track canvas — M2</div>
          </div>
        </Col>

        <Col xs={3} className="panel panel-telemetry p-3">
          <h6 className="text-uppercase text-secondary">Telemetry</h6>
          <ul className="small list-unstyled">
            <li style={{ color: 'var(--tel-error)' }}>Error (PV)</li>
            <li style={{ color: 'var(--tel-p)' }}>P-Term</li>
            <li style={{ color: 'var(--tel-i)' }}>I-Term</li>
            <li style={{ color: 'var(--tel-d)' }}>D-Term</li>
          </ul>
          <p className="text-secondary small">Live graphs built in M2.</p>
        </Col>
      </Row>
    </Container>
  )
}
