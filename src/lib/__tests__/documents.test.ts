import { describe, it, expect } from 'vitest'
import { parseDocumentCode, getCategoryFromCode } from '../documents'

describe('documents helpers', () => {
  it('parses CFM code, version, and name from filename', () => {
    const result = parseDocumentCode('CFM-OPS-FRM-004 - Work Appointment Schedule - Rev 14.xlsx')
    expect(result.code).toBe('CFM-OPS-FRM-004')
    expect(result.version).toBe('14')
    expect(result.name.toLowerCase()).toContain('work appointment schedule')
  })

  it('maps code to category id', () => {
    const id = getCategoryFromCode('CFM-OPS-FRM-004')
    expect(id).toBe(4)
  })
})
