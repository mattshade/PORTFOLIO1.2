/**
 * Renders public/og-image.png (1200×630) — wireframe origami forest + hero copy.
 * Run: npm run generate:og-image
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outPath = path.join(root, 'public', 'og-image.png')
const templatePath = path.join(__dirname, 'og-image.template.html')

const W = 1200
const H = 630

function buildHtml() {
  const template = readFileSync(templatePath, 'utf8')
  return template.replaceAll('__W__', String(W)).replaceAll('__H__', String(H))
}

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: W, height: H } })
  await page.setContent(buildHtml(), { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const buf = await page.screenshot({ type: 'png', omitBackground: false })
  await browser.close()
  writeFileSync(outPath, buf)
  console.log(`Wrote ${path.relative(root, outPath)} (${W}×${H})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
