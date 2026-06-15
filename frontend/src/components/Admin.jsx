import { useEffect, useRef, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap'
import {
  getStatus, runDeploy, runTests, restart,
  listRobots, listCourses, uploadRobot, uploadCourse,
} from '../api/admin.js'

// Ops console: 1-click pull+install+test+restart, plus robot/course uploads.
export default function Admin() {
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(null) // 'deploy' | 'test' | 'restart' | null
  const [results, setResults] = useState(null)
  const [robots, setRobots] = useState([])
  const [courses, setCourses] = useState([])
  const [msg, setMsg] = useState(null)

  const refreshStatus = () => getStatus().then(setStatus).catch(() => setStatus(null))
  const refreshLists = () => {
    listRobots().then(setRobots).catch(() => {})
    listCourses().then(setCourses).catch(() => {})
  }
  useEffect(() => { refreshStatus(); refreshLists() }, [])

  const run = (name, fn) => async () => {
    setBusy(name); setResults(null); setMsg(null)
    try {
      const res = await fn()
      setResults(res.results)
      setMsg({ ok: res.success, text: res.success ? `${name} succeeded` : `${name} failed` })
    } catch (e) {
      setMsg({ ok: false, text: `${name} error: ${e.message}` })
    } finally {
      setBusy(null); refreshStatus()
    }
  }

  return (
    <Container fluid className="p-4">
      <h4 className="mb-3">Admin / Ops Console</h4>

      <Alert variant="warning" className="py-2 small">
        This console can pull, install, test, and restart the app, and accepts
        uploads — treat it as remote shell access. Restrict it (SSL / auth / IP
        allowlist) before exposing the host publicly.
      </Alert>

      <Row className="g-4">
        <Col lg={7}>
          <Card bg="dark" text="light" className="mb-4">
            <Card.Header>Deploy</Card.Header>
            <Card.Body>
              <div className="d-flex gap-2 mb-3">
                <Button onClick={run('deploy', runDeploy)} disabled={busy}>
                  {busy === 'deploy' && <Spinner size="sm" className="me-2" />}
                  Pull · Install · Build · Test · Restart
                </Button>
                <Button variant="outline-light" onClick={run('test', runTests)} disabled={busy}>
                  {busy === 'test' && <Spinner size="sm" className="me-2" />}
                  Run all tests
                </Button>
                <Button variant="outline-warning" onClick={run('restart', restart)} disabled={busy}>
                  Restart
                </Button>
              </div>
              {msg && (
                <Alert variant={msg.ok ? 'success' : 'danger'} className="py-2 small mb-3">
                  {msg.text}
                </Alert>
              )}
              {results && <StepResults results={results} />}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card bg="dark" text="light" className="mb-4">
            <Card.Header>Git status</Card.Header>
            <Card.Body className="small">
              {status ? (
                <>
                  <div>Branch: <Badge bg="secondary">{status.branch || '—'}</Badge></div>
                  <div>Ahead/behind: <code>{status.ahead_behind || '0\t0'}</code></div>
                  <div className="mt-2 text-secondary">Remote: {status.remote || '—'}</div>
                  <pre className="mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{status.log}</pre>
                </>
              ) : (
                <span className="text-secondary">Status unavailable (not a deployed checkout?)</span>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <UploadCard
            title="Robots"
            accept=".json"
            hint="Upload a robot platform config (.json)."
            items={robots.map((r) => `${r.id} — ${r.name}`)}
            onUpload={uploadRobot}
            onDone={refreshLists}
          />
        </Col>
        <Col lg={6}>
          <UploadCard
            title="Courses"
            accept=".json,.svg"
            hint="Upload a track as .json or .svg (SVG is sanitised)."
            items={courses.map((c) => `${c.name}.${c.format}`)}
            onUpload={uploadCourse}
            onDone={refreshLists}
          />
        </Col>
      </Row>
    </Container>
  )
}

function StepResults({ results }) {
  return (
    <div>
      {results.map((r, i) => (
        <div key={i} className="mb-2">
          <Badge bg={r.rc === 0 ? 'success' : 'danger'} className="me-2">
            {r.rc === 0 ? 'ok' : `rc ${r.rc}`}
          </Badge>
          <strong>{r.label}</strong>
          <div className="text-secondary"><code>{r.cmd}</code></div>
          {r.stdout && <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{r.stdout}</pre>}
          {r.stderr && <pre className="mb-0 small text-danger" style={{ whiteSpace: 'pre-wrap' }}>{r.stderr}</pre>}
        </div>
      ))}
    </div>
  )
}

function UploadCard({ title, accept, hint, items, onUpload, onDone }) {
  const inputRef = useRef(null)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(null)

  const onChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErr(null); setOk(null)
    try {
      await onUpload(file)
      setOk(`Uploaded ${file.name}`)
      onDone()
    } catch (ex) {
      setErr(ex.message)
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Card bg="dark" text="light" className="mb-4">
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        <p className="small text-secondary">{hint}</p>
        <input ref={inputRef} type="file" accept={accept} onChange={onChange}
               className="form-control form-control-sm mb-2" />
        {ok && <Alert variant="success" className="py-1 small mb-2">{ok}</Alert>}
        {err && <Alert variant="danger" className="py-1 small mb-2">{err}</Alert>}
        <ul className="small mb-0">
          {items.length === 0 && <li className="text-secondary">None yet</li>}
          {items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      </Card.Body>
    </Card>
  )
}
