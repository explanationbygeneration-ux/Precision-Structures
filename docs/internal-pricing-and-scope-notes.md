# Internal Pricing & Scope Notes — Precision Structures

**FOR INTERNAL USE ONLY — NOT CLIENT-FACING**

Last updated: March 2026

---

## Client Profile

- Small family-owned truss manufacturer, in business since 1990
- Based in Hooper, UT; serves UT, ID, WY, CO, NV, MT
- Likely price-conscious but values quality — they're not chasing the cheapest option, but they need to feel like they're getting solid value
- Not technical — they don't want to learn systems, they want things to work
- Decision-maker is probably the owner or a family member with authority to sign off quickly
- They liked what we built, which is a good sign — this is a warm relationship, not a cold sell

---

## Base Package — Cost Analysis

**Estimated hours:** 15–25 hours

| Task | Hours (est.) | Notes |
|------|-------------|-------|
| PDF generation for 6 pages | 2–3 | Mostly automated, some formatting cleanup |
| Content changes from PDF markup | 4–8 | Highly variable — depends on how much they want changed |
| Contact form backend (Azure Function) | 3–4 | Straightforward; Azure Function + SendGrid or similar |
| SEO technical setup | 2–3 | Structured data, meta tags, sitemap, canonicals |
| Security hardening | 1–2 | CSP headers, honeypot, rate limiting |
| Accessibility fixes | 1–2 | Skip link, contrast check, alt text audit |
| Cross-browser/mobile testing | 2–3 | Manual testing across browsers and devices |
| Staging review + go-live | 1–2 | Client walkthrough, deployment, smoke test |

**Pricing tiers:**

| Tier | Price | Our Hours | Effective Rate | Margin |
|------|-------|-----------|---------------|--------|
| Lean | $2,500 | ~15 hrs | ~$167/hr | Strong |
| Standard | $3,200 | ~20 hrs | ~$160/hr | Strong |
| Premium | $4,000 | ~25 hrs | ~$160/hr | Strong |

**Recommendation:** Quote Standard ($3,200) as the default. Most clients end up with moderate changes. If their PDF markup is light, we come out ahead. If it's heavy, we're still covered at Premium.

**Risk:** Scope creep on "final changes." The phrase "just a few tweaks" can balloon. The single revision round limit is critical — enforce it politely but firmly. Additional rounds at $150/hr.

---

## Add-On Cost Analysis

### AI Chatbot Enhancement

| Item | Hours | Cost to Us | Price to Client | Margin |
|------|-------|-----------|----------------|--------|
| API proxy setup | 4–6 | ~$800 labor | — | — |
| Persona training/refinement | 3–5 | ~$600 labor | — | — |
| Lead capture integration | 2–3 | ~$400 labor | — | — |
| Analytics setup | 2–3 | ~$400 labor | — | — |
| **Total** | **11–17 hrs** | **~$2,200** | **$1,500–$2,500** | **Moderate** |

Recurring: API costs are $50–150/mo depending on usage. Pass through at cost + 20% markup. Low effort after initial setup — maybe 1–2 hrs/month monitoring.

**This is the easy win.** The chatbot UI is already built. We're mostly adding backend infrastructure. Client already expressed interest. High perceived value, moderate effort. Lead with this as the first add-on recommendation.

---

### Client Update Portal

| Item | Hours | Cost to Us | Price to Client | Margin |
|------|-------|-----------|----------------|--------|
| Auth system | 6–8 | ~$1,200 | — | — |
| CRUD interface | 10–15 | ~$2,000 | — | — |
| Preview/publish workflow | 4–6 | ~$800 | — | — |
| Version history/rollback | 4–6 | ~$800 | — | — |
| **Total** | **24–35 hrs** | **~$4,800** | **$3,000–$5,000** | **Low to moderate** |

Recurring: $100–200/mo for hosting and maintenance. This requires real ongoing maintenance — bug fixes, security patches, compatibility updates. Budget 2–4 hrs/month.

**Honest assessment:** This is our lowest-margin item. Custom admin interface is real development work, and maintenance is ongoing. Only recommend if the client genuinely needs frequent self-service updates. For a truss company that updates their site maybe once a quarter, this is probably overkill. Better to steer them toward the email workflow or just a simple "email us and we'll do it" retainer.

---

### Email-to-Staging Update Workflow

| Item | Hours | Cost to Us | Price to Client | Margin |
|------|-------|-----------|----------------|--------|
| Email intake setup | 3–4 | ~$600 | — | — |
| AI parsing pipeline | 8–12 | ~$1,600 | — | — |
| Review queue interface | 6–8 | ~$1,200 | — | — |
| Staging preview system | 4–6 | ~$800 | — | — |
| **Total** | **21–30 hrs** | **~$4,200** | **$2,500–$4,000** | **Low on setup** |

Recurring: $200–400/mo covers monitoring, AI API costs, and maintenance. Budget 3–5 hrs/month ongoing.

**Assessment:** Cool concept, but high complexity for a small client. The ongoing cost ($200–400/mo) may be a hard sell for a family business. Position this as Phase 2 at the earliest. If they want simple updates, a basic retainer ("email us, we'll make changes within 48 hours, $X/month") is more practical and more profitable for us.

**Alternative to propose if they balk at the price:** A simple maintenance retainer at $300–500/month for up to 2–3 hours of changes. No AI, no automation — just responsive service. Higher margin, lower complexity.

---

### SEO & Content Monthly

| Item | Hours/Month | Cost to Us | Price to Client | Margin |
|------|------------|-----------|----------------|--------|
| SEO monitoring/optimization | 2–3 | ~$400 | — | — |
| Content recommendations | 1–2 | ~$250 | — | — |
| Google Business Profile mgmt | 1 | ~$150 | — | — |
| Reporting | 0.5–1 | ~$125 | — | — |
| **Total** | **4.5–7 hrs/mo** | **~$925** | **$500–$1,000/mo** | **High after ramp** |

**This is our best recurring revenue item.** After the first month of setup (heavier lift), this becomes largely routine. SEO monitoring tools cost us ~$50–100/month. The rest is analysis and reporting, which gets faster as we learn the account. At $750+/month, this is very healthy margin once established.

Local SEO for a truss manufacturer is also genuinely valuable — there aren't many competitors optimizing for "truss manufacturer [state]" search terms. We can probably get them ranking well without heroic effort.

---

### Social Media Support

| Item | Hours/Month | Cost to Us | Price to Client | Margin |
|------|------------|-----------|----------------|--------|
| Content calendar | 1–2 | ~$250 | — | — |
| Post creation (4–8 posts) | 3–5 | ~$650 | — | — |
| Platform management | 1–2 | ~$250 | — | — |
| **Total** | **5–9 hrs/mo** | **~$1,150** | **$400–$800/mo** | **Moderate** |

**Assessment:** Margin is thinner here because post creation takes real time, especially if we're producing quality content with project photos. However, this pairs well with SEO — social signals support search rankings, and content can be repurposed.

**Recommendation:** Only propose this if they're already active on Facebook/Instagram or express interest. Don't lead with it. If they want it, price at $600+/month to ensure margin.

---

### Analytics Dashboard

| Item | Hours | Cost to Us | Price to Client | Margin |
|------|-------|-----------|----------------|--------|
| GA4 setup | 2–3 | ~$400 | — | — |
| Conversion tracking | 1–2 | ~$250 | — | — |
| Initial reporting template | 1–2 | ~$250 | — | — |
| **Total** | **4–7 hrs** | **~$900** | **$500 one-time** | **Low standalone** |

**Strategy:** This is a loss leader when sold standalone, but it's almost free to include if they buy the SEO package (we need analytics access anyway). Use it as a bundle sweetener: "Analytics setup is included when you add SEO."

---

## Bundle Discount Strategy

Offer 10–15% off total add-on pricing if the client selects 3 or more add-ons.

**Example bundles to suggest:**

**"Growth Starter" (recommended first pitch):**
- Base package (Standard): $3,200
- Chatbot enhancement: $2,000
- Analytics setup: $500 (or waived if bundled)
- **Total: ~$5,200–$5,700**
- Discount at 10%: ~$4,700–$5,100
- This is the lowest-friction upsell path

**"Full Digital Presence":**
- Base package (Standard): $3,200
- Chatbot enhancement: $2,000
- SEO monthly: $750/mo
- Analytics: included with SEO
- Social media: $600/mo
- **Setup total: ~$5,200** (with 15% bundle discount: ~$4,400)
- **Recurring: ~$1,350/mo**
- This is the dream scenario for recurring revenue

**"Self-Service":**
- Base package (Standard): $3,200
- Client portal: $4,000
- Chatbot: $2,000
- **Total: ~$9,200** (with 10% discount: ~$8,300)
- Higher upfront but lower recurring needs from us
- Only propose if they express strong interest in independence

---

## Recurring Revenue Summary

| Service | Monthly Revenue | Monthly Effort | Net Margin |
|---------|---------------|---------------|------------|
| SEO & Content | $500–$1,000 | 4.5–7 hrs | High |
| Social Media | $400–$800 | 5–9 hrs | Moderate |
| Chatbot API pass-through | $60–$180 (with markup) | 1–2 hrs | Low $ but easy |
| Portal maintenance | $100–$200 | 2–4 hrs | Low |
| Email workflow operation | $200–$400 | 3–5 hrs | Moderate |

**Best-case recurring scenario:** SEO ($750) + Social ($600) + Chatbot ($100) = **$1,450/month** with roughly 10–18 hours of work. That's a solid small-account retainer.

**Realistic scenario:** Base package + chatbot now, SEO added in 3–6 months once they see the site performing. That gives us $750/month recurring within 6 months.

---

## Upsell Path (Recommended Order)

1. **Base package** — This is the commitment. Get them signed, get them launched.
2. **Chatbot enhancement** — Easy win. Already half-built. High wow factor. Low price relative to perceived value.
3. **SEO monthly** — Propose 2–3 months after launch once they have baseline traffic data. "Here's what you're getting organically. Here's what you could be getting."
4. **Analytics** — Bundle with SEO, don't sell standalone.
5. **Portal OR email workflow** — Only if they're requesting frequent changes. Don't push this early.
6. **Social media** — Last priority unless they ask. Most value if combined with SEO.

---

## Risk Areas

**Scope creep on final changes.** This is the #1 risk. "Final review" can become "actually, let's rewrite the About page and add three new sections." The single revision round limit and clear PDF markup process are our protection. If they want more, that's fine — at $150/hour.

**Gallery photo dependency.** The site uses AI-generated images. If they want real photos, someone needs to take them, select them, and provide them. This can stall the project for weeks. Push for a decision early: approve the AI images for launch, or provide real photos within Week 1.

**Client response time.** We're assuming 5 business days for PDF review. A family business during busy season might take longer. Build buffer into the timeline privately (plan for 6 weeks even though we quoted 4).

**Azure costs confusion.** Make sure they understand Azure hosting is their cost, billed by Microsoft, separate from our fees. ~$10–25/month is negligible, but surprises create trust issues.

**Chatbot API costs.** If the chatbot gets popular, API costs could spike. Set up usage alerts and monthly caps. Make sure the client understands this is variable cost, not fixed.

---

## Final Recommendation

Lead with the base package at Standard tier ($3,200). It's fair, it's defensible, and it gets them to launch.

Propose the chatbot enhancement ($1,500–$2,000) in the same conversation — it's the most natural add-on because the foundation already exists and they've already seen it and liked it.

Plant the seed for SEO but don't push it yet. Say something like: "Once the site is live and we have 60–90 days of traffic data, we'd love to talk about search optimization. That's when it makes the most impact."

Everything else — portal, email workflow, social media — is Phase 2+. Mention it exists, let them come to us.

Total realistic initial engagement: **$4,700–$5,200** (base + chatbot)
Total realistic 6-month recurring: **$750–$1,000/month** (SEO + chatbot API)

That's a healthy small account with room to grow.
