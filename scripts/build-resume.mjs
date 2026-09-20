#!/usr/bin/env node

/**
 * Builds the resume: Markdown -> semantic HTML -> PDF.
 *
 * Alexandr_Ricov_Resume.md is the single source of truth. This script never
 * edits it and never adds content of its own; it only converts and paginates.
 *
 * Exits non-zero with a clear message if any stage fails.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { marked } from 'marked';
import puppeteer from 'puppeteer';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCE = join(ROOT, 'Alexandr_Ricov_Resume.md');
const TEMPLATE = join(ROOT, 'templates', 'resume.html');
const OUT_DIR = join(ROOT, 'dist');
const OUT_NAME = 'Alexandr_Ricov';

/** Fails the build with a readable message instead of a stack trace. */
function fail(message, cause) {
  console.error(`\n✖ Resume build failed: ${message}`);
  if (cause) console.error(`  ${cause instanceof Error ? cause.message : cause}`);
  process.exit(1);
}

/**
 * Groups each project entry with its bullet list so the two are not split
 * across a page boundary, and turns the Technical Skills subsections into
 * label/value rows. Document order is preserved in both cases.
 */
function addPaginationHooks(html) {
  // Projects live under a level-4 heading, each written as a bold title
  // paragraph followed by its bullet list. Scoping to that region keeps the
  // role entries under a level-3 heading from being treated as projects.
  let out = html.replace(
    /<h4>[\s\S]*?(?=<h[123]>|<hr\s*\/?>|$)/g,
    (region) =>
      region.replace(
        /<p><strong>(?:(?!<\/p>)[\s\S])*?<\/p>\s*(?:<ul>[\s\S]*?<\/ul>)?/g,
        (block) => `<section class="project">\n${block}\n</section>\n`,
      ),
  );

  // Each h3 + following paragraph inside the skills section becomes one row.
  out = out.replace(
    /(<h2>Technical Skills<\/h2>)([\s\S]*?)(?=<hr\s*\/?>)/,
    (_all, heading, body) => {
      const rows = body.replace(
        /<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g,
        (_row, label, values) =>
          `<div class="skill-row"><h3>${label}</h3><p>${values}</p></div>\n`,
      );
      return `${heading}\n<section class="skills">\n${rows}</section>\n`;
    },
  );

  return out;
}

/** Everything above the first `---` is the contact block. */
function wrapMasthead(html) {
  return html.replace(
    /^([\s\S]*?)(<hr\s*\/?>)/,
    (_all, head, rule) => `<header class="masthead">\n${head}</header>\n${rule}`,
  );
}

/** Counts `/Type /Page` objects in the raw PDF, ignoring `/Pages` nodes. */
function countPdfPages(buffer) {
  const matches = buffer.toString('latin1').match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 0;
}

async function main() {
  if (!existsSync(SOURCE)) fail(`master resume not found at ${SOURCE}`);
  if (!existsSync(TEMPLATE)) fail(`template not found at ${TEMPLATE}`);

  const [markdown, template] = await Promise.all([
    readFile(SOURCE, 'utf8'),
    readFile(TEMPLATE, 'utf8'),
  ]);

  // Strip HTML comments: the master file keeps private source-of-truth notes
  // there, and they must never reach the published PDF.
  const publicMarkdown = markdown.replace(/<!--[\s\S]*?-->/g, '').trim();

  if (!publicMarkdown) fail('master resume is empty after stripping comments');

  marked.setOptions({ gfm: true, breaks: false });

  let body;
  try {
    body = marked.parse(publicMarkdown);
  } catch (error) {
    fail('Markdown could not be converted to HTML', error);
  }

  body = wrapMasthead(addPaginationHooks(body));

  const titleMatch = publicMarkdown.match(/^#\s+(.+)$/m);
  const title = titleMatch
    ? `${titleMatch[1].trim()} — Senior Frontend Engineer`
    : OUT_NAME;

  const html = template
    .replace('{{TITLE}}', title)
    .replace('{{CONTENT}}', body);

  await mkdir(OUT_DIR, { recursive: true });

  const pdfPath = join(OUT_DIR, `${OUT_NAME}.pdf`);
  // GitHub Pages serves the repository root, so the page lands there.
  const indexPath = join(ROOT, 'index.html');

  await writeFile(indexPath, html, 'utf8');

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMediaType('print');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', right: '15mm', bottom: '14mm', left: '15mm' },
      displayHeaderFooter: false,
      tagged: true,
    });
  } catch (error) {
    fail('PDF generation failed', error);
  } finally {
    await browser?.close();
  }

  if (!existsSync(pdfPath)) fail('PDF was not written to disk');

  const pdf = await readFile(pdfPath);
  if (pdf.length === 0) fail('PDF is empty');

  const pages = countPdfPages(pdf);

  console.log('\n✔ Resume built');
  console.log(`  source : ${SOURCE.replace(ROOT + '/', '')}`);
  console.log(`  page   : ${indexPath.replace(ROOT + '/', '')}`);
  console.log(`  pdf    : ${pdfPath.replace(ROOT + '/', '')}`);
  console.log(`  size   : ${(pdf.length / 1024).toFixed(0)} KB`);
  console.log(`  pages  : ${pages}\n`);
}

main().catch((error) => fail('unexpected error', error));
