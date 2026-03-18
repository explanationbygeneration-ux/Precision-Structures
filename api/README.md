# API Directory — Azure Functions

This directory is reserved for Azure Functions that will serve as the backend API for the Precision Structures website.

## Current Status
Not yet implemented. The site currently runs as a pure static site.

## Planned Functions
When ready, add Azure Functions here for:
- **Contact form handler** (`/api/contact`) — receives form submissions, sends email notifications, stores in database
- **Chatbot proxy** (`/api/chat`) — proxies requests to Claude API to keep the API key server-side
- **File upload handler** (`/api/upload`) — handles blueprint uploads to Azure Blob Storage

## Setup
1. Install Azure Functions Core Tools: `npm i -g azure-functions-core-tools@4`
2. Initialize: `func init --worker-runtime node --language javascript`
3. Create a function: `func new --name contact --template "HTTP trigger"`
4. Local settings go in `local.settings.json` (gitignored)
5. Test locally: `func start`

Azure Static Web Apps automatically discovers and deploys functions in this directory.
