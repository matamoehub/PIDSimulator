import { describe, expect, it } from 'vitest'
import { allPassed } from './admin.js'

describe('allPassed', () => {
  it('is true only when every step rc is 0', () => {
    expect(allPassed([{ rc: 0 }, { rc: 0 }])).toBe(true)
  })
  it('is false if any step failed', () => {
    expect(allPassed([{ rc: 0 }, { rc: 1 }])).toBe(false)
  })
  it('is false for empty or non-array input', () => {
    expect(allPassed([])).toBe(false)
    expect(allPassed(null)).toBe(false)
  })
})
