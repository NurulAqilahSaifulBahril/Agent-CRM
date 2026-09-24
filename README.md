# Agent-CRM

An app to assist agents in managing their leads/customers — tracking follow-up status, referral sources, and site visits, with a click-to-WhatsApp flow for contacting customers.

Built with Next.js (JavaScript, App Router). Currently uses in-memory mock data; a Postgres-backed API is planned. Targeted for eventual packaging as an Electron desktop app.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3010](http://localhost:3010) to view it. (Port 3000 is avoided because another local app on the dev machine uses it.)

## Building

```bash
npm run build
```

A normal build (`npm run build`) is a standard Next.js build. The Netlify preview deploy sets `NEXT_EXPORT=true` (see `netlify.toml`) to produce a static export in `out/`; in that mode only the seeded lead pages exist, so newly added leads won't have detail pages.
