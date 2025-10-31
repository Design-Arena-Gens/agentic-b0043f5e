# Automation Upload for YouTube

Automation Studio enables you to generate optimized metadata and upload videos directly to YouTube through a single web dashboard. It is built with Next.js 14 and is ready to deploy to Vercel.

## Prerequisites

- Node.js 18+
- Google Cloud project with YouTube Data API v3 enabled
- OAuth 2.0 credentials with `https://www.googleapis.com/auth/youtube.upload` scope and a refresh token

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in Google OAuth values:
   ```bash
   cp .env.example .env.local
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000`.

## Usage

1. Enter a topic and optional keywords, then click **Generate metadata** to draft a title, description, and tags.
2. Drop a video file, review the metadata, pick a privacy level, and press **Upload to YouTube**.
3. The upload uses the configured OAuth refresh token; the response includes the video URL when successful.

## Scripts

- `npm run dev` – development server
- `npm run lint` – lint with ESLint
- `npm run build` – production build
- `npm start` – run the production server locally

## Deployment

Set the same environment variables in your Vercel project, then deploy with:
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-b0043f5e
```
