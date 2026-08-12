import { ABOUT_BLOCKS, type AboutBlock } from './aboutTextBlocks'

const DISCIPLINES = ['Design', 'Engineering', 'AI', 'Leadership'] as const

type Block = AboutBlock

function AboutPortrait() {
  return (
    <div className="about-doc__portrait">
      <img
        src="/images/matt-shade-profile.png"
        alt="Matt Shade"
        width={128}
        height={128}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

function DisciplineTags() {
  return (
    <ul className="about-doc__tags" aria-label="Focus areas">
      {DISCIPLINES.map((label) => (
        <li key={label}>{label}</li>
      ))}
    </ul>
  )
}

function renderBlock(block: Block, index: number, isLead: boolean) {
  const key = `about-block-${index}`

  if (block.kind === 'pull') {
    return (
      <blockquote key={key} className="about-doc__quote">
        <p>{block.line}</p>
      </blockquote>
    )
  }

  const paraClass = `about-doc__para${isLead ? ' about-doc__para--lead' : ''}`

  return (
    <p key={key} className={paraClass}>
      {block.lines.join('\n')}
    </p>
  )
}

export function AboutTextBody() {
  const introBlock = ABOUT_BLOCKS[0]?.kind === 'para' ? ABOUT_BLOCKS[0] : null
  const bodyBlocks = introBlock ? ABOUT_BLOCKS.slice(1) : ABOUT_BLOCKS

  return (
    <div className="about-doc__body">
      <div className="about-doc__intro">
        <AboutPortrait />
        <div className="about-doc__intro-meta">
          <p className="about-doc__name">Matt Shade</p>
          <DisciplineTags />
        </div>
      </div>

      <div className="about-doc__content">
        {introBlock && renderBlock(introBlock, 0, true)}
        {bodyBlocks.map((block, index) => renderBlock(block, index + 1, false))}
      </div>
    </div>
  )
}
