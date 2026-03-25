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
├── admin/                     Admin portal (login + dashboard)
│   ├── index.html             Login / first-time setup
│   ├── portal.html            Admin dashboard
│   ├── css/admin.css          Admin styles
│   └── js/                    Admin JS (auth, portal logic)
├── api/                       Azure Functions backend
│   ├── src/functions/         API endpoints (auth, content, users, audit, setup)
│   ├── src/shared/            Shared modules (db, auth, audit)
│   └── package.json           Node.js dependencies
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

## Admin Portal & API

The `api/` directory contains Azure Functions that power the admin portal at `/admin/`.

### Features
- **Authentication** — JWT-based login with bcrypt password hashing and rate limiting
- **Content management** — Edit, submit, approve/reject workflow for page content
- **User management** — Admin can create/update/deactivate users with role-based access (viewer, editor, admin)
- **Audit logging** — All actions are logged with user, action, target, and IP

### Database: Azure Cosmos DB

The API uses **Azure Cosmos DB** for persistent storage (replaces the original JSON file approach).

**Containers:**
| Container | Partition Key | Purpose |
|-----------|--------------|---------|
| `users` | `/id` | User accounts and credentials |
| `snapshots` | `/page` | Content versions and approval workflow |
| `audit` | `/id` | Audit trail of all portal actions |
| `media` | `/id` | Media/gallery metadata |

Containers are created automatically on first API call via `createIfNotExists`.

### Azure Setup

1. **Create Cosmos DB account** in Azure Portal (free tier: 1000 RU/s, 25 GB)
   - API: NoSQL (Core)
   - Capacity mode: Serverless or Provisioned (free tier)

2. **Configure app settings** in Azure Portal → Static Web Apps → your app → Configuration:
   ```
   COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
   COSMOS_KEY=your-primary-key
   COSMOS_DATABASE=precision-portal
   JWT_SECRET=a-strong-random-secret-min-32-chars
   ```

3. **Local development** — copy `api/local.settings.example.json` to `api/local.settings.json` and fill in your values:
   ```bash
   cp api/local.settings.example.json api/local.settings.json
   # Edit api/local.settings.json with your Cosmos DB credentials
   ```

### API Endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/setup` | None | Check if first-time setup needed |
| POST | `/api/setup` | None | Create first admin account |
| POST | `/api/auth/login` | None | Login, get JWT tokens |
| POST | `/api/auth/refresh` | None | Refresh access token |
| POST | `/api/auth/me` | Bearer | Get current user profile |
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/{id}` | Admin | Update user role/status |
| DELETE | `/api/users/{id}` | Admin | Deactivate user |
| GET | `/api/content/{page}/{area}` | Editor+ | Get published content |
| PUT | `/api/content/{page}/{area}` | Editor+ | Save content draft |
| GET | `/api/content/{page}/{area}/history` | Editor+ | Content version history |
| POST | `/api/content/{page}/{area}/submit/{id}` | Editor+ | Submit for approval |
| POST | `/api/content/{page}/{area}/approve/{id}` | Admin | Approve & publish |
| POST | `/api/content/{page}/{area}/reject/{id}` | Admin | Reject with notes |
| GET | `/api/content/pending` | Admin | List submitted content |
| GET | `/api/audit` | Admin | Audit log (paginated) |

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
