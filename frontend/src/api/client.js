// Thin fetch wrapper. Same-origin /api both in dev (Vite proxy) and prod (nginx).
const BASE = '/api'

export async function getHealth() {
  const res = await fetch(`${BASE}/health`)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

export async function getRobots() {
  const res = await fetch(`${BASE}/robots`)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}
