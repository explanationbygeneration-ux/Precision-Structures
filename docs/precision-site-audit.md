# Precision Structures Inc. — Comprehensive Site Audit

**Prepared:** March 18, 2026
**Auditor:** SSC Digital Services
**Subject:** precisionstructures.net — Full technical and content audit
**Status:** Pre-launch / Active Development

---

## 1. Tech Stack Summary

| Layer | Technology | Notes |
|---|---|---|
| Markup | HTML5 | Semantic elements, no templating engine |
| Styling | CSS3 (single file, 693 lines) | CSS custom properties for theming; responsive breakpoints at 900px and 600px |
| JavaScript | Vanilla JS (main.js 162 lines, chatbot.js 321 lines) | No frameworks, no bundler, no transpiler |
| Fonts | Google Fonts — Oswald, Barlow, Source Serif 4 | Loaded via external stylesheet link |
| Hosting | Azure Static Web Apps | GitHub Actions CI/CD pipeline |
| Source Control | GitHub | Branching: `develop` (staging) / `master` (production) |
| Build Tools | **None** | Files are edited and deployed directly — no compilation step |

**Key takeaway:** This is the simplest possible production web stack. There is no build step, no dependency tree, and no framework lock-in. This is an advantage for maintainability but a limitation for scalability.

---

## 2. Routing / Page Structure Summary

The site consists of **6 static HTML pages** with no client-side routing or server-side rendering.

| Page | File | Purpose | Key Components |
|---|---|---|---|
| Home | `index.html` | Landing page / first impression | Hero section, stats strip, about snippet, services cards, process steps, inspirational quote, service area map reference, AI tools promotion |
| About | `about.html` | Company background | Company history narrative, 5 core values, timeline (1990-2025), key statistics |
| Services | `services.html` | Service offerings detail | 3 service cards (overview), detailed sections for roof trusses / floor trusses / custom structural, SVG technical diagrams, process steps, service area |
| Gallery | `gallery.html` | Project portfolio | Category filter buttons, 12 gallery items with lightbox overlay, image grid |
| Resources | `resources.html` | Tools and education | 3 AI tool cards, estimate calculator, project planning guide, terminology glossary with SVG diagram, 6 common truss type SVG illustrations |
| Contact | `contact.html` | Lead capture / inquiry | Contact form (7 fields + file upload), contact info card, embedded Google Maps, 3-column contact method display |

**Navigation** is consistent across all pages: top utility bar (phone, email, social links), main nav with logo, and a mobile hamburger menu at smaller breakpoints.

---

## 3. CMS / Admin / Editability Status

**There is no CMS, no admin panel, and no content management layer of any kind.**

All content is hardcoded directly in HTML files. This has the following consequences:

- **Contact information** (phone number, email addresses, physical address, business hours) is duplicated across **10+ locations** in 6 HTML files. A single phone number change requires editing every file.
- **Service descriptions, stats, company history, and all other copy** live in raw HTML. There is no structured data source, no JSON content file, and no template variable system.
- **Any content update requires a developer** who can edit HTML, commit to Git, and push to trigger deployment.
- **Non-technical staff cannot make updates** without developer assistance.

This is the single largest operational risk for long-term maintainability.

---

## 4. Deployment Architecture Summary

```
Developer pushes code
        |
        v
GitHub Repository
        |
        +---> push to `develop` ---> GitHub Actions ---> Azure SWA (staging environment)
        |
        +---> push to `master`  ---> GitHub Actions ---> Azure SWA (production)
```

- **CI/CD:** GitHub Actions workflow with conditional deployment environment based on branch.
- **Hosting:** Azure Static Web Apps (serverless static hosting with global CDN).
- **SSL:** Provided automatically by Azure SWA.
- **Custom domain:** Configured at the Azure SWA level.
- **No backend services** are deployed alongside the static site (no Azure Functions, no database, no server).

The deployment pipeline is clean and functional. Staging and production are properly separated.

---

## 5. Current SEO Status

### What exists:
| Item | Status | Notes |
|---|---|---|
| Meta descriptions | Present on all 6 pages | Appear well-written and page-specific |
| Open Graph tags | Present | Enables social media link previews |
| `robots.txt` | Present | Standard allow-all configuration |
| `sitemap.xml` | Present | Lists all 6 pages |
| Semantic HTML | Partial | Uses some semantic elements but not comprehensively |
| Responsive design | Yes | Mobile-friendly, passes basic mobile usability |

### What is missing or broken:
| Item | Impact | Priority |
|---|---|---|
| **Structured data (JSON-LD)** | Google cannot extract business info, services, or reviews for rich snippets | High |
| **Canonical tags** | Risk of duplicate content signals if pages are accessible via multiple URLs | Medium |
| **Stale sitemap dates** | `lastmod` dates all show 2025-01-01 — signals to crawlers that the site is unmaintained | Medium |
| **No Google Search Console** | No visibility into indexing status, crawl errors, or search performance | High |
| **No analytics** | Zero data on traffic, user behavior, or conversion | Critical |
| **No local business schema** | Missing from Google's local pack and knowledge panel results | High |
| **Page speed optimization** | No image compression pipeline, no lazy loading, no critical CSS extraction | Low (site is small) |

**Bottom line:** The site has a baseline SEO foundation but lacks the structured data and tracking infrastructure needed to compete in local search for commercial construction services in the 6-state service area.

---

## 6. Current Security Posture

### What exists:
| Header / Measure | Status |
|---|---|
| `X-Content-Type-Options: nosniff` | Set globally via `staticwebapp.config.json` |
| `X-Frame-Options: DENY` | Set globally |
| `Referrer-Policy: strict-origin-when-cross-origin` | Set globally |
| `Permissions-Policy` | Set globally (restricts camera, microphone, geolocation) |
| HTTPS | Enforced by Azure SWA |
| Chatbot API key | Handled via proxy URL pattern — key is not exposed in client-side code |

### What is missing:
| Gap | Risk | Priority |
|---|---|---|
| **Content Security Policy (CSP)** | No protection against XSS injection. Inline scripts and styles have no nonce/hash allowlisting. | Medium |
| **No CAPTCHA on contact form** | Bot spam submissions (once the form actually works) | Medium |
| **No rate limiting** | Chatbot proxy and contact form have no abuse throttling | Low (volume is low) |
| **No backend authentication** | Not currently needed, but relevant if a client portal is built | Future |
| **No Subresource Integrity (SRI)** | External font/script resources could theoretically be tampered with | Low |

**Overall assessment:** Security posture is reasonable for a static brochure site. The global headers are well-configured. CSP is the most notable gap. The bigger risk is operational (the non-functional contact form) rather than adversarial.

---

## 7. Current Staging / Production Workflow

| Aspect | Current State |
|---|---|
| Branching model | `develop` = staging, `master` = production |
| Deployment trigger | Push to either branch triggers GitHub Actions |
| Staging URL | Azure SWA staging environment (separate URL) |
| Production URL | precisionstructures.net |
| Merge process | Manual merge from `develop` to `master` |
| Automated testing | **None** — no linting, no link checking, no visual regression, no accessibility tests |
| Preview / review | Manual browser inspection of staging URL |

The workflow is functional but has **no automated quality gates**. A broken page or a typo can reach production with no warning.

---

## 8. Reusable Components Already Available

Despite the lack of a templating system, the following UI patterns are consistently implemented across all pages and could be extracted into reusable components if a templating layer is introduced:

| Component | Description | Appears On |
|---|---|---|
| Top utility bar | Phone, email, social media links | All 6 pages |
| Main navigation | Logo, nav links, mobile hamburger | All 6 pages |
| Mobile nav overlay | Slide-in menu for small screens | All 6 pages |
| Footer | Contact info, nav links, social icons, copyright | All 6 pages |
| Service cards | Icon + title + description card layout | Home, Services |
| Process steps | Numbered step indicators with descriptions | Home, Services |
| Stats strip | Animated counter numbers with labels | Home, About |
| Section headers | Consistent heading + subtitle + divider pattern | All pages |
| CTA buttons | Consistent button styling with hover states | All pages |
| SVG diagrams | Technical truss illustrations | Services, Resources |

**These components are currently copy-pasted** across files. They are not templated, not imported, and not centrally managed.

---

## 9. Gaps Relative to Requested Features

This section maps each discussed feature to its current state on the site.

| Requested Feature | Current State | Gap Description |
|---|---|---|
| **PDF page reviews** | Not implemented | No mechanism to generate or deliver PDF snapshots of pages |
| **Client update portal** | Not implemented | No admin interface; all edits require Git + code knowledge |
| **AI chatbot** | Partially built (chatbot.js, 321 lines) | PrecisionChatbot class exists with Claude API proxy, keyword fallback, typing indicator. Needs persona refinement, conversation logging, and reliability hardening. |
| **Company voice / persona** | Not documented | No brand voice guide, no system prompt documentation, no tone-of-voice reference |
| **Email-to-staging workflow** | Not implemented | No mechanism to receive email-based update requests and translate them to site changes |
| **SEO technical setup** | Partial (meta tags + OG exist) | Missing structured data, canonical tags, analytics, Search Console, updated sitemap |
| **Social media support** | Links to Facebook + Instagram exist | No content calendar, no posting workflow, no social-specific content creation |
| **Security + testing** | Partial (headers exist) | No CSP, no form backend, no CAPTCHA, no automated testing, no accessibility audit |
| **Analytics / reporting** | Not implemented | Zero tracking — no pageviews, no conversion data, no user behavior data |
| **Contact form backend** | **NOT FUNCTIONAL** | Form shows a success message on submit but data is not sent anywhere. Leads are being lost. |

---

## 10. Recommended Implementation Path

### Path A: Fastest to Value (Ship Critical Fixes First)

| Priority | Task | Effort | Impact |
|---|---|---|---|
| 1 | **Fix contact form** — connect to a backend (Azure Function + SendGrid/email) | 1-2 days | Critical: currently losing leads |
| 2 | **Add Google Analytics (GA4)** | 2 hours | Start collecting data immediately |
| 3 | **Update copyright to 2026** | 15 minutes | Professionalism |
| 4 | **Update sitemap.xml dates** | 15 minutes | SEO signal |
| 5 | **Add JSON-LD structured data** (LocalBusiness, Service) | 4 hours | Local search visibility |
| 6 | **Replace gallery placeholders** with real project photos | 1-2 days (pending photo availability) | Credibility |
| 7 | **Add canonical tags** to all pages | 1 hour | SEO hygiene |
| 8 | **Refine chatbot persona** and system prompt | 1 day | Better user experience for AI feature |

**Total estimated time: 1-2 weeks.** This path gets the site to a professional, functional state.

### Path B: Best Long-Term Architecture

| Priority | Task | Effort | Impact |
|---|---|---|---|
| 1 | Introduce a lightweight templating layer (e.g., Eleventy, or even simple includes via a build script) to eliminate copy-paste duplication | 2-3 days | Maintainability |
| 2 | Extract contact info, service data, and stats into a structured JSON content file | 1 day | Single source of truth |
| 3 | Build a simple admin portal (headless CMS like Decap CMS, or custom lightweight UI) | 1-2 weeks | Non-technical staff can update content |
| 4 | Implement email-to-staging update workflow | 2-3 weeks | Streamlined update process |
| 5 | Add automated testing (link checking, accessibility, visual regression) to CI/CD | 2-3 days | Quality gates |
| 6 | Implement CSP headers and form CAPTCHA | 1 day | Security hardening |

**Total estimated time: 4-6 weeks.** This path builds infrastructure for the long haul.

### Path C: Best Value (High Impact, Low Effort)

| Task | Effort | Business Value |
|---|---|---|
| Fix contact form backend | 1-2 days | Stop losing leads — immediate ROI |
| Add GA4 analytics | 2 hours | Data-driven decisions |
| SEO structured data + canonical tags | 1 day | Better search ranking |
| Chatbot persona refinement | 1 day | Differentiated user experience |
| PDF page review script (Playwright) | 0.5 days | Client review workflow |
| Social media content calendar setup | 1 day | Consistent online presence |

**Total estimated time: 1 week.** Maximum business impact per hour spent.

---

## 11. Brittle, Risky, and Incomplete Items to Fix Before Launch

These items represent real operational or reputational risks and should be addressed before the site is promoted publicly.

| # | Item | Severity | Description |
|---|---|---|---|
| 1 | **Contact form does not work** | **CRITICAL** | The form displays a success message on submission, but no data is transmitted to any backend. Every form submission is silently lost. Any visitor who fills out the form believes they have contacted the company and will expect a response that will never come. This must be fixed before any marketing or promotion. |
| 2 | **Copyright date says 2025** | Medium | Footer displays "2025" — should read "2026". Signals the site is not actively maintained. Appears on all 6 pages. |
| 3 | **Gallery is 92% placeholder images** | High | 11 of 12 gallery images are AI-generated. A gallery full of fake images undermines credibility. Either replace with real project photos or reduce the gallery to only real images. |
| 4 | **No analytics installed** | High | There is zero data collection. No pageviews, no conversion tracking, no user behavior. Flying blind. Cannot measure ROI of any marketing or SEO effort. |
| 5 | **No structured data (JSON-LD)** | Medium | Google cannot extract business name, address, phone, services, or service area for rich results or the local pack. Major missed opportunity for a local service business. |
| 6 | **Stale sitemap dates** | Medium | All `lastmod` entries in `sitemap.xml` show `2025-01-01`. Search engines use this signal to determine crawl priority. Stale dates may reduce crawl frequency. |
| 7 | **Hardcoded content duplication** | Medium | Contact info is copy-pasted across 10+ locations in 6 files. One missed edit creates inconsistency. A phone number change is a 6-file operation with no safety net. |
| 8 | **No Content Security Policy** | Low-Medium | The site has other security headers but no CSP. While the attack surface of a static site is small, CSP is considered a baseline security measure. |
| 9 | **No automated testing in CI/CD** | Medium | No broken-link checking, no accessibility testing, no visual regression testing. Errors reach production unchecked. |
| 10 | **No Google Search Console verification** | Medium | Cannot monitor indexing status, crawl errors, or search performance. Should be set up alongside analytics. |

---

## 12. "Do Not Overbuild" Advisory

This site serves a structural steel and truss manufacturing company in the Intermountain West. It is a **lead generation brochure site**, not a SaaS product.

### Resist the urge to:

- **Add a JavaScript framework** (React, Vue, etc.) — The current vanilla HTML/CSS/JS stack is perfectly appropriate. The site has 6 pages. A framework adds build complexity, dependency maintenance, and developer onboarding cost with zero user-facing benefit.

- **Build a custom CMS from scratch** — If a content management layer is needed, use an existing solution (Decap CMS, Netlify CMS, or a simple JSON file + admin UI). Do not architect a database-backed content system for a 6-page site.

- **Over-engineer the chatbot** — The chatbot is a differentiator, but it should remain a helpful assistant, not a complex conversational AI platform. Keep the scope to answering common questions about services, pricing ranges, and process. Do not build a booking system, a quoting engine, or a project management interface into it.

- **Add a database** — Unless a client portal with user accounts is built, there is no need for a database. Form submissions can go to email. Analytics come from GA4. Content lives in files.

- **Introduce microservices** — If backend functions are needed (form handler, chatbot proxy, PDF generation), a single Azure Functions app with a few endpoints is sufficient. Do not create separate services, message queues, or event-driven architectures.

- **Spend weeks on performance optimization** — The site is small, static, and served from a CDN. It is already fast. Image optimization and lazy loading are worth doing, but do not invest in critical CSS extraction, code splitting, or service workers.

### The right level of engineering for this project:

- Static HTML/CSS/JS with a thin templating layer (optional)
- 1-3 Azure Functions for backend needs (form handler, chatbot proxy, PDF generation)
- GA4 for analytics
- Structured data for SEO
- A simple, documented content update process

**Build the minimum that serves the business. Ship it. Iterate based on data.**

---

*End of audit. This document should be reviewed alongside the Feature Gap Analysis for implementation planning.*
