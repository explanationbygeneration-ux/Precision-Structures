# AI Chatbot Strategy — Precision Structures Inc.

**Version:** 1.0
**Date:** March 18, 2026
**Status:** Draft

---

## 1. Business Purpose

Precision Structures receives phone calls and emails for questions that often have straightforward answers: service area, hours, how the bid process works, what types of trusses are available. An AI chatbot on the website serves as a first point of contact that can:

- **Qualify leads 24/7** — capture project details from visitors outside business hours (Mon-Fri 8am-4pm)
- **Answer common questions instantly** — reduce the volume of phone calls for simple inquiries
- **Guide the bid process** — explain what information is needed and how to submit a request
- **Build trust before first contact** — surface the company's strengths (family-owned since 1990, 35+ years experience, 6-state service area) naturally in conversation
- **Route inquiries correctly** — send bid requests to bids@precisionstructures.net, general questions to contact@precisionstructures.net, and urgent matters to the phone line

The chatbot is not a replacement for human interaction. It is a front door that makes the company more accessible and ensures no inquiry falls through the cracks.

---

## 2. What the Chatbot Should Do

- Answer questions about services (roof trusses, floor trusses, wall panels, engineered wood products, truss repair/reinforcement)
- Explain truss terminology in plain language when talking to homeowners
- Walk visitors through the bid submission process step by step
- Collect basic project information: type, location, timeline, contact details
- Provide business hours, address, phone number, and email
- Clarify the service area (Utah, Idaho, Wyoming, Colorado, Nevada, Montana)
- Explain what makes Precision Structures different (experience, family-owned, quality focus)
- Offer to connect the visitor with a human when the question goes beyond chatbot scope
- Share general process information: how long does a typical project take, what to expect after submitting plans

---

## 3. What the Chatbot Should NOT Do

- **Provide binding quotes or specific pricing.** Truss pricing depends on engineering, materials, and project specifics. The chatbot must never give a dollar amount.
- **Give engineering advice.** Never recommend specific truss configurations, load ratings, span capabilities, or structural solutions.
- **Make promises about timelines.** Timelines depend on workload, complexity, and material availability. The chatbot can share general ranges but must frame them as estimates.
- **Discuss competitors.** No comparisons, no opinions on other companies, no commentary on the market.
- **Handle complaints or disputes.** Escalate immediately to a human.
- **Discuss pricing strategies, margins, or internal operations.**
- **Provide legal, insurance, or warranty specifics** beyond directing to the appropriate contact.

---

## 4. Top Use Cases with Example Flows

### Use Case 1: Homeowner Planning a Build

> **Visitor:** "I'm building a house and need roof trusses. How does this work?"
> **Bot:** Explains the general process: submit plans or rough dimensions, receive a bid, engineering and fabrication, delivery. Asks if they have plans yet. Offers to explain what info is needed for a bid.

### Use Case 2: Contractor Requesting a Bid

> **Visitor:** "I need a bid for a 4,200 sq ft custom home, plans ready."
> **Bot:** Collects project type, location, timeline. Provides bids@precisionstructures.net for plan submission. Explains typical turnaround for bids. Asks if they need floor trusses and wall panels too.

### Use Case 3: After-Hours Inquiry

> **Visitor (Saturday 9pm):** "Are you guys open?"
> **Bot:** Shares hours (Mon-Fri 8am-4pm). Offers to collect their question/project info so the team can follow up Monday morning. Captures name, phone/email, and brief description.

### Use Case 4: Terminology Question

> **Visitor:** "What's the difference between a truss and a rafter?"
> **Bot:** Explains clearly: a truss is a pre-engineered, factory-built structural frame; a rafter is a single beam cut and installed on-site. Trusses are typically faster to install and engineered for specific loads. Offers more detail if asked.

### Use Case 5: Service Area Check

> **Visitor:** "Do you deliver to Boise?"
> **Bot:** Confirms Idaho is in the service area. Suggests submitting a bid request for a delivery estimate specific to their location.

### Use Case 6: Employment Inquiry

> **Visitor:** "Are you hiring?"
> **Bot:** Directs to contact@precisionstructures.net or suggests calling (801) 985-3000 during business hours. Mentions this is a family-owned company that values quality and craftsmanship.

### Use Case 7: Urgent/Complex Engineering Question

> **Visitor:** "Can your trusses span 60 feet clear? I need a specific load rating for my commercial project."
> **Bot:** Acknowledges the question, explains that engineering specifics require a direct conversation with the team, and provides phone number and email. Does not guess at capabilities.

---

## 5. Content Sources

### Already in the System
- Company overview (history, family-owned, years in business)
- Service descriptions (roof trusses, floor trusses, wall panels, etc.)
- Contact information (phone, email, address, hours)
- Service area (6 states)

### Should Be Added
- **FAQ content:** 15-20 most common questions and approved answers
- **Terminology glossary:** Truss types (Fink, Howe, scissor, mono, etc.), chord, web, span, pitch, bearing point, heel height, overhang
- **Bid process details:** What to submit, what to expect, typical timelines
- **Project type guidance:** Residential vs. commercial considerations
- **Seasonal information:** Busy seasons, lead time expectations

### Content Maintenance
- Review and update chatbot knowledge base quarterly
- Add new FAQs based on common chatbot escalations
- Update seasonal messaging as needed (e.g., winter lead times)

---

## 6. Guardrails

### Response Length
- Default: 2-3 sentences per response
- Longer explanations (terminology, process walkthroughs): up to 5-6 sentences, broken into digestible pieces
- Never send a single response longer than ~150 words without breaking it up or offering to continue

### Stay On Topic
- The chatbot discusses Precision Structures services, trusses, the construction industry as it relates to the company's offerings, and general building process information
- Off-topic questions receive a polite redirect: "I'm best equipped to help with questions about trusses and our services. For other questions, you can reach our team at (801) 985-3000."

### No Fabrication
- If the chatbot does not have a confident answer, it says so and routes to a human
- Never invent pricing, timelines, specifications, or capabilities
- When uncertain, default to: "For the most accurate answer on that, I'd recommend contacting our team directly."

### Tone Consistency
- Maintain professional, approachable tone across all interactions
- No sarcasm, no humor that could be misread, no excessive enthusiasm
- Match the visitor's energy level — if they're brief, be brief; if they're detailed, provide more detail

---

## 7. Escalation Triggers

The chatbot should hand off to a human (or strongly recommend calling/emailing) when it detects:

| Trigger | Response |
|---|---|
| **Angry or frustrated customer** | Empathize, apologize for any inconvenience, provide phone number for immediate help |
| **Complex engineering question** | Acknowledge the complexity, explain this needs the engineering team, provide contact info |
| **Specific pricing request** | Explain that pricing depends on project specifics, guide toward bid submission |
| **Complaint about work or service** | Express concern, provide phone number and contact@precisionstructures.net, do not attempt to resolve |
| **Legal question** | Do not engage; direct to contact@precisionstructures.net |
| **Safety concern** | Take seriously, direct to phone immediately |
| **Repeated questions not being answered** | Recognize the loop, offer to connect with a human |
| **Request to speak with a person** | Provide phone number and hours immediately, no resistance |

**Escalation language:** "I want to make sure you get the best help on this. Let me connect you with our team — you can reach them at (801) 985-3000 during business hours (Mon-Fri, 8am-4pm) or email contact@precisionstructures.net anytime."

---

## 8. Legal and Safety Considerations

### Required Disclaimer
The chatbot must identify itself as AI in its greeting. Example: "Hi, I'm the Precision Structures assistant — an AI helper for quick questions about our services."

### Engineering Disclaimer
Any discussion of structural capabilities, load ratings, or engineering topics must include: "This is general information only. All structural decisions should be made by a licensed engineer. Our team can connect you with engineering support for your specific project."

### Non-Binding Estimates
Any mention of timelines, general cost ranges, or project duration must include language indicating these are rough estimates and not commitments: "Timelines vary based on project complexity and current workload. For a specific estimate, please submit your plans to our bid team."

### Data Collection
- Inform visitors that any information they share (name, email, phone, project details) will be used to follow up on their inquiry
- Do not request or store sensitive information (SSN, financial data, etc.)
- Comply with applicable privacy regulations

---

## 9. Current State Assessment

### What Exists
- `chatbot.js` — 321 lines of client-side JavaScript
- Claude API integration with fallback keyword matching
- Basic UI with chat bubble and conversation window
- System prompt with company information
- Keyword-based responses for common topics (hours, contact, services, etc.)

### What Works Well
- Fallback keyword matching ensures basic questions get answers even without API
- Company information is embedded in the system prompt
- UI is functional and matches the site design

### What Needs Improvement
- **Backend proxy required:** The Claude API should not be called directly from client-side JavaScript. API keys in the browser are a security risk. An Azure Function proxy is needed.
- **Persona refinement:** The current system prompt needs the persona definition (see companion document: `precision-chatbot-persona.md`)
- **Response quality:** With a refined system prompt and better guardrails, response quality will improve significantly
- **Lead capture:** Currently no mechanism to collect and store visitor information for follow-up
- **Analytics:** No tracking of chatbot usage, common questions, or escalation patterns
- **Mobile experience:** Verify chatbot works well on mobile devices (common for contractors on job sites)

---

## 10. Implementation Phases

### Phase 1: Launch (Weeks 1-4)

**Goal:** Secure, reliable chatbot with refined persona and proper architecture.

| Task | Details |
|---|---|
| Backend proxy | Azure Function to proxy Claude API calls; remove API key from client-side code |
| Persona update | Implement the persona definition from `precision-chatbot-persona.md` |
| System prompt refinement | Incorporate FAQ content, guardrails, escalation rules |
| Fallback improvements | Expand keyword matching for cases when API is unavailable |
| Testing | Test against top 20 most common questions; verify escalation triggers work |
| Mobile QA | Verify chat experience on iOS and Android browsers |
| Disclaimer | Add AI identification to greeting |

**Success criteria:**
- API key not exposed in client-side code
- Chatbot correctly answers 90%+ of common questions
- Escalation triggers fire correctly
- Response time < 3 seconds

### Phase 2: Enhanced (Weeks 5-12)

**Goal:** Lead capture, analytics, and continuous improvement.

| Task | Details |
|---|---|
| Lead capture form | Collect name, email/phone, project type, timeline within chat flow |
| Lead storage | Azure Table Storage or simple database for captured leads |
| Email notifications | Auto-email the team when a lead is captured or escalation triggered |
| Analytics dashboard | Track: conversations/day, top questions, escalation rate, lead capture rate |
| CRM integration | If applicable, push captured leads to existing CRM system |
| Conversation history | Store anonymized conversations for quality review and prompt improvement |
| A/B testing | Test different greetings, response styles, and lead capture prompts |
| Knowledge base expansion | Add terminology glossary, seasonal content, expanded FAQ |

**Success criteria:**
- Lead capture rate > 15% of conversations
- Average conversation length > 3 messages (indicates engagement)
- Escalation rate < 10% of conversations
- Team receives lead notifications within 5 minutes

---

## 11. Cost Estimate

### Phase 1
- Azure Function: Free tier covers expected volume (up to 1M executions/month)
- Claude API: ~$20-50/month estimated based on moderate chat volume
- Development time: 15-25 hours

### Phase 2
- Azure Table Storage: < $5/month
- Additional Azure Function for lead processing: covered by free tier
- Analytics tooling: depends on approach (basic custom dashboard vs. third-party)
- Development time: 30-50 hours

### Ongoing
- Claude API usage: scales with traffic, monitor monthly
- Content updates: 2-4 hours/quarter for FAQ and knowledge base maintenance
- Prompt tuning: periodic adjustments based on conversation review

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| API key exposed in client code | High (current state) | High | Phase 1 priority: backend proxy |
| Chatbot gives incorrect information | Medium | High | Guardrails, human review of conversations, disclaimer |
| Low adoption / visitors ignore chatbot | Medium | Low | Test positioning, greeting variations, mobile experience |
| High API costs from abuse | Low | Medium | Rate limiting on proxy, conversation length limits |
| Chatbot creates negative impression | Low | High | Professional persona, thorough testing, easy escalation to human |
