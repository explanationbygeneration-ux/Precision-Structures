# Precision Structures Inc. — Website

Static marketing website for Precision Structures Inc., a family-owned truss manufacturer in Hooper, Utah (est. 1990).

**Stack:** Static HTML / CSS / JavaScript
**Deployment:** Azure Static Web Apps via GitHub Actions

---

## Local Development

No build tools required. Serve the root directory with any static server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code — install "Live Server" extension, right-click index.html → Open with Live Server
```

Then open `http://localhost:8000`.

---

## Branch Strategy

| Branch    | Purpose                        | Deploys To                          |
|-----------|--------------------------------|-------------------------------------|
| `main`    | Production                     | Live site (Azure SWA production)    |
| `develop` | Staging / integration testing  | Preview URL (Azure SWA staging)     |
| `feature/*` | Feature branches off develop | PR preview environments             |

**Workflow:**
1. Create feature branches from `develop`
2. Open PR to `develop` → auto-generates preview URL
3. Merge to `develop` → deploys to staging
4. When ready for production, PR from `develop` → `main`
5. Merge to `main` → deploys to production

---

## Deployment — Azure Static Web Apps

### Initial Setup

1. **Create Azure Static Web App** in the Azure Portal
   - Link to this GitHub repository
   - Set `main` as the production branch
   - App location: `/`
   - API location: `api`
   - Output location: (leave empty)

2. **Add GitHub Secret**
   - Azure will auto-create the GitHub Actions workflow, but we already have one at `.github/workflows/azure-static-web-apps.yml`
   - Copy the deployment token from Azure Portal → Static Web Apps → your app → Manage deployment token
   - Add it as a GitHub repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`

3. **Staging environment**
   - Push to `develop` branch → Azure SWA automatically creates a staging/preview environment
   - PRs to `main` also get preview URLs

### Configuration

- `staticwebapp.config.json` — routing rules, security headers, MIME types
- `.github/workflows/azure-static-web-apps.yml` — CI/CD pipeline

---

## Project Structure

```
├── .github/workflows/         GitHub Actions CI/CD
│   └── azure-static-web-apps.yml
├── api/                       Azure Functions (future backend)
│   └── README.md
├── css/
│   └── style.css              Master stylesheet
├── images/                    Gallery and content images
├── js/
│   ├── main.js                Core JS (nav, scroll reveal, gallery, calculator)
│   └── chatbot.js             AI chatbot widget (Claude-powered)
├── index.html                 Home page
├── about.html                 About / company history
├── services.html              Services detail
├── gallery.html               Photo gallery with lightbox
├── contact.html               Contact form + info
├── resources.html             AI tools, estimate calculator, terminology
├── Logo.PNG                   Company logo
├── staticwebapp.config.json   Azure SWA configuration
├── robots.txt                 Search engine directives
├── sitemap.xml                SEO sitemap
└── .gitignore
```

---

## Future Backend / API

The `api/` directory is reserved for Azure Functions. When ready:

- **Contact form** → Azure Function to receive submissions, send email via SendGrid, store in Cosmos DB
- **Chatbot proxy** → Azure Function to proxy Claude API calls (keeps API key server-side)
- **File uploads** → Azure Function + Blob Storage for blueprint uploads
- **CRM integration** → Webhook from contact function to CRM system

Azure Static Web Apps natively integrates with the `api/` directory — no separate deployment needed.

---

## Key URLs

| Resource | Value |
|----------|-------|
| Phone | (801) 985-3000 |
| Bids | bids@precisionstructures.net |
| General | contact@precisionstructures.net |
| Address | 5333 S. 5500 W., Hooper, UT 84315 |
| Facebook | facebook.com/Precisionstructures/ |
| Instagram | instagram.com/precision_structures_ut/ |
