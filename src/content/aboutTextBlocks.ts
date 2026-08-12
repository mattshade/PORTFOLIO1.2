import { ABOUT_MATT_SHADE_TEXT, ABOUT_PULL_QUOTE_LINES } from './aboutText'

export type AboutBlock = { kind: 'pull'; line: string } | { kind: 'para'; lines: string[] }

export function buildAboutBlocks(raw: string): AboutBlock[] {
  const lines = raw.split('\n')
  const blocks: AboutBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i += 1
      continue
    }

    if (ABOUT_PULL_QUOTE_LINES.has(line)) {
      blocks.push({ kind: 'pull', line })
      i += 1
      continue
    }

    const paraLines: string[] = [line]
    i += 1
    while (i < lines.length) {
      const next = lines[i]
      if (next.trim() === '' || ABOUT_PULL_QUOTE_LINES.has(next)) break
      paraLines.push(next)
      i += 1
    }
    blocks.push({ kind: 'para', lines: paraLines })
  }

  return blocks
}

export const ABOUT_BLOCKS = buildAboutBlocks(ABOUT_MATT_SHADE_TEXT)
