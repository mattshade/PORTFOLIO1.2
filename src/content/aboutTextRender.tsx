import {
  ABOUT_HEADING_LINES,
  ABOUT_INTRO_QUOTE,
  ABOUT_MATT_SHADE_TEXT,
  ABOUT_PULL_QUOTE_LINES,
} from './aboutText'

function renderLeadIntro(text: string) {
  const idx = text.indexOf(ABOUT_INTRO_QUOTE)
  if (idx === -1) return text
  const before = text.slice(0, idx)
  const after = text.slice(idx + ABOUT_INTRO_QUOTE.length)
  return (
    <>
      {before}
      <span className="about-resume-doc__quote-cyan">“{ABOUT_INTRO_QUOTE}”</span>
      {after}
    </>
  )
}

function isUnderscoreRule(line: string): boolean {
  const t = line.trim()
  return t.length > 0 && /^_+$/.test(t)
}

type Block =
  | { kind: 'sep'; lines: string[] }
  | { kind: 'bullets'; lines: string[] }
  | { kind: 'heading'; line: string }
  | { kind: 'pull'; line: string }
  | { kind: 'para'; lines: string[] }

function buildBlocks(raw: string): Block[] {
  const lines = raw.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i += 1
      continue
    }

    if (isUnderscoreRule(line)) {
      const sepLines: string[] = [line]
      i += 1
      while (i < lines.length && isUnderscoreRule(lines[i])) {
        sepLines.push(lines[i])
        i += 1
      }
      blocks.push({ kind: 'sep', lines: sepLines })
      continue
    }

    if (ABOUT_HEADING_LINES.has(line)) {
      blocks.push({ kind: 'heading', line })
      i += 1
      continue
    }

    if (line.startsWith('* ')) {
      const bulletLines: string[] = []
      while (i < lines.length && lines[i].startsWith('* ')) {
        bulletLines.push(lines[i])
        i += 1
      }
      blocks.push({ kind: 'bullets', lines: bulletLines })
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
      if (
        next.trim() === '' ||
        isUnderscoreRule(next) ||
        next.startsWith('* ') ||
        ABOUT_HEADING_LINES.has(next) ||
        ABOUT_PULL_QUOTE_LINES.has(next)
      ) {
        break
      }
      paraLines.push(next)
      i += 1
    }
    blocks.push({ kind: 'para', lines: paraLines })
  }

  return blocks
}

const ABOUT_BLOCKS = buildBlocks(ABOUT_MATT_SHADE_TEXT)

export function AboutTextBody() {
  let beforeFirstHeading = true
  let portraitPlaced = false

  return (
    <div className="about-resume-doc__body">
      {ABOUT_BLOCKS.map((block, index) => {
        const key = `about-block-${index}`

        if (block.kind === 'sep') {
          return null
        }

        if (block.kind === 'heading') {
          beforeFirstHeading = false
          return (
            <h3 key={key} className="about-resume-doc__role">
              {block.line}
            </h3>
          )
        }

        if (block.kind === 'pull') {
          return (
            <p key={key} className="about-resume-doc__para about-resume-doc__para--pull">
              {block.line}
            </p>
          )
        }

        if (block.kind === 'bullets') {
          return (
            <ul key={key} className="about-resume-doc__list">
              {block.lines.map((l, j) => (
                <li key={j}>{l}</li>
              ))}
            </ul>
          )
        }

        const isLead = beforeFirstHeading
        const text = isLead ? renderLeadIntro(block.lines.join('\n')) : block.lines.join('\n')
        const paraClass = `about-resume-doc__para${isLead ? ' about-resume-doc__para--lead' : ''}`

        if (isLead && !portraitPlaced) {
          portraitPlaced = true
          return (
            <div key={key} className="about-intro">
              <div className="about-portrait">
                <img
                  src="/images/matt-shade-profile.png"
                  alt="Matt Shade"
                  width={168}
                  height={210}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className={paraClass}>{text}</p>
            </div>
          )
        }

        return (
          <p key={key} className={paraClass}>
            {text}
          </p>
        )
      })}
    </div>
  )
}
