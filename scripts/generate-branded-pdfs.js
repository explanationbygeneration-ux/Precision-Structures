#!/usr/bin/env node
/**
 * SSC / EBYG — Branded PDF Generator
 * Converts all /docs/*.md files into professionally branded PDFs
 */

const { chromium } = require('playwright');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'pdf');

// Document metadata — controls titles, subtitles, and categories shown on cover
const DOC_META = {
  'precision-site-audit': {
    title: 'Website Technical Audit',
    subtitle: 'Precision Structures Inc.',
    category: 'SITE AUDIT',
    icon: '01'
  },
  'precision-feature-gap-analysis': {
    title: 'Feature Gap Analysis',
    subtitle: 'Requested Features vs. Current State',
    category: 'ANALYSIS',
    icon: '02'
  },
  'page-review-pdf-workflow': {
    title: 'Page Review PDF Workflow',
    subtitle: 'Client Review Process Documentation',
    category: 'WORKFLOW',
    icon: '03'
  },
  'client-update-system-options': {
    title: 'Client Update System Options',
    subtitle: 'Comparison of Content Management Approaches',
    category: 'OPTIONS ANALYSIS',
    icon: '04'
  },
  'client-update-portal-spec': {
    title: 'Client Update Portal Specification',
    subtitle: 'Technical Architecture & Requirements',
    category: 'TECHNICAL SPEC',
    icon: '05'
  },
  'email-update-automation-spec': {
    title: 'Email-to-Staging Automation',
    subtitle: 'Update Workflow Architecture',
    category: 'TECHNICAL SPEC',
    icon: '06'
  },
  'ai-chatbot-strategy': {
    title: 'AI Chatbot Strategy',
    subtitle: 'Business Purpose, Use Cases & Implementation Plan',
    category: 'STRATEGY',
    icon: '07'
  },
  'precision-chatbot-persona': {
    title: 'Chatbot Voice & Persona',
    subtitle: 'Brand Voice Definition for Precision Structures',
    category: 'BRAND GUIDE',
    icon: '08'
  },
  'seo-and-aio-plan': {
    title: 'SEO & AI Discoverability Plan',
    subtitle: 'Search Optimization & 90-Day Roadmap',
    category: 'SEO STRATEGY',
    icon: '09'
  },
  'go-live-readiness-checklist': {
    title: 'Go-Live Readiness Checklist',
    subtitle: 'Pre-Launch Verification & Testing',
    category: 'CHECKLIST',
    icon: '10'
  },
  'security-testing-plan': {
    title: 'Security Testing Plan',
    subtitle: 'Methodology & Test Coverage',
    category: 'SECURITY',
    icon: '11'
  },
  'test-results-summary': {
    title: 'Test Results Summary',
    subtitle: 'Current QA Status & Findings',
    category: 'QA REPORT',
    icon: '12'
  },
  'client-proposal-precision-structures': {
    title: 'Website Finalization Proposal',
    subtitle: 'Precision Structures Inc.',
    category: 'CLIENT PROPOSAL',
    icon: '13'
  },
  'internal-pricing-and-scope-notes': {
    title: 'Internal Pricing & Scope Notes',
    subtitle: 'Packaging Strategy & Margin Analysis',
    category: 'INTERNAL',
    icon: '14'
  },
  'precision-ai-opportunity-map': {
    title: 'AI Opportunity Map',
    subtitle: '12 Practical AI Opportunities by Business Category',
    category: 'AI STRATEGY',
    icon: '15'
  },
  'recommended-ai-roadmap': {
    title: 'Recommended AI Roadmap',
    subtitle: 'Top 3 Priorities Beyond the Website',
    category: 'AI ROADMAP',
    icon: '16'
  },
  'master-execution-summary': {
    title: 'Master Execution Summary',
    subtitle: 'Complete Project Status & Next Steps',
    category: 'EXECUTIVE SUMMARY',
    icon: '17'
  }
};

function buildHTML(mdContent, meta, filename) {
  // Configure marked for better table and list handling
  marked.setOptions({
    gfm: true,
    breaks: false
  });

  const htmlBody = marked.parse(mdContent);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root {
    --navy: #0f1a2e;
    --navy-mid: #1a2a44;
    --navy-light: #243656;
    --blue: #2563eb;
    --blue-light: #dbeafe;
    --blue-subtle: #eff6ff;
    --gold: #d4a030;
    --gold-light: #fef3c7;
    --gold-dark: #a37b1e;
    --slate: #475569;
    --slate-light: #94a3b8;
    --text: #1e293b;
    --text-light: #64748b;
    --border: #e2e8f0;
    --bg: #ffffff;
    --bg-alt: #f8fafc;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page {
    size: letter;
    margin: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 9.5pt;
    line-height: 1.6;
    color: var(--text);
    background: var(--bg);
  }

  /* ===== COVER PAGE ===== */
  .cover {
    page-break-after: always;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .cover-header {
    background: var(--navy);
    padding: 32px 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cover-brand {
    font-size: 11pt;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.03em;
  }

  .cover-brand span { color: var(--gold); }

  .cover-url {
    font-size: 8pt;
    color: rgba(255,255,255,0.5);
    font-weight: 500;
    letter-spacing: 0.05em;
  }

  .cover-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 56px;
    position: relative;
  }

  .cover-body::before {
    content: '';
    position: absolute;
    top: -40px;
    right: -60px;
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, var(--blue-subtle) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }

  .cover-body::after {
    content: '';
    position: absolute;
    bottom: 40px;
    right: 56px;
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, var(--gold-light) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }

  .cover-category {
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold-dark);
    background: var(--gold-light);
    display: inline-block;
    padding: 6px 16px;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
  }

  .cover-title {
    font-size: 32pt;
    font-weight: 900;
    color: var(--navy);
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    max-width: 520px;
    position: relative;
    z-index: 1;
  }

  .cover-subtitle {
    font-size: 14pt;
    font-weight: 400;
    color: var(--slate);
    line-height: 1.4;
    max-width: 440px;
    position: relative;
    z-index: 1;
  }

  .cover-number {
    position: absolute;
    right: 56px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 160pt;
    font-weight: 900;
    color: rgba(15, 26, 46, 0.04);
    line-height: 1;
    z-index: 0;
  }

  .cover-meta {
    padding: 24px 56px;
    background: var(--bg-alt);
    border-top: 1px solid var(--border);
    display: flex;
    gap: 48px;
  }

  .cover-meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cover-meta-label {
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--slate-light);
  }

  .cover-meta-value {
    font-size: 9pt;
    font-weight: 600;
    color: var(--text);
  }

  .cover-footer {
    background: var(--navy);
    padding: 16px 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cover-footer-left {
    font-size: 7.5pt;
    color: rgba(255,255,255,0.6);
    font-weight: 500;
  }

  .cover-footer-right {
    font-size: 7.5pt;
    color: var(--gold);
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  /* ===== CONTENT PAGES ===== */
  .content {
    padding: 48px 56px 72px;
    min-height: calc(100vh - 48px);
    position: relative;
  }

  .page-header-bar {
    background: var(--navy);
    padding: 12px 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .page-header-bar::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--gold) 0%, var(--blue) 100%);
  }

  .page-header-brand {
    font-size: 8.5pt;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.02em;
  }

  .page-header-brand span { color: var(--gold); }

  .page-header-doc {
    font-size: 7.5pt;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* ===== TYPOGRAPHY ===== */
  h1 {
    font-size: 20pt;
    font-weight: 900;
    color: var(--navy);
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 0 0 8px 0;
    padding-bottom: 12px;
    border-bottom: 3px solid var(--navy);
    display: none; /* Hide H1 — we use cover title instead */
  }

  h2 {
    font-size: 14pt;
    font-weight: 800;
    color: var(--navy);
    letter-spacing: -0.01em;
    margin: 32px 0 12px 0;
    padding: 10px 16px;
    background: var(--navy);
    color: #ffffff;
    position: relative;
  }

  h2::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--gold);
  }

  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: var(--navy);
    margin: 24px 0 8px 0;
    padding-bottom: 6px;
    border-bottom: 2px solid var(--gold);
    display: inline-block;
  }

  /* Reset display after border */
  h3 + * { clear: both; }

  h4 {
    font-size: 10pt;
    font-weight: 700;
    color: var(--blue);
    margin: 18px 0 6px 0;
    letter-spacing: 0.02em;
  }

  h5 {
    font-size: 9pt;
    font-weight: 700;
    color: var(--gold-dark);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 14px 0 6px 0;
  }

  p {
    margin: 0 0 10px 0;
    color: var(--text);
    line-height: 1.65;
  }

  strong {
    font-weight: 700;
    color: var(--navy);
  }

  em { font-style: italic; color: var(--text-light); }

  a {
    color: var(--blue);
    text-decoration: none;
    font-weight: 500;
  }

  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 24px 0;
  }

  /* ===== LISTS ===== */
  ul, ol {
    margin: 8px 0 14px 0;
    padding-left: 20px;
  }

  ul { list-style: none; padding-left: 16px; }

  ul li {
    position: relative;
    padding-left: 14px;
    margin-bottom: 5px;
  }

  ul li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 7px;
    width: 6px;
    height: 6px;
    background: var(--gold);
  }

  ul ul li::before {
    background: transparent;
    border: 1.5px solid var(--blue);
    width: 5px;
    height: 5px;
  }

  ol li {
    margin-bottom: 5px;
    padding-left: 4px;
  }

  /* Checklist styling */
  li:has(input[type="checkbox"]) {
    list-style: none;
    padding-left: 0;
  }

  li:has(input[type="checkbox"])::before {
    display: none;
  }

  input[type="checkbox"] {
    margin-right: 8px;
    accent-color: var(--blue);
  }

  /* ===== TABLES ===== */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px 0;
    font-size: 8.5pt;
    line-height: 1.5;
  }

  thead tr {
    background: var(--navy);
  }

  th {
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 8px 12px;
    font-size: 7.5pt;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  td {
    padding: 7px 12px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    vertical-align: top;
  }

  tbody tr:nth-child(even) { background: var(--bg-alt); }
  tbody tr:hover { background: var(--blue-subtle); }

  /* ===== CODE ===== */
  code {
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 8pt;
    background: var(--bg-alt);
    border: 1px solid var(--border);
    padding: 1px 5px;
    border-radius: 3px;
    color: var(--navy-mid);
  }

  pre {
    background: var(--navy);
    color: #e2e8f0;
    padding: 16px 20px;
    margin: 12px 0 16px 0;
    overflow-x: auto;
    font-size: 8pt;
    line-height: 1.6;
    border-left: 4px solid var(--gold);
  }

  pre code {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }

  /* ===== BLOCKQUOTES ===== */
  blockquote {
    border-left: 4px solid var(--gold);
    background: var(--gold-light);
    padding: 14px 20px;
    margin: 14px 0;
    font-style: italic;
    color: var(--text);
  }

  blockquote p { margin-bottom: 4px; }

  /* ===== SPECIAL BLOCKS ===== */
  /* Style paragraphs starting with specific keywords */
  p:has(strong:first-child) {
    /* Bold-led paragraphs get slight emphasis */
  }

  /* ===== PAGE FOOTER ===== */
  .page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-alt);
    border-top: 1px solid var(--border);
    padding: 8px 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 7pt;
  }

  .page-footer-left {
    color: var(--slate-light);
    font-weight: 500;
  }

  .page-footer-center {
    color: var(--slate-light);
    font-weight: 500;
  }

  .page-footer-right {
    color: var(--gold-dark);
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  /* ===== PRINT HELPERS ===== */
  .content h2 { break-after: avoid; }
  .content h3 { break-after: avoid; }
  .content table { break-inside: avoid; }
  .content pre { break-inside: avoid; }
  .content blockquote { break-inside: avoid; }

</style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover">
    <div class="cover-header">
      <div class="cover-brand">EBYG <span>Automation</span></div>
      <div class="cover-url">www.ebygautomation.com</div>
    </div>
    <div class="cover-body">
      <div class="cover-category">${meta.category}</div>
      <div class="cover-title">${meta.title}</div>
      <div class="cover-subtitle">${meta.subtitle}</div>
      <div class="cover-number">${meta.icon}</div>
    </div>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <div class="cover-meta-label">Prepared For</div>
        <div class="cover-meta-value">Precision Structures Inc.</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Prepared By</div>
        <div class="cover-meta-value">EBYG Automation &mdash; SSC Digital Services</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Date</div>
        <div class="cover-meta-value">${date}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Document</div>
        <div class="cover-meta-value">${meta.icon} of 17</div>
      </div>
    </div>
    <div class="cover-footer">
      <div class="cover-footer-left">EBYG Automation &middot; AI &middot; Automation &middot; IT Services &middot; (801) 648-9652 &middot; info@ebygautomation.com</div>
      <div class="cover-footer-right">CONFIDENTIAL</div>
    </div>
  </div>

  <!-- CONTENT -->
  <div class="page-header-bar">
    <div class="page-header-brand">EBYG <span>Automation</span></div>
    <div class="page-header-doc">${meta.category} &mdash; ${meta.title}</div>
  </div>
  <div class="content">
    ${htmlBody}
  </div>

</body>
</html>`;
}

async function generatePDFs() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all markdown files
  const mdFiles = fs.readdirSync(DOCS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  console.log(`\n  EBYG Automation — Branded PDF Generator`);
  console.log(`  Found ${mdFiles.length} documents\n`);

  const browser = await chromium.launch();
  const generated = [];

  for (const file of mdFiles) {
    const slug = file.replace('.md', '');
    const meta = DOC_META[slug];
    if (!meta) {
      console.log(`  Skipping: ${file} (no metadata defined)`);
      continue;
    }

    console.log(`  [${meta.icon}/17] Generating: ${meta.title}`);

    const mdContent = fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
    const html = buildHTML(mdContent, meta, file);

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Wait for fonts to load
    await page.waitForTimeout(2000);

    const pdfPath = path.join(OUTPUT_DIR, `${slug}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="width:100%; padding: 6px 56px; display:flex; justify-content:space-between; align-items:center; font-family: Inter, Arial, sans-serif; font-size:7px; border-top: 1px solid #e2e8f0; background: #f8fafc;">
          <span style="color:#94a3b8;">EBYG Automation &middot; (801) 648-9652 &middot; info@ebygautomation.com</span>
          <span style="color:#94a3b8;">${meta.title}</span>
          <span style="color:#a37b1e; font-weight:700;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    generated.push({ file: `${slug}.pdf`, title: meta.title, category: meta.category });
    await context.close();
  }

  await browser.close();

  // Generate index
  let index = `# Precision Structures — Branded Document Package\n\n`;
  index += `**Generated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
  index += `**Prepared by:** EBYG Automation — SSC Digital Services\n\n`;
  index += `| # | Category | Document | File |\n`;
  index += `|---|----------|----------|------|\n`;
  for (const item of generated) {
    index += `| ${generated.indexOf(item) + 1} | ${item.category} | ${item.title} | [${item.file}](./${item.file}) |\n`;
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.md'), index);

  console.log(`\n  Done! Generated ${generated.length} branded PDFs.`);
  console.log(`  Output: ${OUTPUT_DIR}\n`);
}

generatePDFs().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
