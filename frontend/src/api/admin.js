// Admin/ops API helpers. All under /api/admin (restricted by nginx in prod).
const BASE = '/api/admin'
const TOKEN_KEY = 'pidsim_admin_token'

// The deploy/test/restart routes also require the X-Admin-Token header
// (app-level gate, in addition to nginx's Basic Auth) — see
// backend/app/routers/admin.py. Ask for it once per tab and remember it.
export function getAdminToken() {
  let token = sessionStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = window.prompt('Admin token (X-Admin-Token) for deploy/test/restart:') || ''
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

async function post(path, { auth = false } = {}) {
  const headers = auth ? { 'X-Admin-Token': getAdminToken() } : undefined
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers })
  if (auth && (res.status === 401 || res.status === 503)) clearAdminToken()
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
export const runDeploy = () => post('/deploy', { auth: true })
export const runTests = () => post('/test', { auth: true })
export const restart = () => post('/restart', { auth: true })
export const listRobots = () => get('/robots')
export const listCourses = () => get('/courses')
export const uploadRobot = (file) => upload('/robots', file)
export const uploadCourse = (file) => upload('/courses', file)

// Reduce a results array to true only if every step's rc is 0.
export const allPassed = (results) =>
  Array.isArray(results) && results.length > 0 && results.every((r) => r.rc === 0)
