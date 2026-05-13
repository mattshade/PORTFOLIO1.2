import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { resume } from '../src/data/resume.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const htmlPath = path.join(publicDir, 'Matt_Shade_Designer.html')
const pdfPath = path.join(publicDir, 'Matt_Shade_Designer.pdf')
const birdsImagePath = path.join(publicDir, 'images', 'origami-birds-clean.png')

// Convert image to base64 for embedding in standalone HTML
function getBase64Image(filePath: string): string {
  if (!existsSync(filePath)) return ''
  const buffer = readFileSync(filePath)
  return `data:image/png;base64,${buffer.toString('base64')}`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildDesignerHtml(): string {
  const birdsBase64 = getBase64Image(birdsImagePath)
  
  const impactHtml = resume.selectedImpact
    ?.map(item => `<li>${escapeHtml(item)}</li>`)
    .join('') || ''

  const experienceHtml = resume.experience
    .map((job) => `
      <div class="job-timeline-item">
        <div class="job-dot"></div>
        <div class="job-content">
          <div class="job-header">
            <span class="role">${escapeHtml(job.role)}</span>
            <span class="period">${escapeHtml(job.period)}</span>
          </div>
          <div class="company-meta">
            ${escapeHtml(job.company)}${job.location ? ` / ${escapeHtml(job.location)}` : ''}
          </div>
        </div>
      </div>
    `)
    .join('')

  const skillsHtml = resume.skills
    .map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`)
    .join('')

  const educationHtml = resume.education
    .map(edu => `
      <div class="edu-item">
        <div class="school">${escapeHtml(edu.school)}</div>
        <div class="degree">${escapeHtml(edu.degree)}</div>
      </div>
    `)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(resume.name)} — Designer Resume</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --black: #000000;
      --white: #ffffff;
      --grey-dark: #1a1a1a;
      --grey-medium: #4a4a4a;
      --grey-light: #888888;
      --grey-border: #eeeeee;
      --font-mono: 'JetBrains Mono', monospace;
    }

    @page {
      size: letter;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
    }

    body {
      margin: 0;
      padding: 0.5in 0.7in;
      font-family: var(--font-mono);
      font-size: 8.5pt;
      line-height: 1.4;
      color: var(--grey-dark);
      background: var(--white);
      -webkit-font-smoothing: antialiased;
    }

    .container {
      position: relative;
      max-width: 100%;
    }

    /* Birds Asset */
    .birds-container {
      position: absolute;
      top: -0.6in;
      right: -0.3in;
      width: 1.5in;
      opacity: 1; 
      z-index: 0;
      mix-blend-mode: multiply; 
    }

    .birds-container img {
      width: 100%;
      height: auto;
    }

    /* Header */
    header {
      margin-bottom: 1.2rem;
    }

    h1 {
      font-size: 18pt;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }

    .contact-row {
      margin-top: 0.4rem;
      display: flex;
      gap: 0.8rem;
      font-size: 7.5pt;
      color: var(--grey-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .contact-row span.divider {
      color: var(--grey-border);
    }

    .contact-row a, .contact-row span.phone {
      color: inherit;
      text-decoration: none;
    }

    /* Summary */
    .summary-section {
      margin-bottom: 1.2rem;
      max-width: 100%;
    }

    .summary-text {
      font-size: 9pt;
      line-height: 1.5;
      color: var(--grey-medium);
    }

    /* Sections */
    section {
      margin-bottom: 1.2rem;
    }

    h2 {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin: 0 0 0.8rem 0;
      color: var(--black);
      border-bottom: 1px solid var(--grey-border);
      padding-bottom: 0.2rem;
    }

    /* Selected Impact - Single Column */
    .impact-section {
      margin-bottom: 1.2rem;
    }

    .impact-list {
      margin: 0;
      padding-left: 1rem;
      list-style-type: square;
    }

    .impact-list li {
      color: var(--grey-medium);
      line-height: 1.35;
      margin-bottom: 0.6rem;
      font-size: 8.75pt;
    }

    /* Work History - Single Column */
    .work-section {
      margin-bottom: 1rem;
    }

    .work-timeline {
      position: relative;
      padding-left: 0.2in;
    }

    .job-timeline-item {
      position: relative;
      padding-left: 1.2rem;
      margin-bottom: 0.6rem;
      border-left: 1px solid var(--grey-border);
    }

    .job-dot {
      position: absolute;
      left: -3.5px;
      top: 4px;
      width: 6px;
      height: 6px;
      background: var(--grey-border);
      border-radius: 50%;
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .role {
      font-weight: 700;
      font-size: 9pt;
      color: var(--black);
    }

    .period {
      font-size: 7pt;
      color: var(--grey-light);
    }

    .company-meta {
      font-size: 7.5pt;
      color: var(--grey-medium);
      text-transform: uppercase;
      letter-spacing: 0.02em;
      margin-top: 0.1rem;
    }

    /* Bottom Grid (Skills & Education) */
    .bottom-grid {
      display: grid;
      grid-template-columns: 2.5fr 1fr;
      gap: 2rem;
      margin-top: 0.5rem;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem 0.5rem;
    }

    .skill-tag {
      font-size: 7pt;
      color: var(--grey-medium);
      border: 1px solid var(--grey-border);
      padding: 0.1rem 0.3rem;
      border-radius: 1px;
    }

    /* Education */
    .edu-item {
      margin-bottom: 0.8rem;
    }

    .school {
      font-weight: 700;
      font-size: 8.5pt;
      color: var(--black);
    }

    .degree {
      font-size: 7pt;
      color: var(--grey-medium);
      margin-top: 0.1rem;
    }

  </style>
</head>
<body>
  <div class="container">
    <div class="birds-container">
      <img src="${birdsBase64}" alt="Origami Birds">
    </div>

    <header>
      <h1>${escapeHtml(resume.name)}</h1>
      <div class="contact-row">
        <a href="mailto:${escapeHtml(resume.email)}">${escapeHtml(resume.email)}</a>
        <span class="divider">|</span>
        <span class="phone">(646)-598-9801</span>
        <span class="divider">|</span>
        <a href="${escapeHtml(resume.portfolioUrl)}">mattshade.com</a>
        <span class="divider">|</span>
        <a href="${escapeHtml(resume.linkedin)}">LinkedIn</a>
      </div>
    </header>

    <div class="summary-section">
      <div class="summary-text">
        ${escapeHtml(resume.summary)}
      </div>
    </div>

    <section class="impact-section">
      <h2>// Selected Impact</h2>
      <ul class="impact-list">
        ${impactHtml}
      </ul>
    </section>

    <section class="work-section">
      <h2>// Work History</h2>
      <div class="work-timeline">
        ${experienceHtml}
      </div>
    </section>

    <div class="bottom-grid">
      <section class="skills-section">
        <h2>// Skills</h2>
        <div class="skills-list">
          ${skillsHtml}
        </div>
      </section>

      <section class="education-section">
        <h2>// Education</h2>
        ${educationHtml}
      </section>
    </div>
  </div>
</body>
</html>
`
}



async function main() {
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })

  const html = buildDesignerHtml()
  writeFileSync(htmlPath, html, 'utf8')
  console.log(`Wrote ${path.relative(root, htmlPath)}`)

  console.log('Generating PDF with Playwright...')
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  // Set content and wait for fonts/images to load
  await page.setContent(html, { waitUntil: 'networkidle' })
  
  // Generate PDF
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0in',
      right: '0in',
      bottom: '0in',
      left: '0in',
    }
  })

  await browser.close()
  console.log(`Wrote ${path.relative(root, pdfPath)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
