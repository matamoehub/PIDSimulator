// Admin/ops API helpers. All under /api/admin (restricted by nginx in prod).
const BASE = '/api/admin'

async function post(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'POST' })
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return res.json()
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return res.json()
}

async function upload(path, file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}${path}`, { method: 'POST', body: form })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.detail || `${path} -> ${res.status}`)
  return body
}

export const getStatus = () => get('/status')
export const runDeploy = () => post('/deploy')
export const runTests = () => post('/test')
export const restart = () => post('/restart')
export const listRobots = () => get('/robots')
export const listCourses = () => get('/courses')
export const uploadRobot = (file) => upload('/robots', file)
export const uploadCourse = (file) => upload('/courses', file)

// Reduce a results array to true only if every step's rc is 0.
export const allPassed = (results) =>
  Array.isArray(results) && results.length > 0 && results.every((r) => r.rc === 0)
