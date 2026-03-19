#!/usr/bin/env node
/**
 * Precision Structures — Page Review PDF Generator
 *
 * Generates review-ready PDFs of each website page for client markup.
 * Uses Playwright to render pages and export as PDF.
 *
 * USAGE:
 *   1. Install dependencies:  npm install playwright
 *                              npx playwright install chromium
 *   2. Start local server:    npx serve . -l 3000  (in another terminal)
 *   3. Run this script:       node scripts/generate-review-pdfs.js
 *
 *   Or use a deployed staging URL:
 *       node scripts/generate-review-pdfs.js --url https://your-staging-url.azurestaticapps.net
 *
 * OUTPUT:
 *   /review-pdfs/
 *     home-page.pdf
 *     about-page.pdf
 *     services-page.pdf
 *     gallery-page.pdf
 *     resources-page.pdf
 *     contact-page.pdf
 *     home-page-mobile.pdf  (if --mobile flag used)
 *     ...
 *     index.md
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const PAGES = [
  { file: 'index.html',     slug: 'home-page',      title: 'Home' },
  { file: 'about.html',     slug: 'about-page',     title: 'About Us' },
  { file: 'services.html',  slug: 'services-page',  title: 'Services' },
  { file: 'gallery.html',   slug: 'gallery-page',   title: 'Gallery' },
  { file: 'resources.html', slug: 'resources-page',  title: 'Resources & AI Tools' },
  { file: 'contact.html',   slug: 'contact-page',   title: 'Contact' },
];

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT  = { width: 375, height: 812 };

// --- Parse CLI args ---
const args = process.argv.slice(2);
const urlFlag = args.indexOf('--url');
const BASE_URL = urlFlag !== -1 && args[urlFlag + 1]
  ? args[urlFlag + 1]
  : 'http://localhost:3000';
const INCLUDE_MOBILE = args.includes('--mobile');

const OUTPUT_DIR = path.join(__dirname, '..', 'review-pdfs');

async function generatePDFs() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const timestamp = now.toISOString().split('T')[0];

  console.log(`\n  Precision Structures — Review PDF Generator`);
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Date: ${dateStr}`);
  console.log(`  Mobile: ${INCLUDE_MOBILE ? 'Yes' : 'No (use --mobile to include)'}`);
  console.log(`  Output: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch();
  const generated = [];

  for (const page of PAGES) {
    // --- Desktop PDF ---
    const desktopFile = `${page.slug}.pdf`;
    console.log(`  Generating: ${desktopFile}`);

    const ctx = await browser.newContext({ viewport: DESKTOP_VIEWPORT });
    const tab = await ctx.newPage();

    const url = `${BASE_URL}/${page.file}`;
    await tab.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for fonts and animations to settle
    await tab.waitForTimeout(1500);

    // Inject header/footer info for PDF
    await tab.pdf({
      path: path.join(OUTPUT_DIR, desktopFile),
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.75in', bottom: '1in', left: '0.5in', right: '0.5in' },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-family: Arial, sans-serif; font-size: 9px; color: #888; width: 100%; padding: 0 0.5in; display: flex; justify-content: space-between;">
          <span>${page.title} — Precision Structures Inc.</span>
          <span>${url}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-family: Arial, sans-serif; font-size: 9px; color: #888; width: 100%; padding: 0 0.5in; display: flex; justify-content: space-between;">
          <span>Review Copy – Precision Structures | Generated: ${dateStr}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    generated.push({
      file: desktopFile,
      title: page.title,
      url: url,
      type: 'Desktop (1440px)',
    });

    await ctx.close();

    // --- Mobile PDF (optional) ---
    if (INCLUDE_MOBILE) {
      const mobileFile = `${page.slug}-mobile.pdf`;
      console.log(`  Generating: ${mobileFile}`);

      const mCtx = await browser.newContext({
        viewport: MOBILE_VIEWPORT,
        isMobile: true,
      });
      const mTab = await mCtx.newPage();
      await mTab.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await mTab.waitForTimeout(1500);

      await mTab.pdf({
        path: path.join(OUTPUT_DIR, mobileFile),
        format: 'Letter',
        printBackground: true,
        margin: { top: '0.75in', bottom: '1in', left: '0.5in', right: '0.5in' },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-family: Arial, sans-serif; font-size: 9px; color: #888; width: 100%; padding: 0 0.5in; display: flex; justify-content: space-between;">
            <span>${page.title} (Mobile View) — Precision Structures Inc.</span>
            <span>${url}</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-family: Arial, sans-serif; font-size: 9px; color: #888; width: 100%; padding: 0 0.5in; display: flex; justify-content: space-between;">
            <span>Review Copy – Precision Structures | Generated: ${dateStr}</span>
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        `,
      });

      generated.push({
        file: mobileFile,
        title: page.title,
        url: url,
        type: 'Mobile (375px)',
      });

      await mCtx.close();
    }
  }

  await browser.close();

  // --- Generate index.md ---
  let index = `# Precision Structures — Page Review PDFs\n\n`;
  index += `**Generated:** ${dateStr}  \n`;
  index += `**Source:** ${BASE_URL}  \n`;
  index += `**Purpose:** Client review and markup  \n\n`;
  index += `## Instructions\n\n`;
  index += `1. Open or print each PDF below\n`;
  index += `2. Mark up changes using pen (if printed) or PDF annotation tools\n`;
  index += `3. Return marked-up PDFs or a list of changes to our team\n`;
  index += `4. We will implement changes on the staging site for your review before publishing\n\n`;
  index += `## Pages\n\n`;
  index += `| Page | File | View | URL |\n`;
  index += `|------|------|------|-----|\n`;

  for (const item of generated) {
    index += `| ${item.title} | [${item.file}](./${item.file}) | ${item.type} | ${item.url} |\n`;
  }

  index += `\n---\n*Review Copy – Precision Structures Inc.*\n`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.md'), index);

  console.log(`\n  Done! Generated ${generated.length} PDFs.`);
  console.log(`  Index: ${path.join(OUTPUT_DIR, 'index.md')}\n`);
}

generatePDFs().catch(err => {
  console.error('Error generating PDFs:', err);
  process.exit(1);
});
