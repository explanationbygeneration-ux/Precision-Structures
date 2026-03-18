# Changelog

## [1.1.0] — 2026-03-17 — Production Readiness Cleanup

### Fixed
- **Inconsistent contact info** — Standardized phone (801-985-3000), emails (bids@ and contact@precisionstructures.net), and address across all 6 pages
- **Missing nav links** — Added "Resources" link to about.html, services.html, gallery.html, and contact.html nav menus
- **Double chatbot on about.html** — Removed hardcoded chatbot HTML; chatbot.js already injects it dynamically
- **Service area inconsistency** — Standardized to 6 states (UT, ID, WY, CO, NV, MT) across all pages; removed AZ and NM from services.html
- **Footer brand inconsistency** — Standardized to "Precision Structures Inc." with consistent tagline, links, and contact info
- **Social links** — Replaced all placeholder `#` hrefs with real Facebook and Instagram URLs
- **Quote attribution** — Replaced fashion designer placeholder quotes with company-appropriate content
- **Stats inconsistency** — Aligned stats between homepage and about page (1000s trusses, 6 states)

### Added
- **Open Graph meta tags** on all 6 pages for social sharing
- **Meta descriptions** on pages that were missing them
- **Favicon link** (`favicon.png`) on all pages — actual file needs to be provided
- **robots.txt** for search engine crawling
- **sitemap.xml** with all 6 pages
- **staticwebapp.config.json** for Azure Static Web Apps (routing, security headers)
- **GitHub Actions workflow** (`.github/workflows/azure-static-web-apps.yml`) for Azure SWA deployment
- **API directory scaffold** (`api/README.md`) for future Azure Functions
- **.gitignore** expanded for OS files, editors, Azure, Node, and Claude Code
- **README.md** with project overview, local dev, branch strategy, deployment guide
- **CHANGELOG.md** (this file)

### Changed
- Standardized CTA button text to "Get a Bid" across all pages (was mix of "Get a Quote" / "Get a Bid")
- Standardized mobile nav structure across all pages with consistent "Get a Bid" CTA
- Standardized top bar content across all pages
- Updated copyright year references to 2025

## [1.0.0] — Initial Release
- Multi-page static website: Home, About, Services, Gallery, Contact, Resources
- CSS design system with blue/gold color palette
- Scroll-reveal animations
- AI chatbot with keyword fallback responses
- Truss cost estimate calculator
- Gallery with category filters and lightbox
- Contact form (client-side only)
