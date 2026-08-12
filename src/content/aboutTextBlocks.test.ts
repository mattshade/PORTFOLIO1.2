import { describe, expect, it, vi } from 'vitest'

vi.mock('./aboutText', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./aboutText')>()
  return {
    ...actual,
    ABOUT_PULL_QUOTE_LINES: new Set(['Pull quote line']),
  }
})

import { ABOUT_BLOCKS, buildAboutBlocks } from './aboutTextBlocks'
import { ABOUT_MATT_SHADE_TEXT } from './aboutText'

describe('aboutTextBlocks', () => {
  it('buildAboutBlocks skips blank lines and groups paragraphs', () => {
    const raw = 'Line one\n\nLine two\nLine three'
    const blocks = buildAboutBlocks(raw)
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toEqual({ kind: 'para', lines: ['Line one'] })
    expect(blocks[1]).toEqual({ kind: 'para', lines: ['Line two', 'Line three'] })
  })

  it('buildAboutBlocks preserves pull-quote lines when configured', () => {
    const blocks = buildAboutBlocks('Intro\n\nPull quote line\n\nClosing')
    expect(blocks.map((b) => b.kind)).toEqual(['para', 'pull', 'para'])
  })

  it('ABOUT_BLOCKS matches source copy paragraphs', () => {
    expect(ABOUT_BLOCKS.length).toBeGreaterThan(3)
    expect(ABOUT_BLOCKS.every((b) => b.kind === 'para')).toBe(true)
    expect(ABOUT_BLOCKS[0].kind === 'para' && ABOUT_BLOCKS[0].lines[0]).toContain('designer')
    expect(ABOUT_MATT_SHADE_TEXT).toContain('disciplines')
  })
})
