# Agentic YouTube Automation

This workspace contains a Next.js application (`web/`) that automates metadata generation and direct uploads to YouTube via the Data API v3. The project is optimized for deployment on Vercel using the production domain `agentic-b0043f5e.vercel.app`.

## Contents

- `web/` – Next.js 14 app with App Router, API routes for metadata drafting and YouTube uploads, and a polished dashboard UI.
- `.env.example` – Environment variables required for authenticated uploads.

## Quick Start

```bash
cd web
npm install
cp .env.example .env.local  # supply real OAuth credentials
npm run dev
```

The UI is available at `http://localhost:3000`. Use the metadata assistant to draft titles, descriptions, and tags, attach a video file, choose privacy, and upload.

## Deployment

Compile locally before deployment:

```bash
cd web
npm run lint
npm run build
```

When ready, deploy to Vercel:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-b0043f5e
```

After deployment completes, verify the production site:

```bash
curl https://agentic-b0043f5e.vercel.app
```

Ensure that the Vercel project is configured with the same Google OAuth environment variables listed in `.env.example` so the upload endpoint can authenticate successfully.
