/**
 * ATS-friendly resume PDF + HTML from src/data/resume.ts (compact print layout).
 * Run: npm run generate:resume-ats
 */
import { writeFileSync, createWriteStream, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

import { resume } from '../src/data/resume.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const htmlPath = path.join(publicDir, 'Matt_Shade.html')
const pdfPath = path.join(publicDir, 'Matt_Shade.pdf')

/** Matches site accent (--accent) for ATS HTML + PDF */
const SITE_ACCENT = '#93C572'

function sanitizePdfText(text: string): string {
  return text
    .replace(/\u2014/g, '--')
    .replace(/\u2013/g, '-')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildAtsHtml(): string {
  const contactParts: string[] = []
  if (resume.email) {
    contactParts.push(`<a href="mailto:${escapeHtml(resume.email)}">${escapeHtml(resume.email)}</a>`)
  }
  if (resume.portfolioUrl) {
    const u = escapeHtml(resume.portfolioUrl)
    contactParts.push(`<a href="${u}">${escapeHtml('mattshade.com')}</a>`)
  }
  if (resume.linkedin) contactParts.push(escapeHtml(resume.linkedin))
  if (resume.github) contactParts.push(escapeHtml(resume.github))

  const impactSection =
    resume.selectedImpact?.length ?
      `<section class="block">
  <h2>Selected Impact</h2>
  <ul class="tight">${resume.selectedImpact.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
</section>`
    : ''

  const experienceHtml = resume.experience
    .map((job) => {
      const loc = job.location ? escapeHtml(job.location) : ''
      const desc = job.description ? `<p class="job-desc">${escapeHtml(job.description)}</p>` : ''
      const bullets =
        job.highlights?.length ?
          `<ul class="tight">${job.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>`
        : ''
      return `<div class="job">
  <div class="job-top">
    <h3>${escapeHtml(job.role)}</h3>
    <span class="period">${escapeHtml(job.period)}</span>
  </div>
  <p class="company">${escapeHtml(job.company)}${loc ? ` · ${loc}` : ''}</p>
  ${desc}
  ${bullets}
</div>`
    })
    .join('\n')

  const s = resume.skills
  const mid = Math.ceil(s.length / 2)
  const left = s.slice(0, mid).map((x) => `<li>${escapeHtml(x)}</li>`).join('')
  const right = s.slice(mid).map((x) => `<li>${escapeHtml(x)}</li>`).join('')
  const skillsCols = `<div class="skills-cols"><ul class="tight">${left}</ul><ul class="tight">${right}</ul></div>`

  const educationHtml = resume.education
    .map(
      (edu) => `<div class="edu">
  <h3 class="edu-school">${escapeHtml(edu.school)}</h3>
  <p class="edu-degree">${escapeHtml(edu.degree)}</p>
</div>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(resume.name)} — Resume</title>
  <style>
    @page { size: letter; margin: 0.4in 0.5in; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.28;
      color: #171717;
      margin: 0;
    }
    header { margin-bottom: 8pt; padding-left: 8pt; border-left: 4pt solid ${SITE_ACCENT}; }
    h1 {
      font-size: 17pt;
      margin: 0 0 2pt;
      letter-spacing: -0.02em;
      color: ${SITE_ACCENT};
    }
    .title { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${SITE_ACCENT}; margin: 0 0 3pt; }
    .tagline { font-size: 9.5pt; margin: 0 0 5pt; color: #4b5563; max-width: 100%; }
    .contact { font-size: 8.5pt; color: #374151; margin: 0; line-height: 1.35; }
    .contact a { color: ${SITE_ACCENT}; text-decoration: none; }
    h2 {
      font-size: 9pt;
      margin: 9pt 0 4pt;
      padding-bottom: 2pt;
      border-bottom: 1px solid rgba(147, 197, 114, 0.45);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: ${SITE_ACCENT};
    }
    .block:first-of-type h2 { margin-top: 0; }
    .summary { margin: 0; text-align: justify; hyphens: none; }
    .job { margin: 0 0 7pt; page-break-inside: avoid; }
    .job-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8pt; flex-wrap: wrap; }
    .job-top h3 { margin: 0; font-size: 9.5pt; font-weight: 700; flex: 1; min-width: 12rem; }
    .period { font-family: ui-monospace, monospace; font-size: 8pt; color: #333; white-space: nowrap; }
    .company { margin: 1pt 0 3pt; font-size: 8.75pt; color: #222; }
    .job-desc { margin: 0 0 3pt; font-size: 8.75pt; color: #333; }
    ul.tight { margin: 2pt 0 0; padding-left: 14pt; }
    ul.tight li { margin-bottom: 2pt; }
    .skills-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 4pt 18pt; margin-top: 2pt; }
    .skills-cols ul { margin: 0; padding-left: 14pt; }
    .edu { margin: 0 0 6pt; page-break-inside: avoid; text-align: left; }
    .edu-school { margin: 0; font-size: 9.5pt; font-weight: 700; color: #171717; }
    .edu-degree { margin: 2pt 0 0; font-size: 8.75pt; color: #6b7280; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(resume.name)}</h1>
    <p class="title">${escapeHtml(resume.title)}</p>
    <p class="tagline">${escapeHtml(resume.tagline)}</p>
    <p class="contact">${contactParts.join(' · ')}</p>
  </header>

  <section class="block">
    <h2>Summary</h2>
    <p class="summary">${escapeHtml(resume.summary)}</p>
  </section>

  ${impactSection}

  <section class="block">
    <h2>Experience</h2>
    ${experienceHtml}
  </section>

  <section class="block">
    <h2>Skills</h2>
    ${skillsCols}
  </section>

  <section class="block">
    <h2>Education</h2>
    ${educationHtml}
  </section>
</body>
</html>
`
}

const MARGIN_X = 44
const MARGIN_Y = 42
const BOTTOM_SAFE = 44

function writeAtsPdf(outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: MARGIN_Y, bottom: MARGIN_Y, left: MARGIN_X, right: MARGIN_X },
    })
    const stream = createWriteStream(outPath)
    doc.pipe(stream)
    stream.on('finish', () => resolve())
    stream.on('error', reject)

    const contentW = () => doc.page.width - doc.page.margins.left - doc.page.margins.right
    const pageBottom = () => doc.page.height - doc.page.margins.bottom
    const leftX = () => doc.page.margins.left

    const checkPage = (needed: number) => {
      if (doc.y + needed > pageBottom() - BOTTOM_SAFE) doc.addPage()
    }

    const tightSectionGap = 5
    const afterRuleGap = 3

    const sectionRule = () => {
      const L = leftX()
      const R = doc.page.width - doc.page.margins.right
      doc.moveTo(L, doc.y).lineTo(R, doc.y).strokeColor(SITE_ACCENT).lineWidth(0.45).stroke()
      doc.moveDown(afterRuleGap / 12)
    }

    const sectionTitle = (title: string) => {
      checkPage(28)
      doc.font('Helvetica-Bold').fontSize(9).fillColor(SITE_ACCENT)
      doc.text(title.toUpperCase(), { width: contentW(), characterSpacing: 0.4 })
      doc.moveDown(0.12)
      sectionRule()
      doc.font('Helvetica').fillColor('#171717')
    }

    const HEADER_INDENT = 14
    const HEADER_BAR_W = 4
    const headerTextW = contentW() - HEADER_INDENT
    const headerStartY = doc.y
    doc.x = leftX() + HEADER_INDENT

    doc.font('Helvetica-Bold').fontSize(16).fillColor(SITE_ACCENT).text(sanitizePdfText(resume.name), { width: headerTextW })
    doc.moveDown(0.15)
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(SITE_ACCENT).text(sanitizePdfText(resume.title).toUpperCase(), {
      width: headerTextW,
      characterSpacing: 0.5,
    })
    doc.moveDown(0.18)
    doc.font('Helvetica').fontSize(8.75).fillColor('#6b7280').text(sanitizePdfText(resume.tagline), {
      width: headerTextW,
      lineGap: 1,
    })
    doc.moveDown(0.22)
    doc.fillColor('#171717')
    const contactLine = [resume.email, resume.portfolioUrl, resume.linkedin, resume.github]
      .filter(Boolean)
      .map((s) => sanitizePdfText(s as string))
      .join('  |  ')
    doc.fontSize(8.5).text(contactLine, { width: headerTextW, lineGap: 1 })
    doc.fillColor('#171717')

    doc.save()
    doc.rect(leftX(), headerStartY, HEADER_BAR_W, Math.max(doc.y - headerStartY, 8)).fill(SITE_ACCENT)
    doc.restore()

    doc.x = leftX()
    doc.moveDown(0.45)

    sectionTitle('Summary')
    doc.font('Helvetica').fontSize(9).fillColor('#171717').lineGap(1.5)
    doc.text(sanitizePdfText(resume.summary), { width: contentW(), align: 'left' })
    doc.lineGap(0)
    doc.moveDown(tightSectionGap / 10)

    if (resume.selectedImpact?.length) {
      sectionTitle('Selected Impact')
      doc.font('Helvetica').fontSize(8.75).fillColor('#525252').lineGap(1.2)
      for (const item of resume.selectedImpact) {
        checkPage(28)
        doc.text(`• ${sanitizePdfText(item)}`, { width: contentW(), indent: 10 })
        doc.moveDown(0.12)
      }
      doc.lineGap(0)
      doc.moveDown(tightSectionGap / 10)
    }

    sectionTitle('Experience')
    for (const job of resume.experience) {
      checkPage(52)
      const period = sanitizePdfText(job.period)
      const metaLine = job.location
        ? `${sanitizePdfText(job.company)}  ·  ${sanitizePdfText(job.location)}  ·  ${period}`
        : `${sanitizePdfText(job.company)}  ·  ${period}`

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#171717').text(sanitizePdfText(job.role), { width: contentW() })
      doc.moveDown(0.06)
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280').text(metaLine, { width: contentW() })
      doc.moveDown(0.12)
      doc.fillColor('#171717')
      if (job.description) {
        doc.fontSize(8.5).fillColor('#525252').text(sanitizePdfText(job.description), { width: contentW(), lineGap: 1 })
        doc.moveDown(0.12)
        doc.fillColor('#171717')
      }
      if (job.highlights?.length) {
        doc.font('Helvetica').fontSize(8.5).fillColor('#525252')
        for (const h of job.highlights) {
          checkPage(22)
          doc.text(`• ${sanitizePdfText(h)}`, { width: contentW(), indent: 10, lineGap: 1.2 })
          doc.moveDown(0.06)
        }
      }
      doc.moveDown(0.22)
    }

    sectionTitle('Skills')
    const skills = resume.skills.map((s) => sanitizePdfText(s))
    const mid = Math.ceil(skills.length / 2)
    const leftCol = skills.slice(0, mid)
    const rightCol = skills.slice(mid)
    const colGap = 16
    const colW = (contentW() - colGap) / 2
    const lineH = 10
    const maxRows = Math.max(leftCol.length, rightCol.length)
    checkPage(maxRows * lineH + 12)
    const startY = doc.y
    const baseLeft = leftX()
    for (let i = 0; i < maxRows; i++) {
      const y = startY + i * lineH
      if (leftCol[i]) {
        doc.font('Helvetica').fontSize(8.5).fillColor('#525252').text(`• ${leftCol[i]}`, baseLeft, y, {
          width: colW,
          lineHeight: lineH,
        })
      }
      if (rightCol[i]) {
        doc.font('Helvetica').fontSize(8.5).fillColor('#525252').text(`• ${rightCol[i]}`, baseLeft + colW + colGap, y, {
          width: colW,
          lineHeight: lineH,
        })
      }
    }
    doc.y = startY + maxRows * lineH + 2
    doc.fillColor('#171717')
    /* Skills used absolute x for the right column; reset flow position so Education is left-aligned */
    doc.x = leftX()

    sectionTitle('Education')
    for (const edu of resume.education) {
      checkPage(28)
      doc.x = leftX()
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#171717')
      doc.text(sanitizePdfText(edu.school), {
        width: contentW(),
        align: 'left',
      })
      doc.moveDown(0.08)
      doc.font('Helvetica').fontSize(8.75).fillColor('#6b7280')
      doc.text(sanitizePdfText(edu.degree), {
        width: contentW(),
        align: 'left',
      })
      doc.fillColor('#171717')
      doc.moveDown(0.28)
    }

    doc.end()
  })
}

async function main() {
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })

  const html = buildAtsHtml()
  writeFileSync(htmlPath, html, 'utf8')
  console.log(`Wrote ${path.relative(root, htmlPath)}`)

  await writeAtsPdf(pdfPath)
  console.log(`Wrote ${path.relative(root, pdfPath)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
