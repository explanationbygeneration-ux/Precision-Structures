# Go-Live Readiness Checklist — Precision Structures Inc.

**Project:** Precision Structures Inc. Website
**URL:** precisionstructures.net
**Platform:** Azure Static Web Apps
**Date Prepared:** 2026-03-18
**Prepared By:** SSC Development Team

---

> Every item below must be checked off before the site goes live on the production domain. Items marked **(CRITICAL)** are blockers — the site must not launch until they are resolved.

---

## Domain & SSL

- [ ] Custom domain configured in Azure Static Web Apps portal
- [ ] SSL certificate provisioned and active (Azure auto-manages via Let's Encrypt)
- [ ] www to non-www redirect configured (or vice versa — pick one canonical form)
- [ ] Non-www to www redirect configured (inverse of above)
- [ ] DNS A/CNAME records pointed to Azure SWA endpoint
- [ ] DNS propagation verified (use dig or whatsmydns.net)
- [ ] Old domain redirects configured (if migrating from a previous site)

---

## Environment Separation

- [ ] `develop` branch deploys to staging environment automatically
- [ ] `master` branch deploys to production environment automatically
- [ ] Staging URL accessible and shared with client for review
- [ ] Production URL resolves to custom domain
- [ ] Staging and production environments confirmed independent (changes to staging do not affect production)

---

## Content Verification

- [ ] Phone number verified: (801) 985-3000
- [ ] Bids email verified: bids@precisionstructures.net
- [ ] General email verified: contact@precisionstructures.net
- [ ] Address verified: 5333 S. 5500 W., Hooper, UT 84315
- [ ] Business hours verified: Mon-Fri 8am-4pm
- [ ] Service area states listed: Utah, Idaho, Wyoming, Colorado, Nevada, Montana
- [ ] Facebook link verified: https://facebook.com/Precisionstructures/
- [ ] Instagram link verified: https://instagram.com/precision_structures_ut/
- [ ] Copyright year updated to 2026
- [ ] Gallery images reviewed — currently AI-generated placeholders; need real project photos or explicit client approval to keep **(CRITICAL)**
- [ ] All page text proofread and approved by client
- [ ] No lorem ipsum or placeholder text remaining on any page
- [ ] Company logo is final version
- [ ] Favicon set and rendering correctly in browser tabs

---

## Forms & Functionality

- [ ] Contact form connected to a backend service (Azure Function, Logic App, or third-party) **(CRITICAL — currently non-functional; form shows success message but data is not sent anywhere)**
- [ ] Form submissions delivered to bids@precisionstructures.net
- [ ] Form success message displays after successful submission
- [ ] Form error message displays on submission failure
- [ ] Form validates required fields before submission
- [ ] File upload for blueprints working end-to-end (client-side + server-side)
- [ ] File upload restricted to acceptable types (PDF, DWG, DXF, images)
- [ ] File upload size limit enforced (server-side when backend added)
- [ ] Estimate calculator tested with typical inputs
- [ ] Estimate calculator tested with edge cases (zero values, very large values, empty fields)
- [ ] Chatbot opens, accepts input, and returns responses
- [ ] Chatbot tested with common customer queries (pricing, services, contact info)
- [ ] Gallery lightbox opens, closes, and navigates between images
- [ ] Gallery category filter buttons work correctly
- [ ] All navigation links on all pages verified (no broken links)
- [ ] Mobile hamburger menu opens, closes, and navigates correctly
- [ ] Scroll-reveal animations fire on all pages
- [ ] Stat counter animations trigger when scrolled into view
- [ ] Back-to-top button works (if present)
- [ ] External links open in new tab

---

## SEO

- [ ] `sitemap.xml` present at site root with all 6 pages listed
- [ ] `sitemap.xml` lastmod dates updated to current dates (currently stale at 2025-01-01)
- [ ] `robots.txt` present and allows crawling of all public pages
- [ ] Unique meta description on every page
- [ ] Unique title tag on every page
- [ ] Structured data (JSON-LD) added — LocalBusiness schema at minimum
- [ ] Canonical tags on all pages to prevent duplicate content
- [ ] Open Graph (OG) title, description, and image on all pages
- [ ] Twitter Card meta tags on all pages
- [ ] H1 tag present and unique on every page
- [ ] Image alt text descriptive and keyword-relevant
- [ ] No orphan pages (every page reachable from navigation)

---

## Security

- [ ] Security headers configured in `staticwebapp.config.json`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
  - [ ] `Permissions-Policy` set appropriately
- [ ] Content Security Policy (CSP) header added **(currently missing)**
- [ ] No API keys, tokens, or secrets exposed in client-side JavaScript
- [ ] Chatbot proxy URL does not expose underlying API keys
- [ ] Form spam protection implemented (honeypot field or CAPTCHA)
- [ ] File upload validation on server-side (when backend is added)
- [ ] HTTPS enforced — HTTP requests redirect to HTTPS

---

## Performance

- [ ] All images compressed and saved at appropriate dimensions
- [ ] Images use modern formats where possible (WebP with fallbacks)
- [ ] Web fonts preloaded via `<link rel="preload">`
- [ ] CSS and JS files minified (or confirmed acceptable size for static site)
- [ ] No render-blocking resources that can be deferred
- [ ] Google PageSpeed Insights score acceptable (target: 90+ on mobile)
- [ ] Largest Contentful Paint (LCP) under 2.5 seconds
- [ ] Cumulative Layout Shift (CLS) under 0.1
- [ ] First Input Delay (FID) under 100ms

---

## Accessibility

- [ ] Skip-to-content link added on all pages **(currently missing)**
- [ ] `lang="en"` attribute on `<html>` tag
- [ ] Alt text present on all images
- [ ] Decorative images use `alt=""`
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- [ ] All interactive elements reachable via keyboard (Tab, Enter, Escape)
- [ ] Focus indicators visible on all interactive elements
- [ ] Form inputs have associated `<label>` elements
- [ ] ARIA labels on icon-only buttons and interactive elements
- [ ] Screen reader tested with NVDA or VoiceOver (basic page flow)
- [ ] No auto-playing media

---

## Analytics & Monitoring

- [ ] Google Analytics 4 (or equivalent) installed and receiving data
- [ ] Google Search Console configured and sitemap submitted
- [ ] Uptime monitoring configured (UptimeRobot, Azure Monitor, or equivalent)
- [ ] Error logging configured for backend endpoints (when added)
- [ ] 404 page configured and user-friendly

---

## Legal & Privacy

- [ ] Privacy policy page added (required if collecting form data or using analytics)
- [ ] Cookie consent banner added (if using analytics cookies)
- [ ] Terms of service page (optional, but recommended)
- [ ] ADA compliance statement (optional, but recommended for construction industry)

---

## Final Steps

- [ ] Client provides final written sign-off on staging site
- [ ] Backup of current production site taken (if any existing site)
- [ ] Merge `develop` into `master` to trigger production deployment
- [ ] Production deployment confirmed successful in Azure SWA portal
- [ ] Post-deploy smoke test: visit every page, test form, test chatbot, test gallery
- [ ] DNS cutover executed (if changing from old domain/host)
- [ ] Old hosting canceled (if migrating — wait for DNS propagation first)
- [ ] Client notified that site is live

---

## Summary of Known Blockers

| # | Issue | Priority |
|---|-------|----------|
| 1 | Contact form does not send data anywhere | **CRITICAL** |
| 2 | Gallery images are AI-generated placeholders | **HIGH** |
| 3 | No Content Security Policy header | **HIGH** |
| 4 | No skip-to-content link (accessibility) | **MEDIUM** |
| 5 | Copyright year shows 2025, should be 2026 | **MEDIUM** |
| 6 | Sitemap lastmod dates stale (2025-01-01) | **MEDIUM** |
| 7 | No analytics tracking installed | **MEDIUM** |
| 8 | No privacy policy page | **MEDIUM** |
