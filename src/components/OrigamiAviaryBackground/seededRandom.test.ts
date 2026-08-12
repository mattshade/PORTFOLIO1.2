import { describe, expect, it } from 'vitest'
import { createMulberry32 } from './seededRandom'

describe('seededRandom', () => {
  it('createMulberry32 is deterministic for a seed', () => {
    const a = createMulberry32(12345)
    const b = createMulberry32(12345)
    const seqA = [a(), a(), a()]
    const seqB = [b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('createMulberry32 returns values in [0, 1)', () => {
    const rand = createMulberry32(0x41766972)
    for (let i = 0; i < 100; i += 1) {
      const v = rand()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
