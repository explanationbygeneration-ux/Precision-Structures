# SEO & AI-Era Discoverability Plan — Precision Structures Inc.

**Prepared:** March 2026
**Site:** precisionstructures.net
**Industry:** Truss Manufacturing (B2B + B2C)
**Location:** Hooper, Utah | Service Area: UT, ID, WY, CO, NV, MT

---

## 1. Current-State Audit

### What's Working
| Element | Status | Notes |
|---------|--------|-------|
| robots.txt | Present | Allows all, includes sitemap reference |
| sitemap.xml | Present | 6 URLs, correct priorities |
| Meta descriptions | Present on all pages | Relevant, keyword-rich |
| Open Graph tags | Present on all pages | Title, description, site_name, locale |
| Page titles | Well-structured | Include brand name and location |
| Heading hierarchy | Good | H1 on each page, logical H2/H3 structure |
| Mobile responsive | Yes | Breakpoints at 900px and 600px |
| Semantic HTML | Yes | nav, section, footer, proper heading levels |
| Alt text on images | Present | Descriptive alt attributes |
| Clean URLs | Yes | Simple .html file names |

### What's Missing or Weak
| Element | Status | Priority |
|---------|--------|----------|
| Structured data (JSON-LD) | **Missing** | HIGH |
| Canonical tags | **Missing** | HIGH |
| Sitemap lastmod dates | Stale (2025-01-01) | MEDIUM |
| OG images | **Missing** | MEDIUM |
| Google Analytics | **Not installed** | HIGH |
| Google Search Console | **Not connected** | HIGH |
| Google Business Profile | Unknown | HIGH (local SEO) |
| Content Security Policy | Missing (not SEO but related) | MEDIUM |
| FAQ structured data | **Missing** | HIGH (AIO) |
| Blog / content hub | **Missing** | MEDIUM (long-term) |
| Internal linking strategy | Minimal | MEDIUM |
| Image optimization | Unknown (need to check file sizes) | MEDIUM |
| Page speed optimization | Not tested | MEDIUM |

---

## 2. Metadata & Title Gaps

### Current Titles (Good)
- Home: "Precision Structures Inc. | Family-Owned Truss Manufacturing | Hooper, Utah"
- About: "About Us | Precision Structures Inc."
- Services: "Services | Precision Structures Inc."
- Gallery: "Gallery | Precision Structures Inc."
- Resources: "Resources & AI Tools | Precision Structures Inc."
- Contact: "Contact | Precision Structures Inc."

### Recommendations
- Add location to subpage titles: "Services | Truss Manufacturing | Precision Structures Inc."
- Services could be more specific: "Roof & Floor Trusses | Custom Design | Precision Structures Inc."
- Contact could target bid intent: "Get a Bid | Contact Precision Structures Inc. | Hooper, UT"

### Meta Description Improvements
Current descriptions are good. Minor enhancements:
- Include call-to-action phrases ("Get a free bid today")
- Add phone number to contact page description
- Include service area in home page description

---

## 3. Heading Structure Review

All pages have proper H1 tags. Structure is generally good.

**Recommendations:**
- Ensure only ONE H1 per page (currently correct)
- Add more descriptive H2/H3 tags on resources page for each truss type section
- Gallery page could benefit from H2 for each category section

---

## 4. Schema / Structured Data Opportunities

### HIGH PRIORITY — Implement Now

**LocalBusiness Schema (every page)**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Precision Structures Inc.",
  "description": "Family-owned truss manufacturing...",
  "telephone": "(801) 985-3000",
  "email": "bids@precisionstructures.net",
  "address": { ... },
  "openingHours": "Mo-Fr 08:00-16:00",
  "areaServed": [...],
  "foundingDate": "1990"
}
```

**Service Schema (services page)**
- One Service entry per service type (roof, floor, custom)

**FAQ Schema (resources page)**
- Truss terminology as FAQ pairs
- Common questions from chatbot fallback responses

**BreadcrumbList Schema (all subpages)**
- Already have visual breadcrumbs, add structured data to match

### MEDIUM PRIORITY — Phase 2

**Product Schema** — if they want to list specific truss products
**Review/Testimonial Schema** — when they have customer reviews
**HowTo Schema** — for the "How It Works" process section

---

## 5. Internal Linking Opportunities

| From | To | Anchor Text Suggestion |
|------|----|----------------------|
| Home services cards | services.html#roof-trusses (specific sections) | "Learn about roof trusses" |
| About page | services.html | "See our services" |
| Services page | resources.html#terminology | "Truss terminology guide" |
| Services page | resources.html#estimate | "Get an instant estimate" |
| Gallery items | services.html (matching category) | Link by service type |
| Resources estimate | contact.html | "Get an accurate bid" |
| All pages | contact.html | Multiple CTAs already good |

**Current internal linking is decent** — CTAs point to contact page. Could improve cross-linking between services and resources.

---

## 6. Local SEO Opportunities

### Google Business Profile
- **CRITICAL**: Verify or create Google Business Profile
- Category: "Truss Manufacturer" or "Building Materials Supplier"
- Add photos, hours, service area
- Link to website
- Encourage customer reviews

### Local Keyword Targets
- "truss manufacturer Utah"
- "roof trusses Hooper Utah"
- "truss company near me" (within service area)
- "custom truss design Utah"
- "floor trusses Idaho/Wyoming/Colorado/Nevada/Montana"
- "truss delivery Rocky Mountain"

### NAP Consistency (Name, Address, Phone)
Ensure consistent across: website, Google Business, Facebook, Instagram, any directories.
Current site NAP: Precision Structures Inc. | 5333 S. 5500 W., Hooper, UT 84315 | (801) 985-3000

---

## 7. Page Speed / Technical SEO

### Items to Check
- [ ] Image file sizes (compress if >200KB per image)
- [ ] Google PageSpeed Insights score
- [ ] Core Web Vitals (LCP, FID, CLS)
- [ ] Font loading performance (preconnect is already in place)
- [ ] Unused CSS (minimal concern — single file, 693 lines)

### Likely Quick Wins
- Add `loading="lazy"` to gallery images (some already have it)
- Optimize gallery JPGs (if large)
- Add `width` and `height` attributes to images (prevent CLS)
- Consider `font-display: swap` in Google Fonts URL

---

## 8. Image & Asset Optimization

- Gallery images: verify file sizes, compress if needed
- Logo.PNG: check size, consider converting to optimized PNG or SVG
- Add `width` and `height` to all `<img>` tags for layout stability
- All images have alt text (good)
- OG image needed: create a branded share image (1200x630px)

---

## 9. Content Recommendations for Authority

### Blog / Content Hub (Phase 2)
Adding a simple blog or "Project Spotlight" section would dramatically help SEO:
- "What is a roof truss?" (educational, targets long-tail searches)
- "How to prepare for a truss delivery" (practical, builds trust)
- "Choosing the right truss type for your project" (decision-making)
- "Snow load requirements in Utah" (local expertise)
- Project case studies with photos

### Immediate Content Opportunities
- Add more detail to services pages (word count helps)
- Add customer testimonials (social proof + content)
- Add a simple FAQ section to the contact page

---

## 10. FAQ / Answer-Block Opportunities for AI Discoverability (AIO)

AI-powered search engines (Google AI Overviews, Perplexity, ChatGPT search) favor:
- **Clear, direct answers** to specific questions
- **Structured content** (headings, lists, tables)
- **FAQ blocks** with Schema.org markup
- **Authority signals** (specific expertise, unique data)

### Recommended FAQ Content (implement as FAQ section with schema)

1. **What is a roof truss?** — A prefabricated structural frame...
2. **How much do trusses cost?** — Pricing varies by span, pitch...
3. **What areas does Precision Structures serve?** — Utah, Idaho...
4. **How long does it take to get trusses made?** — Typical lead time...
5. **What information do I need to request a bid?** — Blueprints, span...
6. **What types of trusses do you manufacture?** — Fink, Howe, Pratt...
7. **Do you deliver trusses to the job site?** — Yes, across 6 states...
8. **Can you do custom truss designs?** — Absolutely, our engineering team...
9. **What is a truss pitch?** — The slope of the roof expressed as...
10. **How do I submit plans for a bid?** — Email to bids@precisionstructures.net...

These answers already exist in the chatbot fallback responses — we can repurpose them as on-page FAQ content with schema markup.

---

## 11. Trust Signals & Conversion Signals

### Currently Present
- Family-owned messaging (strong)
- 35+ years in business
- Service area coverage
- Process transparency (4 steps)
- Contact info prominent
- Chatbot for immediate engagement

### Missing / Could Add
- Customer testimonials or reviews
- Industry certifications or memberships (TPI, SBCA, etc.)
- "As seen in" or partnership logos (if applicable)
- Case study / project spotlight
- BBB or industry ratings
- Privacy policy link (builds trust, needed for forms)

---

## 12. Implementation Roadmap

### 30-Day Sprint (Immediate — Before/During Launch)
| Task | Effort | Impact |
|------|--------|--------|
| Add JSON-LD LocalBusiness schema to all pages | 2 hrs | HIGH |
| Add FAQ schema to resources page | 1 hr | HIGH |
| Add canonical tags to all pages | 30 min | HIGH |
| Update sitemap.xml dates | 15 min | MEDIUM |
| Add Google Analytics tracking code | 30 min | HIGH |
| Set up Google Search Console | 30 min | HIGH |
| Create/verify Google Business Profile | 1 hr | HIGH |
| Add OG image meta tag | 30 min | MEDIUM |
| Add BreadcrumbList schema | 1 hr | MEDIUM |
| Update copyright year | 15 min | LOW |

### 60-Day Plan (Post-Launch)
| Task | Effort | Impact |
|------|--------|--------|
| Add FAQ section to contact or home page | 2 hrs | HIGH |
| Improve internal linking between pages | 1 hr | MEDIUM |
| Optimize image file sizes | 1 hr | MEDIUM |
| Add Service schema markup | 1 hr | MEDIUM |
| Write 2-3 blog/content pieces | 6 hrs | HIGH |
| Set up local directory listings | 2 hrs | MEDIUM |
| Run PageSpeed audit and fix issues | 2 hrs | MEDIUM |

### 90-Day Plan (Growth)
| Task | Effort | Impact |
|------|--------|--------|
| Launch blog/project spotlight section | 8 hrs | HIGH |
| Monthly content creation (1-2 posts) | ongoing | HIGH |
| Review and respond to Google reviews | ongoing | HIGH |
| Build backlinks from industry directories | 2 hrs | MEDIUM |
| Quarterly SEO performance review | 2 hrs | MEDIUM |
| A/B test page titles and descriptions | 1 hr | LOW |

---

## Technical SEO Changes Implemented in This Sprint

The following changes have been applied to the codebase:

1. **JSON-LD LocalBusiness schema** — Added to index.html (propagates site-wide context)
2. **FAQ schema** — Added to resources.html (truss terminology as FAQ)
3. **Canonical tags** — Added to all 6 pages
4. **BreadcrumbList schema** — Added to all subpages
5. **Sitemap dates updated** — Changed to 2026-03-18
6. **Copyright year updated** — 2025 → 2026 across all pages
7. **Service schema** — Added to services.html

---

*This plan balances immediate technical fixes with a sustainable long-term content strategy. The goal is not just to rank — it's to be the obvious, trustworthy answer when someone in the Rocky Mountain region needs trusses.*
