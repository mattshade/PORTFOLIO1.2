#!/usr/bin/env node
/**
 * Storybook's static HTML uses relative URLs (./sb-manager/...). Under a subpath
 * (e.g. /storybook/) the document URL can be /storybook?path=... so those
 * relatives resolve to the site root and the UI stays blank. Vite `base` does
 * not rewrite the manager template; manager-head runs after preloads, so it is
 * too late. Inject <base href> as the first element inside <head> in the built
 * files when STORYBOOK_BASE_PATH is set.
 */
const fs = require('fs');
const path = require('path');

const raw = process.env.STORYBOOK_BASE_PATH?.trim();
if (!raw) {
  process.exit(0);
}

const href = raw.endsWith('/') ? raw : `${raw}/`;
const outDir = process.argv[2] || 'storybook-static';

const baseManager = `\n    <base href="${href}" data-sb-deploy-base />\n`;
const baseIframe = `\n    <base href="${href}" target="_parent" data-sb-deploy-base />\n`;

function injectIndex(name, fragment) {
  const file = path.join(outDir, name);
  if (!fs.existsSync(file)) {
    console.warn(`inject-storybook-base: missing ${file}`);
    return;
  }
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-sb-deploy-base')) {
    return;
  }
  const next = html.replace(/<head>/i, `<head>${fragment}`);
  if (next === html) {
    console.warn(`inject-storybook-base: no <head> match in ${name}`);
    return;
  }
  fs.writeFileSync(file, next);
}

function injectIframe() {
  const file = path.join(outDir, 'iframe.html');
  if (!fs.existsSync(file)) {
    console.warn(`inject-storybook-base: missing ${file}`);
    return;
  }
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-sb-deploy-base')) {
    return;
  }
  html = html.replace(/<head>/i, `<head>${baseIframe}`);
  html = html.replace(/<base\s+target="_parent"\s*\/>/g, '');
  fs.writeFileSync(file, html);
}

injectIndex('index.html', baseManager);
injectIframe();
